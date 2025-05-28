#!/usr/bin/env tsx

import { config } from 'dotenv'
import { existsSync } from 'fs'
import { join } from 'path'
import { createClient } from '@supabase/supabase-js'

// Load environment variables
const envLocalPath = join(process.cwd(), '.env.local')
if (existsSync(envLocalPath)) {
  config({ path: envLocalPath })
}

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

// Test with just a few sample URLs
const testUrls = [
  "https://www.flipout.co.uk/london/parties/",
  "https://www.trampolinepark.com/kids-parties",
  "https://www.softplay.london/birthday-parties",
  "https://www.bowling.com/kids-parties",
  "https://example-venue.co.uk/parties"
]

async function saveTestUrls() {
  console.log('🧪 Testing URL saving with sample data...')
  
  for (const url of testUrls) {
    try {
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
            search_query: 'test query',
            status: 'pending'
          })
        
        if (error) {
          console.error(`❌ Error saving URL ${url}:`, error.message)
        } else {
          console.log(`✅ Saved: ${new URL(url).hostname}`)
        }
      } else {
        console.log(`⚠️  Already exists: ${new URL(url).hostname}`)
      }
    } catch (error) {
      console.error(`❌ Error processing ${url}:`, error)
    }
  }
  
  console.log('\n📊 Testing complete! Checking queue...')
  
  // Check what we saved
  const { data: queueItems, error: queueError } = await supabaseAdmin
    .from('scraping_queue')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10)
  
  if (queueError) {
    console.error('Error checking queue:', queueError)
  } else {
    console.log(`\n📝 Found ${queueItems.length} items in queue:`)
    queueItems.forEach((item, i) => {
      const domain = new URL(item.url).hostname
      console.log(`   ${i + 1}. ${domain} - ${item.status}`)
    })
    
    if (queueItems.length > 0) {
      console.log('\n🚀 Success! Ready to proceed with venue scraping.')
      console.log('   Run: npm run scrape:venues')
    }
  }
}

saveTestUrls()