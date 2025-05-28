#!/usr/bin/env tsx

import { config } from 'dotenv'
import { existsSync, readFileSync } from 'fs'
import { join } from 'path'
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
  console.log('Required variables:')
  console.log('- NEXT_PUBLIC_SUPABASE_URL')
  console.log('- SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function setupDatabase() {
  try {
    console.log('🚀 Setting up Party Venue Directory database...')
    console.log(`🔗 Connected to: ${supabaseUrl}`)
    
    // Test connection first
    console.log('\n🔍 Testing database connection...')
    
    // Test basic connection with a simple query
    const { data: connectionTest, error: connectionError } = await supabaseAdmin
      .rpc('now')
    
    if (connectionError) {
      console.log('⚠️  Direct RPC test failed, trying table check instead...')
    }
    
    console.log('✅ Database connection successful!')
    
    // Check if tables exist
    console.log('\n🔍 Checking for existing tables...')
    
    const tablesToCheck = ['venues', 'party_packages', 'scraping_queue']
    const tableStatus: Record<string, boolean> = {}
    
    for (const tableName of tablesToCheck) {
      try {
        const { data, error } = await supabaseAdmin
          .from(tableName)
          .select('*')
          .limit(1)
        
        tableStatus[tableName] = !error
        
        if (error) {
          console.log(`❌ ${tableName} - Not found`)
        } else {
          console.log(`✅ ${tableName} - Ready`)
        }
      } catch (err) {
        tableStatus[tableName] = false
        console.log(`❌ ${tableName} - Not found`)
      }
    }
    
    const allTablesExist = Object.values(tableStatus).every(Boolean)
    
    if (allTablesExist) {
      console.log('\n🎉 All tables are set up and ready!')
      console.log('🚀 You can now start scraping with:')
      console.log('   npm run scrape:urls')
    } else {
      console.log('\n⚠️  Some tables are missing. Manual setup required:')
      console.log('\n📋 Setup Instructions:')
      console.log('   1. Go to your Supabase dashboard')
      console.log('   2. Navigate to SQL Editor')
      console.log('   3. Copy and paste the contents of supabase/schema.sql')
      console.log('   4. Execute the SQL')
      console.log('   5. Run this script again to verify')
      
      // Show the schema file location
      const schemaPath = join(process.cwd(), 'supabase', 'schema.sql')
      console.log(`\n📁 Schema file location: ${schemaPath}`)
    }
    
  } catch (error) {
    console.error('❌ Database setup failed:', error)
    console.log('\n🔧 Troubleshooting:')
    console.log('   1. Check your .env.local file has the correct Supabase URL and service key')
    console.log('   2. Ensure your Supabase project is active')
    console.log('   3. Verify your service role key has the correct permissions')
  }
}

setupDatabase()