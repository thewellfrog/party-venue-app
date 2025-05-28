#!/usr/bin/env tsx

import { chromium, Browser, Page } from 'playwright'
import { supabaseAdmin } from '../src/lib/supabase'
import { ScrapingQueueItem } from '../src/lib/types'

// Scraping patterns by domain for common venue websites
const scrapingPatterns: Record<string, any> = {
  default: {
    pages: ['/', '/parties', '/kids-parties', '/birthday-parties', '/pricing', '/packages'],
    selectors: {
      prices: ['.price', '.package-price', '[data-price]', 'td:contains("£")', '.cost'],
      packages: ['.package', '.party-package', '.option', '.plan'],
      contact: ['[href^="tel:"]', '.contact', '.phone', '.email'],
      address: ['.address', '.location', '.venue-address'],
      hours: ['.hours', '.opening-times', '.opening-hours']
    }
  },
  // Add domain-specific patterns as discovered
  'hollywoodbowl.co.uk': {
    pages: ['/kids-parties', '/birthday-parties'],
    priceSelector: '.party-package-price',
    requiresJS: true
  },
  'tenpin.co.uk': {
    pages: ['/parties/kids'],
    requiresJS: true
  }
}

async function getScrapingPattern(url: string) {
  try {
    const domain = new URL(url).hostname
    return scrapingPatterns[domain] || scrapingPatterns.default
  } catch {
    return scrapingPatterns.default
  }
}

async function scrapePage(page: Page, url: string): Promise<{
  html: string;
  text: string;
  screenshot?: Buffer;
  error?: string;
}> {
  try {
    console.log(`Scraping: ${url}`)
    
    await page.goto(url, { 
      waitUntil: 'networkidle',
      timeout: 30000 
    })
    
    // Wait for content to load
    await page.waitForTimeout(2000)
    
    // Extract content
    const html = await page.content()
    const text = await page.textContent('body') || ''
    
    // Take screenshot for review
    const screenshot = await page.screenshot({ 
      fullPage: true,
      type: 'png'
    })
    
    return { html, text, screenshot }
    
  } catch (error) {
    console.error(`Error scraping ${url}:`, error)
    return {
      html: '',
      text: '',
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

async function scrapeVenue(browser: Browser, item: ScrapingQueueItem) {
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  })
  
  const page = await context.newPage()
  
  try {
    const pattern = await getScrapingPattern(item.url)
    let bestResult: { html: string; text: string; screenshot?: Buffer; error?: string } = { 
      html: '', 
      text: '', 
      screenshot: undefined 
    }
    
    // Try multiple page paths to find party information
    for (const pagePath of pattern.pages) {
      const fullUrl = item.url + (pagePath === '/' ? '' : pagePath)
      
      const result = await scrapePage(page, fullUrl)
      
      if (!result.error && result.text.length > bestResult.text.length) {
        bestResult = result
        
        // If we found party-related content, use this result
        if (result.text.toLowerCase().includes('party') || 
            result.text.toLowerCase().includes('birthday') ||
            result.text.toLowerCase().includes('package')) {
          break
        }
      }
    }
    
    // Update database with results
    const updateData: any = {
      status: bestResult.html ? 'completed' : 'failed',
      processed_at: new Date().toISOString(),
      raw_html: bestResult.html || null,
    }
    
    if (bestResult.error) {
      updateData.error_message = bestResult.error
    }
    
    const { error } = await supabaseAdmin
      .from('scraping_queue')
      .update(updateData)
      .eq('id', item.id)
    
    if (error) {
      console.error('Error updating database:', error)
    } else {
      console.log(`✓ Scraped: ${item.url}`)
    }
    
  } catch (error) {
    console.error(`Error processing venue ${item.url}:`, error)
    
    await supabaseAdmin
      .from('scraping_queue')
      .update({
        status: 'failed',
        error_message: error instanceof Error ? error.message : 'Unknown error',
        processed_at: new Date().toISOString()
      })
      .eq('id', item.id)
  } finally {
    await context.close()
  }
}

async function main() {
  console.log('Starting venue scraping...')
  
  // Get pending URLs
  const { data: pendingItems, error } = await supabaseAdmin
    .from('scraping_queue')
    .select('*')
    .eq('status', 'pending')
    .limit(50) // Process in batches
    .order('created_at', { ascending: true })
  
  if (error) {
    console.error('Error fetching pending items:', error)
    return
  }
  
  if (!pendingItems || pendingItems.length === 0) {
    console.log('No pending URLs to process')
    return
  }
  
  console.log(`Found ${pendingItems.length} URLs to scrape`)
  
  // Launch browser
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })
  
  try {
    // Process venues with concurrency limit
    const concurrencyLimit = 3
    const chunks = []
    
    for (let i = 0; i < pendingItems.length; i += concurrencyLimit) {
      chunks.push(pendingItems.slice(i, i + concurrencyLimit))
    }
    
    for (const chunk of chunks) {
      await Promise.all(
        chunk.map(item => scrapeVenue(browser, item))
      )
    }
    
  } finally {
    await browser.close()
  }
  
  // Final stats
  const { data: stats } = await supabaseAdmin
    .from('scraping_queue')
    .select('status, count(*)')
    
  console.log('\nScraping complete!')
  console.log('Final stats:', stats)
}

if (require.main === module) {
  main().catch(console.error)
}