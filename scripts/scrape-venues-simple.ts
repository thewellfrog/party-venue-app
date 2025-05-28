#!/usr/bin/env tsx

import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') })

console.log('Scrape venues script - simplified version for now')
console.log('This will be implemented in the next phase with full Playwright integration')