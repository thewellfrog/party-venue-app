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

Please return ONLY valid JSON in this exact format:
{
  "venue": {
    "name": "string",
    "address": "string",
    "city": "string",
    "postcode": "string or null",
    "borough": "string or null",
    "phone": "string or null",
    "email": "string or null",
    "website": "string or null",
    "max_children": "number or null",
    "max_adults": "number or null",
    "min_age": "number or null",
    "max_age": "number or null",
    "parking_available": "boolean or null",
    "parking_cost": "string or null",
    "parking_spaces": "number or null",
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
<!DOCTYPE html>
<html>
<head>
    <title>Flipout Trampoline Park - Kids Birthday Parties</title>
</head>
<body>
    <h1>Kids Birthday Parties at Flipout</h1>
    <p>Welcome to Flipout Trampoline Park in London Wandsworth! We offer amazing birthday party packages for children.</p>
    
    <div class="contact-info">
        <h2>Contact Information</h2>
        <p>Address: 142 Wandsworth High Street, London SW18 4JJ</p>
        <p>Phone: 020 8875 1200</p>
        <p>Email: wandsworth@flipout.co.uk</p>
        <p>Website: www.flipout.co.uk</p>
    </div>
    
    <div class="party-packages">
        <h2>Party Packages</h2>
        
        <div class="package">
            <h3>Basic Party Package</h3>
            <p>Perfect for smaller groups</p>
            <ul>
                <li>90 minutes of trampolining fun</li>
                <li>Party room for 30 minutes</li>
                <li>Basic party food included</li>
                <li>Party host provided</li>
                <li>Up to 10 children included</li>
                <li>Additional children: £12 each</li>
            </ul>
            <p class="price">From £180 for 10 children</p>
        </div>
        
        <div class="package">
            <h3>Premium Party Package</h3>
            <p>The ultimate party experience</p>
            <ul>
                <li>2 hours of trampolining and activities</li>
                <li>Private party room for 45 minutes</li>
                <li>Hot food and drinks included</li>
                <li>Dedicated party host and assistant</li>
                <li>Up to 15 children included</li>
                <li>Additional children: £15 each</li>
                <li>Party decorations included</li>
                <li>Birthday cake cutting ceremony</li>
            </ul>
            <p class="price">From £280 for 15 children</p>
        </div>
    </div>
    
    <div class="venue-info">
        <h2>Venue Information</h2>
        <p>Maximum capacity: 40 children per party</p>
        <p>Age range: 4-16 years old</p>
        <p>Free parking available on site (20 spaces)</p>
        <p>All staff are DBS checked and first aid trained</p>
        <p>Private party rooms available</p>
        <p>Adults must stay during the party</p>
        <p>Outside food not allowed due to allergy policies</p>
        <p>We can accommodate most allergies with advance notice</p>
    </div>
    
    <div class="booking">
        <h2>Booking Information</h2>
        <p>Advance booking required: minimum 7 days</p>
        <p>Deposit required: £50 (refundable)</p>
        <p>Weekend bookings fill up quickly - book early!</p>
    </div>
</body>
</html>
`;

async function testExtraction() {
  try {
    console.log("🤖 Testing OpenAI extraction with sample venue data...");

    // Clean and truncate HTML for API
    const cleanText = sampleHTML
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 8000); // Limit to 8000 chars for cost efficiency

    console.log(`Sending ${cleanText.length} characters to OpenAI...`);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: EXTRACTION_PROMPT + cleanText,
        },
      ],
      temperature: 0,
      max_tokens: 2000,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error("No response from OpenAI");
    }

    console.log("✅ Raw OpenAI response:");
    console.log(response);

    try {
      const extractedData = JSON.parse(response);
      console.log("\n✅ Parsed extraction result:");
      console.log(JSON.stringify(extractedData, null, 2));

      console.log("\n📊 Summary:");
      console.log(`- Venue name: ${extractedData.venue?.name || "Not found"}`);
      console.log(`- Address: ${extractedData.venue?.address || "Not found"}`);
      console.log(`- Packages found: ${extractedData.packages?.length || 0}`);
      console.log(
        `- Confidence score: ${
          extractedData.confidence_score || "Not provided"
        }`
      );

      console.log("\n💰 Token usage:");
      console.log(`- Prompt tokens: ${completion.usage?.prompt_tokens}`);
      console.log(
        `- Completion tokens: ${completion.usage?.completion_tokens}`
      );
      console.log(`- Total tokens: ${completion.usage?.total_tokens}`);

      const estimatedCost =
        ((completion.usage?.prompt_tokens || 0) * 0.00015 +
          (completion.usage?.completion_tokens || 0) * 0.0006) /
        1000;
      console.log(`- Estimated cost: $${estimatedCost.toFixed(4)}`);
    } catch (parseError) {
      console.error("❌ Failed to parse JSON response:", parseError);
      console.log("Raw response was:", response);
    }
  } catch (error) {
    console.error("❌ Extraction error:", error);
  }
}

testExtraction();
