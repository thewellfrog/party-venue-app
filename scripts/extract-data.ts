#!/usr/bin/env tsx

import { config } from 'dotenv'
import { existsSync } from 'fs'
import { join } from 'path'
import OpenAI from 'openai'
import { createClient } from '@supabase/supabase-js'

// Load environment variables
const envLocalPath = join(process.cwd(), '.env.local')
if (existsSync(envLocalPath)) {
  config({ path: envLocalPath })
}

// Create Supabase admin client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const EXTRACTION_PROMPT = `
Extract detailed party venue information from this website content. Focus on information parents need for children's parties.

Return as JSON with these fields:
- Basic info: name, address, phone, email, website
- Location details: 
  - Full address with postcode
  - For London venues: identify the borough (e.g., Hackney, Camden, Islington)
- Parking: free/paid, number of spaces, street parking notes
- Safety: staff certifications, DBS checks, first aid, staff ratios
- Capacity: max children, max adults, age ranges
- Party packages: 
  - Name, price structure (base price for X kids + additional child cost)
  - Exact duration (including setup/cleanup time)
  - What's included (specific activities, food items, decorations)
  - What's NOT included or costs extra
  - Deposit and booking requirements
- Food: provided/BYO, allergy handling, dietary options
- Parent info: must stay?, seating areas, cafe, wifi
- Rules: outside decorations allowed?, exclusive hire?, other parties same time?
- Booking: how far in advance, cancellation policy

Rate confidence 0-1 for each field extracted.
If information is ambiguous or unclear, note this in the confidence score.

Return the response in this exact JSON format:
{
  "venue": {
    "name": "string",
    "description": "string",
    "address_line_1": "string",
    "address_line_2": "string or null",
    "city": "string",
    "borough": "string or null",
    "postcode": "string",
    "phone": "string or null",
    "email": "string or null",
    "website": "string or null",
    "parking_info": "string or null",
    "parking_free": "boolean or null",
    "max_children": "number or null",
    "max_adults": "number or null",
    "min_age": "number or null", 
    "max_age": "number or null",
    "venue_type": ["soft_play", "trampoline", "bowling", "swimming", "other"],
    "safety_certifications": ["string array"],
    "staff_dbs_checked": "boolean or null",
    "first_aid_trained": "boolean or null",
    "food_provided": "boolean or null",
    "outside_food_allowed": "boolean or null",
    "allergy_accommodations": "boolean or null",
    "allergy_info": "string or null",
    "private_party_room": "boolean or null",
    "adults_must_stay": "boolean or null"
  },
  "packages": [
    {
      "name": "string",
      "description": "string",
      "base_price": "number or null",
      "base_includes_children": "number or null",
      "additional_child_price": "number or null",
      "duration_minutes": "number or null",
      "activities_included": ["string array"],
      "food_included": ["string array"],
      "additional_costs": ["string array"],
      "deposit_required": "number or null",
      "advance_booking_days": "number or null"
    }
  ],
  "confidence_score": "number 0-1",
  "extraction_notes": "string"
}

Website content:
`

async function extractVenueData(html: string, url: string): Promise<any> {
  try {
    console.log(`Extracting data for: ${url}`)
    
    // Clean and truncate HTML for API
    const cleanText = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 8000) // Limit to avoid token limits

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: EXTRACTION_PROMPT + cleanText
        }
      ],
      temperature: 0.1,
      max_tokens: 2000,
    })

    const response = completion.choices[0]?.message?.content
    if (!response) {
      throw new Error('No response from OpenAI')
    }

    // Try to parse JSON response
    let extractedData
    try {
      extractedData = JSON.parse(response)
    } catch (parseError) {
      console.error('Failed to parse OpenAI response as JSON:', response)
      throw new Error('Invalid JSON response from OpenAI')
    }

    return extractedData

  } catch (error) {
    console.error('Error in OpenAI extraction:', error)
    return {
      venue: null,
      packages: [],
      confidence_score: 0,
      extraction_notes: `Extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}

async function processVenueForExtraction(item: any) {
  try {
    console.log(`Processing venue: ${item.url}`)

    if (!item.raw_html) {
      console.log('No HTML content found, skipping...')
      return
    }

    // Extract data with OpenAI
    const extractedData = await extractVenueData(item.raw_html, item.url)

    // Update the scraping queue with extracted data
    const { error } = await supabaseAdmin
      .from('scraping_queue')
      .update({
        extracted_data: extractedData,
        confidence_score: extractedData.confidence_score || 0,
        status: extractedData.venue ? 'review' : 'failed',
        processed_at: new Date().toISOString()
      })
      .eq('id', item.id)

    if (error) {
      console.error('Error updating database:', error)
    } else {
      console.log(`✓ Extracted data for: ${item.url} (confidence: ${extractedData.confidence_score})`)
    }

    // Add small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000))

  } catch (error) {
    console.error(`Error processing ${item.url}:`, error)
    
    await supabaseAdmin
      .from('scraping_queue')
      .update({
        status: 'failed',
        error_message: error instanceof Error ? error.message : 'Unknown error',
        processed_at: new Date().toISOString()
      })
      .eq('id', item.id)
  }
}

async function main() {
  console.log('Starting OpenAI data extraction...')

  if (!process.env.OPENAI_API_KEY) {
    console.error('OPENAI_API_KEY environment variable is required')
    process.exit(1)
  }

  // Get venues that have been scraped but not processed
  const { data: items, error } = await supabaseAdmin
    .from('scraping_queue')
    .select('*')
    .eq('status', 'completed')
    .is('extracted_data', null)
    .limit(10) // Process in small batches
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching items:', error)
    return
  }

  if (!items || items.length === 0) {
    console.log('No items ready for extraction')
    return
  }

  console.log(`Found ${items.length} items ready for extraction`)

  // Process items sequentially to avoid rate limiting
  for (const item of items) {
    await processVenueForExtraction(item)
  }

  // Get final stats
  const { data: stats } = await supabaseAdmin
    .from('scraping_queue')
    .select('status')

  const statusCounts = stats?.reduce((acc: any, item: any) => {
    acc[item.status] = (acc[item.status] || 0) + 1
    return acc
  }, {})

  console.log('\nExtraction complete!')
  console.log('Status counts:', statusCounts)
}

if (require.main === module) {
  main().catch(console.error)
}