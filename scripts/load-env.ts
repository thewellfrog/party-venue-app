#!/usr/bin/env tsx

import { config } from 'dotenv'
import { existsSync } from 'fs'
import { join } from 'path'

// Load environment variables from .env.local
const envLocalPath = join(process.cwd(), '.env.local')
const envPath = join(process.cwd(), '.env')

console.log('🔍 Loading environment variables...')

if (existsSync(envLocalPath)) {
  console.log('📁 Found .env.local file')
  config({ path: envLocalPath })
} else if (existsSync(envPath)) {
  console.log('📁 Found .env file')  
  config({ path: envPath })
} else {
  console.log('❌ No .env.local or .env file found')
  console.log('💡 Please create .env.local with your Supabase credentials:')
  console.log(`
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
OPENAI_API_KEY=your_openai_key
`)
  process.exit(1)
}

// Verify variables are loaded
const requiredVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY', 
  'SUPABASE_SERVICE_ROLE_KEY',
  'OPENAI_API_KEY'
]

let allPresent = true

for (const varName of requiredVars) {
  const value = process.env[varName]
  if (value) {
    console.log(`✅ ${varName}: ${value.substring(0, 20)}...`)
  } else {
    console.log(`❌ ${varName}: Missing`)
    allPresent = false
  }
}

if (!allPresent) {
  console.log('❌ Missing required environment variables')
  process.exit(1)
}

console.log('✅ All environment variables loaded successfully!')
export {}