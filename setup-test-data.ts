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

// Sample HTML content for a party venue
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

async function setupTestData() {
  try {
    console.log("🧹 Clearing existing data...");

    // Clear scraping queue
    await supabaseAdmin.from("scraping_queue").delete().gte("id", 0);

    // Clear venues and packages
    await supabaseAdmin.from("packages").delete().gte("id", 0);
    await supabaseAdmin.from("venues").delete().gte("id", 0);

    console.log("✅ Cleared existing data");

    console.log("📝 Adding test scraped data...");

    // Add a realistic scraped venue with actual HTML content
    const { data, error } = await supabaseAdmin
      .from("scraping_queue")
      .insert({
        url: "https://www.flipout.co.uk/locations/london-wandsworth/parties/",
        status: "completed",
        scraped_data: {
          html: sampleHTML,
          title: "Flipout Trampoline Park - Kids Birthday Parties",
          success: true,
        },
        processed_at: new Date().toISOString(),
      })
      .select();

    if (error) {
      console.error("❌ Insert error:", error);
      return;
    }

    console.log("✅ Added test scraped data");

    // Verify the data was added
    const { data: queue } = await supabaseAdmin
      .from("scraping_queue")
      .select("*");

    console.log("📋 Current queue:");
    queue?.forEach((item, index) => {
      console.log(`${index + 1}. ${item.url}`);
      console.log(`   Status: ${item.status}`);
      console.log(`   Has scraped_data: ${item.scraped_data ? "YES" : "NO"}`);
      console.log(
        `   Has extracted_data: ${item.extracted_data ? "YES" : "NO"}`
      );
    });
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

setupTestData();
