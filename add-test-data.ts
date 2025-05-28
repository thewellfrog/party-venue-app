import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { existsSync } from "fs";
import { join } from "path";

const envLocalPath = join(process.cwd(), ".env.local");
if (existsSync(envLocalPath)) {
  config({ path: envLocalPath });
}

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Sample scraped HTML content for testing
const sampleScrapedData = `
<html>
<head><title>Flip Out Wandsworth - Kids Birthday Parties</title></head>
<body>
<h1>Birthday Parties at Flip Out Wandsworth</h1>
<p>Welcome to Flip Out Wandsworth! We're the ultimate destination for children's birthday parties.</p>
<p>Address: 123 Armoury Way, Wandsworth, London SW18 1EZ</p>
<p>Phone: 020 8877 0077</p>
<p>Email: wandsworth@flipout.co.uk</p>

<h2>Party Packages</h2>
<div class="package">
  <h3>Ultimate Party Package</h3>
  <p>90 minutes of unlimited trampolining fun!</p>
  <p>£28 per child (minimum 8 children)</p>
  <p>Includes:</p>
  <ul>
    <li>1.5 hours exclusive access to trampolines</li>
    <li>Pizza slice for each child</li>
    <li>Soft drink</li>
    <li>Ice cream dessert</li>
    <li>Private party room for 45 minutes</li>
    <li>Party host included</li>
  </ul>
  <p>Suitable for ages 4-17</p>
  <p>Maximum 20 children</p>
</div>

<div class="package">
  <h3>Basic Jump Package</h3>
  <p>60 minutes trampolining session</p>
  <p>£18 per child (minimum 6 children)</p>
  <p>Includes:</p>
  <ul>
    <li>1 hour trampoline access</li>
    <li>Soft drink</li>
    <li>Small snack</li>
  </ul>
  <p>Shared party area</p>
  <p>Ages 3-16 welcome</p>
</div>

<h2>Safety Information</h2>
<p>Safety is our top priority:</p>
<ul>
  <li>All staff are DBS checked</li>
  <li>First aid trained marshals on duty</li>
  <li>Safety briefing before jumping</li>
  <li>Adult supervision required for under 8s</li>
  <li>Maximum capacity: 25 children per party</li>
</ul>

<h2>Booking Information</h2>
<p>How to book your party:</p>
<ul>
  <li>£60 deposit required to secure booking</li>
  <li>Book minimum 2 weeks in advance</li>
  <li>Weekend slots fill up quickly</li>
  <li>Free parking available (40 spaces)</li>
  <li>Disabled access available</li>
</ul>

<h2>Food Options</h2>
<p>We can accommodate:</p>
<ul>
  <li>Gluten-free options available</li>
  <li>Nut allergies - please inform us in advance</li>
  <li>Outside food allowed for special dietary requirements</li>
  <li>Birthday cake storage and serving included</li>
</ul>

<p>Contact us today to book your amazing party!</p>
</body>
</html>
`;

async function addTestData() {
  try {
    console.log("🧪 Adding test scraped data...");

    // Clear existing queue
    await supabaseAdmin.from("scraping_queue").delete().gte("id", 0);
    console.log("✅ Cleared existing queue");

    // Add test data with scraped content
    const { data, error } = await supabaseAdmin
      .from("scraping_queue")
      .insert({
        url: "https://www.flipout.co.uk/wandsworth/parties",
        status: "completed",
        scraped_data: {
          raw_html: sampleScrapedData,
          scraped_at: new Date().toISOString(),
          page_title: "Flip Out Wandsworth - Kids Birthday Parties",
        },
        processed_at: new Date().toISOString(),
      })
      .select();

    if (error) {
      console.error("❌ Error adding test data:", error);
    } else {
      console.log("✅ Added test scraped data");
      console.log("📊 Data contains:", sampleScrapedData.length, "characters");
      console.log("🎯 Ready for extraction!");
    }
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

addTestData();
