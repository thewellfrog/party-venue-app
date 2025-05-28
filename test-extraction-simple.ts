#!/usr/bin/env tsx

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { existsSync } from "fs";
import OpenAI from "openai";
import { join } from "path";

// Load environment variables
const envLocalPath = join(process.cwd(), ".env.local");
if (existsSync(envLocalPath)) {
  config({ path: envLocalPath });
}

// Create Supabase admin client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase credentials");
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Simple test data
const testVenueHTML = `
<html>
<head><title>Flip Out Wandsworth - Kids Birthday Parties</title></head>
<body>
<h1>Birthday Parties at Flip Out Wandsworth</h1>
<p>Address: 123 Armoury Way, Wandsworth, London SW18 1EZ</p>
<p>Phone: 020 8877 0077</p>
<p>Email: wandsworth@flipout.co.uk</p>

<h2>Ultimate Party Package</h2>
<p>90 minutes of trampolining fun</p>
<p>£28 per child (minimum 8 children)</p>
<p>Includes pizza, drinks, ice cream, and private party room</p>
<p>Ages 4-17, maximum 20 children</p>

<h2>Basic Jump Package</h2>
<p>60 minutes trampolining</p>
<p>£18 per child (minimum 6 children)</p>
<p>Includes drinks and snacks</p>

<h2>Safety</h2>
<p>All staff DBS checked and first aid trained</p>
<p>Adult supervision required for under 8s</p>

<h2>Booking</h2>
<p>£60 deposit required, book 2 weeks in advance</p>
<p>Free parking available (40 spaces)</p>
</body>
</html>
`;

const EXTRACTION_PROMPT = `
Extract party venue information from this website content. Return valid JSON with this structure:

{
  "venue": {
    "name": "string",
    "address": "string", 
    "city": "string",
    "postcode": "string or null",
    "phone": "string or null",
    "email": "string or null",
    "website": "string",
    "parking_type": "free/paid/street/none",
    "min_age": "number or null",
    "max_age": "number or null", 
    "max_children": "number or null"
  },
  "packages": [
    {
      "name": "string",
      "description": "string",
      "base_price": "number or null",
      "base_includes_children": "number or null",
      "duration_minutes": "number or null"
    }
  ],
  "confidence_score": "number 0-1"
}

Website content:
`;

async function testExtraction() {
  try {
    console.log("🧪 Testing OpenAI extraction...");

    if (!process.env.OPENAI_API_KEY) {
      console.error("❌ OPENAI_API_KEY not found");
      return;
    }

    // Clean the HTML
    const cleanText = testVenueHTML
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    console.log("📄 Processing", cleanText.length, "characters");

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: EXTRACTION_PROMPT + cleanText,
        },
      ],
      temperature: 0.3,
      max_tokens: 1500,
    });

    const content = response.choices[0]?.message?.content?.trim();

    if (!content) {
      console.error("❌ No response from OpenAI");
      return;
    }

    console.log("🤖 Raw OpenAI Response:");
    console.log(content);
    console.log("");

    // Try to parse as JSON
    try {
      const parsed = JSON.parse(content);
      console.log("✅ Successfully parsed JSON!");
      console.log("📋 Venue name:", parsed.venue?.name);
      console.log("📍 Location:", parsed.venue?.city);
      console.log("📞 Phone:", parsed.venue?.phone);
      console.log("📦 Packages found:", parsed.packages?.length);

      if (parsed.packages?.length > 0) {
        console.log("💰 Package prices:");
        parsed.packages.forEach((pkg, i) => {
          console.log(`  ${i + 1}. ${pkg.name}: £${pkg.base_price || "N/A"}`);
        });
      }

      console.log("🎯 Confidence:", parsed.confidence_score);
      console.log("");
      console.log("💰 Estimated API cost: ~$0.008");

      // Test saving to database
      const { data, error } = await supabaseAdmin
        .from("scraping_queue")
        .insert({
          url: "https://test.flipout.co.uk/test",
          status: "completed",
          scraped_data: { raw_html: testVenueHTML },
          extracted_data: parsed,
          confidence_score: parsed.confidence_score || 0.8,
          processed_at: new Date().toISOString(),
        })
        .select();

      if (error) {
        console.error("❌ Database error:", error);
      } else {
        console.log("✅ Successfully saved to database!");
        console.log("🎉 End-to-end extraction test successful!");
      }
    } catch (parseError) {
      console.error("❌ JSON parsing failed:", parseError);
      console.log("Raw content:", content);
    }
  } catch (error) {
    console.error("❌ Extraction error:", error);
  }
}

if (require.main === module) {
  testExtraction().catch(console.error);
}
