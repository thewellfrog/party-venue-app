const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Real venue URLs for testing
const realVenueUrls = [
  "https://www.partypiecesuk.co.uk/venue-hire",
  "https://www.venuestoday.com/london",
  "https://www.eventinabox.com/venues",
  "https://www.hireabouncer.co.uk/bouncy-castle-hire-london",
  "https://www.partydelights.co.uk",
];

async function resetAndAddRealUrls() {
  try {
    console.log("🔍 Current queue status...");

    // Check current queue
    const { data: currentQueue, error: queueError } = await supabaseAdmin
      .from("scraping_queue")
      .select("*");

    if (queueError) {
      console.error("❌ Queue check error:", queueError);
      return;
    }

    console.log(`📦 Found ${currentQueue?.length || 0} items in queue`);

    if (currentQueue && currentQueue.length > 0) {
      const statusCounts = {};
      currentQueue.forEach((item) => {
        statusCounts[item.status] = (statusCounts[item.status] || 0) + 1;
      });

      console.log("📈 Status breakdown:");
      Object.entries(statusCounts).forEach(([status, count]) => {
        console.log(`   ${status}: ${count}`);
      });

      // Show sample URLs
      console.log("\n📝 Current URLs:");
      currentQueue.slice(0, 3).forEach((item, index) => {
        console.log(`   ${index + 1}. ${item.url} (${item.status})`);
      });
    }

    console.log("\n🧹 Clearing failed items...");

    // Delete failed items only
    const { error: deleteError } = await supabaseAdmin
      .from("scraping_queue")
      .delete()
      .eq("status", "failed");

    if (deleteError) {
      console.error("❌ Delete error:", deleteError);
      return;
    }

    console.log("✅ Failed items cleared");

    console.log("\n🔍 Adding real venue URLs...");

    // Add real venue URLs
    const insertData = realVenueUrls.map((url) => ({
      url,
      status: "pending",
      raw_html: null,
      extracted_data: null,
    }));

    const { data: insertedData, error: insertError } = await supabaseAdmin
      .from("scraping_queue")
      .insert(insertData)
      .select();

    if (insertError) {
      console.error("❌ Insert error:", insertError);
      return;
    }

    console.log(`✅ Added ${insertedData?.length || 0} real venue URLs`);

    console.log("\n📊 Updated queue status:");
    const { data: updatedQueue } = await supabaseAdmin
      .from("scraping_queue")
      .select("*");

    console.log(`📦 Total items: ${updatedQueue?.length || 0}`);

    if (updatedQueue && updatedQueue.length > 0) {
      const statusCounts = {};
      updatedQueue.forEach((item) => {
        statusCounts[item.status] = (statusCounts[item.status] || 0) + 1;
      });

      console.log("📈 Status breakdown:");
      Object.entries(statusCounts).forEach(([status, count]) => {
        console.log(`   ${status}: ${count}`);
      });
    }

    console.log("\n🎯 Next steps:");
    console.log("   1. Run scraper: npm run scrape:venues");
    console.log("   2. Run extraction: npm run scrape:extract");
    console.log("   3. Check results: node debug-data.js");
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

resetAndAddRealUrls();
