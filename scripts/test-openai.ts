#!/usr/bin/env tsx

import { config } from 'dotenv'
import { existsSync } from 'fs'
import { join } from 'path'
import OpenAI from 'openai'

// Load environment variables
const envLocalPath = join(process.cwd(), '.env.local')
if (existsSync(envLocalPath)) {
  config({ path: envLocalPath })
}

const apiKey = process.env.OPENAI_API_KEY

console.log('🔍 Testing OpenAI API Key...')
console.log(`📋 Key format: ${apiKey?.substring(0, 15)}...`)

if (!apiKey) {
  console.error('❌ No OpenAI API key found')
  process.exit(1)
}

if (!apiKey.startsWith('sk-')) {
  console.error('❌ Invalid API key format. Should start with "sk-"')
  console.error(`❌ Your key starts with: "${apiKey.substring(0, 10)}..."`)
  console.error('💡 Please get a valid key from https://platform.openai.com/api-keys')
  process.exit(1)
}

const openai = new OpenAI({ apiKey })

async function testConnection() {
  try {
    console.log('🧪 Testing OpenAI connection...')
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'user', content: 'Say "Hello! OpenAI is working!" in exactly those words.' }
      ],
      max_tokens: 50
    })
    
    const response = completion.choices[0]?.message?.content
    console.log('✅ OpenAI Response:', response)
    console.log('🎉 OpenAI API is working correctly!')
    
  } catch (error) {
    console.error('❌ OpenAI API Error:', error.message)
    if (error.status === 401) {
      console.error('💡 This is an authentication error - check your API key')
    }
  }
}

testConnection()