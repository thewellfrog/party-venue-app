const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkData() {
  try {
    console.log("Checking Supabase connection...");
    console.log(
      "URL:",
      process.env.NEXT_PUBLIC_SUPABASE_URL ? "Set" : "Missing"
    );
    console.log(
      "Key:",
      process.env.SUPABASE_SERVICE_ROLE_KEY ? "Set" : "Missing"
    );

    // Check scraping queue with details
    const { data: queue, error: queueError } = await supabaseAdmin
      .from("scraping_queue")
      .select("*")
      .order("created_at", { ascending: false });

    if (queueError) {
      console.error("Queue error:", queueError);
      return;
    }

    console.log("\n=== SCRAPING QUEUE ===");
    console.log(`Found ${queue?.length || 0} items`);

    queue?.forEach((item, index) => {
      console.log(`${index + 1}. ${item.url}`);
      console.log(`   Status: ${item.status}`);
      console.log(`   Has scraped_data: ${item.scraped_data ? "YES" : "NO"}`);
      console.log(
        `   Has extracted_data: ${item.extracted_data ? "YES" : "NO"}`
      );
      console.log(`   Created: ${item.created_at}`);
      if (item.processed_at) {
        console.log(`   Processed: ${item.processed_at}`);
      }
      if (item.error_message) {
        console.log(`   Error: ${item.error_message}`);
      }
      if (item.scraped_data) {
        console.log(
          `   Scraped data length: ${
            JSON.stringify(item.scraped_data).length
          } chars`
        );
      }
      console.log("");
    });

    // Check venues table
    const { data: venues, error: venuesError } = await supabaseAdmin
      .from("venues")
      .select("*");

    if (venuesError) {
      console.error("Venues error:", venuesError);
      return;
    }

    console.log("=== VENUES TABLE ===");
    console.log(`Found ${venues?.length || 0} venues`);

    if (venues && venues.length > 0) {
      venues.forEach((venue, index) => {
        console.log(`${index + 1}. ${venue.name} (${venue.slug})`);
        console.log(`   City: ${venue.city}`);
        console.log(`   Created: ${venue.created_at}`);
        console.log("");
      });
    } else {
      console.log("No venues found in database");
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

checkData();
