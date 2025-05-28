#!/usr/bin/env tsx

import 'dotenv/config'

console.log('🔍 Environment Check')
console.log('===================')

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

console.log('\n📋 Summary:')
if (allPresent) {
  console.log('✅ All environment variables are present!')
  console.log('🚀 Ready to proceed with database setup')
} else {
  console.log('❌ Missing environment variables')
  console.log('💡 Please check your .env.local file')
}