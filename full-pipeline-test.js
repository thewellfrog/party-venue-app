#!/usr/bin/env node

const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function runFullPipelineTest() {
  console.log("🚀 Full Pipeline Test");
  console.log("=====================\n");

  try {
    // Step 1: Check initial status
    console.log("📊 Step 1: Initial Status Check");
    console.log("--------------------------------");

    const { data: initialQueue, error: queueError } = await supabaseAdmin
      .from("scraping_queue")
      .select("*")
      .order("created_at", { ascending: false });

    if (queueError) {
      console.error("❌ Queue check failed:", queueError);
      return;
    }

    console.log(`📦 Queue items: ${initialQueue?.length || 0}`);

    if (initialQueue && initialQueue.length > 0) {
      const statusCounts = {};
      initialQueue.forEach((item) => {
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

      // Show pending URLs
      const pending = initialQueue.filter((item) => item.status === "pending");
      if (pending.length > 0) {
        console.log(`\n⏳ Pending URLs (${pending.length}):`);
        pending.slice(0, 3).forEach((item, index) => {
          console.log(`   ${index + 1}. ${item.url}`);
        });
        if (pending.length > 3) {
          console.log(`   ... and ${pending.length - 3} more`);
        }
      }

      // Show completed URLs
      const completed = initialQueue.filter(
        (item) => item.status === "completed"
      );
      if (completed.length > 0) {
        console.log(`\n✅ Completed URLs (${completed.length}):`);
        completed.slice(0, 3).forEach((item, index) => {
          console.log(`   ${index + 1}. ${item.url}`);
          console.log(`      Has data: ${item.scraped_data ? "Yes" : "No"}`);
        });
      }
    }

    // Step 2: Check venues and packages
    console.log("\n📊 Step 2: Database Status Check");
    console.log("--------------------------------");

    const { data: venues, error: venuesError } = await supabaseAdmin
      .from("venues")
      .select("*")
      .order("created_at", { ascending: false });

    if (venuesError) {
      console.error("❌ Venues check failed:", venuesError);
    } else {
      console.log(`🏢 Venues in database: ${venues?.length || 0}`);
      if (venues && venues.length > 0) {
        venues.slice(0, 3).forEach((venue, index) => {
          console.log(
            `   ${index + 1}. ${venue.name} (${venue.city || "No city"})`
          );
          console.log(`      Address: ${venue.address || "No address"}`);
        });
      }
    }

    const { data: packages, error: packagesError } = await supabaseAdmin
      .from("party_packages")
      .select("*")
      .order("created_at", { ascending: false });

    if (packagesError) {
      console.error("❌ Packages check failed:", packagesError);
    } else {
      console.log(`📦 Packages in database: ${packages?.length || 0}`);
      if (packages && packages.length > 0) {
        packages.slice(0, 3).forEach((pkg, index) => {
          console.log(
            `   ${index + 1}. ${pkg.name} - £${pkg.price || "No price"}`
          );
        });
      }
    }

    // Step 3: Pipeline recommendations
    console.log("\n🎯 Step 3: Pipeline Recommendations");
    console.log("-----------------------------------");

    const pendingCount =
      initialQueue?.filter((item) => item.status === "pending").length || 0;
    const completedCount =
      initialQueue?.filter((item) => item.status === "completed").length || 0;
    const venueCount = venues?.length || 0;
    const packageCount = packages?.length || 0;

    if (pendingCount > 0) {
      console.log(`⏳ ${pendingCount} URLs ready for scraping`);
      console.log("   → Run: npm run scrape:venues");
    }

    if (completedCount > 0 && venueCount === 0) {
      console.log(`✅ ${completedCount} URLs scraped but no venues extracted`);
      console.log("   → Run: npm run scrape:extract");
    }

    if (completedCount > 0 && venueCount > 0) {
      console.log(
        `🎉 Pipeline working! ${venueCount} venues extracted from ${completedCount} scraped URLs`
      );
      if (packageCount > 0) {
        console.log(`📦 ${packageCount} packages also extracted`);
      }
    }

    if (pendingCount === 0 && completedCount === 0) {
      console.log("📭 No URLs in queue");
      console.log("   → Run: npm run reset:queue (to add test URLs)");
      console.log("   → Or run: npm run scrape:urls (to collect new URLs)");
    }

    // Step 4: Cost estimation
    if (completedCount > 0 || pendingCount > 0) {
      console.log("\n💰 Step 4: Cost Estimation");
      console.log("--------------------------");

      const totalUrls = completedCount + pendingCount;
      const estimatedCost = totalUrls * 0.015; // ~$0.015 per venue for OpenAI

      console.log(`📊 Total URLs to process: ${totalUrls}`);
      console.log(`💵 Estimated OpenAI cost: ~$${estimatedCost.toFixed(3)}`);
      console.log(`📝 Cost breakdown: ~$0.015 per venue extraction`);
    }

    console.log("\n✨ Pipeline test complete!");
  } catch (error) {
    console.error("❌ Pipeline test failed:", error.message);
  }
}

runFullPipelineTest();
