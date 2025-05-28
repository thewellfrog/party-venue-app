#!/usr/bin/env tsx

import { config } from 'dotenv'
import { existsSync } from 'fs'
import { join } from 'path'

// Load environment variables
const envLocalPath = join(process.cwd(), '.env.local')
if (existsSync(envLocalPath)) {
  config({ path: envLocalPath })
}

import { createClient } from '@supabase/supabase-js'

// Create Supabase admin client after env is loaded
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

// Comprehensive search queries for venue discovery
const searchQueries = [
  // Venue type + location combinations
  "soft play party venue london",
  "bowling party venue london", 
  "trampoline park party london",
  "laser tag party venue london",
  "swimming pool party venue london",
  "pottery painting party venue london",
  "climbing wall party venue london",
  "gymnastics party venue london",
  "martial arts party venue london",
  "dance party venue london",
  
  // London borough-specific searches
  "kids party venue hackney",
  "children's party venue camden",
  "birthday party venue islington",
  "party venue tower hamlets",
  "kids party venue newham",
  "party venue wandsworth",
  "children's party venue lambeth",
  "birthday party venue southwark",
  "party venue richmond",
  "kids party venue ealing",
  
  // Other major UK cities
  "party venue manchester",
  "kids party birmingham", 
  "children's party glasgow",
  "birthday party venue edinburgh",
  "party venue liverpool",
  "kids party leeds",
  "children's party venue bristol",
  "birthday party venue cardiff",
  "party venue nottingham",
  "kids party sheffield",
  
  // Generic searches
  "children's birthday party venues uk",
  "kids party venues near me",
  "birthday party venues for children",
  "soft play centres uk",
  "trampoline parks uk",
  "bowling alleys kids parties",
  "swimming pool birthday parties",
]

// Search DuckDuckGo for venue URLs
async function searchDuckDuckGo(query: string): Promise<string[]> {
  console.log(`Searching for: ${query}`)
  
  try {
    const duckDuckGo = await import('duck-duck-scrape')
    const results = await duckDuckGo.search(query, {
      safeSearch: duckDuckGo.SafeSearchType.STRICT
    })
    
    if (!results.results) {
      console.log('No results found')
      return []
    }
    
    // Extract URLs and filter for likely venue websites
    const urls = results.results
      .slice(0, 10) // Take first 10 results
      .map(result => result.url)
      .filter(url => {
        // Filter out unwanted domains
        const unwantedDomains = [
          'facebook.com', 'youtube.com', 'instagram.com', 'twitter.com',
          'yelp.com', 'tripadvisor.', 'google.com', 'wikipedia.org',
          'indeed.com', 'reed.co.uk', 'gumtree.com'
        ]
        
        return !unwantedDomains.some(domain => url.includes(domain))
      })
    
    console.log(`Found ${urls.length} potential venue URLs`)
    
    // Add delay to be respectful
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    return urls
    
  } catch (error) {
    console.error(`Error searching for "${query}":`, error)
    return []
  }
}

async function saveUrlsToDatabase(urls: string[], searchQuery: string) {
  for (const url of urls) {
    // Check if URL already exists
    const { data: existing } = await supabaseAdmin
      .from('scraping_queue')
      .select('id')
      .eq('url', url)
      .single()
    
    if (!existing) {
      const { error } = await supabaseAdmin
        .from('scraping_queue')
        .insert({
          url,
          search_query: searchQuery,
          status: 'pending',
          created_at: new Date().toISOString()
        })
      
      if (error) {
        console.error(`Error saving URL ${url}:`, error.message)
      }
    }
  }
  
  console.log(`Processed ${urls.length} URLs for query: ${searchQuery}`)
}

async function main() {
  console.log('Starting URL collection...')
  console.log(`Will process ${searchQueries.length} search queries`)
  
  let totalUrls = 0
  
  for (const query of searchQueries) {
    try {
      const urls = await searchDuckDuckGo(query)
      await saveUrlsToDatabase(urls, query)
      totalUrls += urls.length
    } catch (error) {
      console.error(`Error processing query "${query}":`, error)
    }
  }
  
  console.log(`\nCollection complete!`)
  console.log(`Total URLs collected: ${totalUrls}`)
  
  // Get stats from database
  const { data: stats } = await supabaseAdmin
    .from('scraping_queue')
    .select('status')
    // Note: Group by would need raw SQL or separate queries
  
  console.log('Database stats:', stats)
}

if (require.main === module) {
  main().catch(console.error)
}