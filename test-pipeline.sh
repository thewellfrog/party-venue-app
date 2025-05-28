#!/bin/bash

echo "🚀 Party Venue App - Pipeline Reset and Test"
echo "============================================="

cd /Users/taroschenker/Documents/Dev/find-party-venues/party-venue-app

echo "1. Checking environment..."
npx tsx scripts/check-env.ts

echo ""
echo "2. Checking current queue status..."
npx tsx scripts/check-queue.ts

echo ""
echo "3. Testing OpenAI connection..."
npx tsx scripts/test-openai.ts

echo ""
echo "4. Ready to proceed with pipeline test!"
echo ""
echo "Next steps:"
echo "  - Clear the queue: Clear existing failed test URLs"  
echo "  - Add real URL: Add a working venue URL like https://www.flipout.co.uk/"
echo "  - Run scraping: npx tsx scripts/scrape-venues.ts"
echo "  - Run extraction: npx tsx scripts/extract-data.ts"
echo "  - Check results: Review venues in admin interface"
