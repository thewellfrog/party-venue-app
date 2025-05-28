#!/usr/bin/env node

const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Known good venue URLs for testing
const testUrls = [
  "https://www.flipout.co.uk/locations/london-wandsworth/",
  "https://www.thetrampolinepark.co.uk/london/",
  "https://www.alllstarssports.co.uk/birthday-parties/",
  "https://www.gambado.co.uk/party-packages/",
  "https://www.theclimb.co.uk/kids-parties/",
];

async function setupTestUrls() {
  try {
    console.log("🧹 Clearing existing queue...");

    // Clear existing queue
    const { error: deleteError } = await supabaseAdmin
      .from("scraping_queue")
      .delete()
      .gte("id", 0);

    if (deleteError) {
      console.error("❌ Error clearing queue:", deleteError);
      return;
    }

    console.log("✅ Queue cleared");
    console.log("📝 Adding test URLs...");

    // Add test URLs
    for (const url of testUrls) {
      const { error } = await supabaseAdmin.from("scraping_queue").insert({
        url,
        search_query: "manual_test_urls",
        status: "pending",
      });

      if (error) {
        console.error(`❌ Error adding ${url}:`, error.message);
      } else {
        console.log(`✅ Added: ${url}`);
      }
    }

    console.log("\n🎉 Test URLs setup complete!");
    console.log("📊 URLs ready for scraping:", testUrls.length);

    console.log("\n🚀 Next steps:");
    console.log("1. Run scraping: npm run scrape:venues");
    console.log("2. Run extraction: npm run scrape:extract");
    console.log("3. Check results in admin interface");
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

setupTestUrls();
