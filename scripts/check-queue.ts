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

async function checkQueue() {
  try {
    console.log('📋 Checking scraping queue status...\n')
    
    // Get total count by status
    const { data: statusCounts, error: statusError } = await supabaseAdmin
      .from('scraping_queue')
      .select('status')
    
    if (statusError) {
      throw statusError
    }
    
    const statusSummary = statusCounts.reduce((acc: Record<string, number>, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1
      return acc
    }, {})
    
    console.log('📊 Queue Summary:')
    Object.entries(statusSummary).forEach(([status, count]) => {
      console.log(`   ${status}: ${count} items`)
    })
    
    console.log(`\n📝 Total URLs: ${statusCounts.length}`)
    
    // Show recent additions
    const { data: recentItems, error: recentError } = await supabaseAdmin
      .from('scraping_queue')
      .select('url, venue_name, search_query, status, created_at')
      .order('created_at', { ascending: false })
      .limit(10)
    
    if (recentError) {
      throw recentError
    }
    
    if (recentItems.length > 0) {
      console.log('\n🕐 Recent URLs added:')
      recentItems.forEach((item, i) => {
        const domain = new URL(item.url).hostname
        console.log(`   ${i + 1}. ${domain} (${item.venue_name || 'Unknown'}) - ${item.status}`)
      })
    }
    
    // Check if we're ready for the next step
    const pendingCount = statusSummary['pending'] || 0
    
    if (pendingCount > 0) {
      console.log(`\n🚀 Ready for step 2! You have ${pendingCount} URLs ready to scrape.`)
      console.log('   Run: npm run scrape:venues')
    } else {
      console.log('\n⚠️  No pending URLs found. You may need to run URL collection first.')
      console.log('   Run: npm run scrape:urls')
    }
    
  } catch (error) {
    console.error('❌ Error checking queue:', error)
  }
}

checkQueue()