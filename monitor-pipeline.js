#!/usr/bin/env node
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function monitorPipeline() {
  try {
    console.log("🔍 Pipeline Status Monitor");
    console.log("========================");

    // Check scraping queue
    const { data: queue, error: queueError } = await supabaseAdmin
      .from("scraping_queue")
      .select("*")
      .order("created_at", { ascending: false });

    if (queueError) {
      console.error("❌ Queue error:", queueError);
      return;
    }

    console.log(`\n📦 Scraping Queue: ${queue?.length || 0} items`);

    if (queue && queue.length > 0) {
      const statusCounts = {};
      queue.forEach((item) => {
        statusCounts[item.status] = (statusCounts[item.status] || 0) + 1;
      });

      console.log("📈 Status breakdown:");
      Object.entries(statusCounts).forEach(([status, count]) => {
        const emoji =
          status === "completed"
            ? "✅"
            : status === "pending"
            ? "⏳"
            : status === "processing"
            ? "🔄"
            : "❌";
        console.log(`   ${emoji} ${status}: ${count}`);
      });

      console.log("\n📝 Recent URLs:");
      queue.slice(0, 5).forEach((item, index) => {
        const emoji =
          item.status === "completed"
            ? "✅"
            : item.status === "pending"
            ? "⏳"
            : item.status === "processing"
            ? "🔄"
            : "❌";
        console.log(`   ${index + 1}. ${emoji} ${item.url}`);
        console.log(
          `      Status: ${item.status}, Has data: ${
            item.scraped_data ? "Yes" : "No"
          }`
        );
      });
    }

    // Check venues
    const { data: venues, error: venuesError } = await supabaseAdmin
      .from("venues")
      .select("*");

    if (venuesError) {
      console.error("❌ Venues error:", venuesError);
    } else {
      console.log(`\n🏢 Venues: ${venues?.length || 0} created`);
      if (venues && venues.length > 0) {
        venues.slice(0, 3).forEach((venue, index) => {
          console.log(`   ${index + 1}. ${venue.name} (${venue.city})`);
        });
      }
    }

    // Check packages
    const { data: packages, error: packagesError } = await supabaseAdmin
      .from("party_packages")
      .select("*");

    if (packagesError) {
      console.error("❌ Packages error:", packagesError);
    } else {
      console.log(`\n📦 Packages: ${packages?.length || 0} created`);
      if (packages && packages.length > 0) {
        packages.slice(0, 3).forEach((pkg, index) => {
          console.log(`   ${index + 1}. ${pkg.name} - £${pkg.price}`);
        });
      }
    }

    console.log("\n🎯 Pipeline Progress:");
    const completed =
      queue?.filter((item) => item.status === "completed").length || 0;
    const pending =
      queue?.filter((item) => item.status === "pending").length || 0;
    const processing =
      queue?.filter((item) => item.status === "processing").length || 0;
    const failed =
      queue?.filter((item) => item.status === "failed").length || 0;

    console.log(`   URLs ready for scraping: ${pending}`);
    console.log(`   URLs being scraped: ${processing}`);
    console.log(`   URLs scraped successfully: ${completed}`);
    console.log(`   URLs failed: ${failed}`);
    console.log(`   Venues extracted: ${venues?.length || 0}`);
    console.log(`   Packages extracted: ${packages?.length || 0}`);

    if (completed > 0 && (venues?.length || 0) === 0) {
      console.log(
        "\n⚠️  Note: Scraped data exists but no venues extracted yet."
      );
      console.log("   Run: npm run scrape:extract");
    }
  } catch (error) {
    console.error("❌ Monitor error:", error.message);
  }
}

monitorPipeline();
