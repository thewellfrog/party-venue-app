import { config } from "dotenv";
import { existsSync } from "fs";
import OpenAI from "openai";
import { join } from "path";

const envLocalPath = join(process.cwd(), ".env.local");
if (existsSync(envLocalPath)) {
  config({ path: envLocalPath });
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const EXTRACTION_PROMPT = `
Extract detailed party venue information from this website content. Focus on information parents need for children's parties.

Return as JSON with these fields:
- Basic info: name, address, phone, email, website
- Location details: 
  - Full address with postcode
  - For London venues: identify the borough (e.g., Hackney, Camden, Islington)
- Parking: free/paid, number of spaces, street parking notes
- Safety: staff certifications, DBS checks, first aid, staff ratios
- Capacity: max children, max adults, age ranges
- Party packages: 
  - Name, price structure (base price for X kids + additional child cost)
  - Exact duration (including setup/cleanup time)
  - What's included (specific activities, food items, decorations)
  - What's NOT included or costs extra
  - Deposit and booking requirements

Return JSON format:
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
    "parking_spaces": "number or null",
    "min_age": "number or null",
    "max_age": "number or null", 
    "max_children": "number or null",
    "max_adults": "number or null",
    "staff_dbs_checked": "boolean or null",
    "first_aid_trained": "boolean or null",
    "food_provided": "boolean or null",
    "outside_food_allowed": "boolean or null",
    "allergy_accommodations": "boolean or null",
    "allergy_info": "string or null",
    "private_party_room": "boolean or null",
    "adults_must_stay": "boolean or null"
  },
  "packages": [
    {
      "name": "string",
      "description": "string",
      "base_price": "number or null",
      "base_includes_children": "number or null",
      "additional_child_price": "number or null",
      "duration_minutes": "number or null",
      "activities_included": ["string array"],
      "food_included": ["string array"],
      "additional_costs": ["string array"],
      "deposit_required": "number or null",
      "advance_booking_days": "number or null"
    }
  ],
  "confidence_score": "number 0-1",
  "extraction_notes": "string"
}

Website content:
`;

// Sample HTML content for testing
const sampleHTML = `
<html>
<head><title>Flip Out Wandsworth - Kids Birthday Parties</title></head>
<body>
<h1>Birthday Parties at Flip Out Wandsworth</h1>
<p>Located at: 123 High Street, Wandsworth, London SW18 2PP</p>
<p>Phone: 020 8123 4567</p>
<p>Email: wandsworth@flipout.co.uk</p>

<h2>Party Packages</h2>
<div class="package">
  <h3>Ultimate Party Package</h3>
  <p>90 minutes of unlimited trampolining fun</p>
  <p>£25 per child (minimum 8 children)</p>
  <p>Includes: Pizza slice, drink, and ice cream for each child</p>
  <p>Private party room for 30 minutes</p>
  <p>Ages 4-17 welcome</p>
</div>

<div class="package">
  <h3>Basic Party Package</h3>
  <p>60 minutes trampolining</p>
  <p>£18 per child (minimum 6 children)</p>
  <p>Includes: Drink and small snack</p>
  <p>Shared party area</p>
</div>

<h2>Safety</h2>
<p>All staff are DBS checked and first aid trained</p>
<p>Maximum 20 children per party</p>
<p>Adults must supervise children at all times</p>

<h2>Booking</h2>
<p>£50 deposit required</p>
<p>Book at least 2 weeks in advance</p>
<p>Free parking available on site (50 spaces)</p>
</body>
</html>
`;

async function testExtraction() {
  try {
    console.log("🧪 Testing OpenAI extraction with sample data...");

    if (!process.env.OPENAI_API_KEY) {
      console.error("❌ OPENAI_API_KEY not found");
      return;
    }

    console.log("✅ OpenAI API key loaded");

    // Clean the HTML
    const cleanText = sampleHTML
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    console.log("📄 Cleaned text length:", cleanText.length);

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: EXTRACTION_PROMPT + cleanText,
        },
      ],
      temperature: 0.3,
      max_tokens: 2000,
    });

    const content = response.choices[0]?.message?.content?.trim();
    console.log("🤖 OpenAI Response:");
    console.log(content);

    // Try to parse as JSON
    if (content) {
      try {
        const parsed = JSON.parse(content);
        console.log("✅ Successfully parsed JSON");
        console.log("📊 Extracted venue name:", parsed.venue?.name);
        console.log("📦 Found packages:", parsed.packages?.length);
        console.log("🎯 Confidence score:", parsed.confidence_score);
      } catch (parseError) {
        console.log("❌ Failed to parse JSON:", parseError);
      }
    }

    console.log("💰 Estimated cost: ~$0.01");
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

testExtraction();
