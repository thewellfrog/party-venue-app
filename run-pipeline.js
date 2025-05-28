#!/usr/bin/env node

const { spawn } = require("child_process");
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function runCommand(command, args = []) {
  return new Promise((resolve, reject) => {
    console.log(`🔄 Running: ${command} ${args.join(" ")}`);

    const process = spawn(command, args, {
      stdio: "inherit",
      cwd: __dirname,
    });

    process.on("close", (code) => {
      if (code === 0) {
        console.log(`✅ Command completed: ${command} ${args.join(" ")}`);
        resolve();
      } else {
        console.log(
          `❌ Command failed with code ${code}: ${command} ${args.join(" ")}`
        );
        reject(new Error(`Command failed with code ${code}`));
      }
    });

    process.on("error", (error) => {
      console.error(`❌ Command error:`, error);
      reject(error);
    });
  });
}

async function checkQueueStatus() {
  try {
    const { data: queue, error } = await supabaseAdmin
      .from("scraping_queue")
      .select("*");

    if (error) {
      console.error("❌ Queue check failed:", error);
      return { pending: 0, completed: 0, failed: 0 };
    }

    const pending =
      queue?.filter((item) => item.status === "pending").length || 0;
    const completed =
      queue?.filter((item) => item.status === "completed").length || 0;
    const failed =
      queue?.filter((item) => item.status === "failed").length || 0;

    return { pending, completed, failed, total: queue?.length || 0 };
  } catch (error) {
    console.error("❌ Status check error:", error);
    return { pending: 0, completed: 0, failed: 0 };
  }
}

async function checkVenuesStatus() {
  try {
    const { data: venues, error } = await supabaseAdmin
      .from("venues")
      .select("*");

    if (error) {
      console.error("❌ Venues check failed:", error);
      return 0;
    }

    return venues?.length || 0;
  } catch (error) {
    console.error("❌ Venues check error:", error);
    return 0;
  }
}

async function runAutomatedPipeline() {
  console.log("🤖 Automated Pipeline Runner");
  console.log("============================\n");

  try {
    // Step 1: Check initial status
    console.log("📊 Step 1: Checking current status...");
    const initialStatus = await checkQueueStatus();
    const initialVenues = await checkVenuesStatus();

    console.log(`📦 Queue: ${initialStatus.total} items`);
    console.log(`   ⏳ Pending: ${initialStatus.pending}`);
    console.log(`   ✅ Completed: ${initialStatus.completed}`);
    console.log(`   ❌ Failed: ${initialStatus.failed}`);
    console.log(`🏢 Venues: ${initialVenues}`);

    // Step 2: Reset queue if needed
    if (initialStatus.pending === 0 && initialStatus.completed === 0) {
      console.log("\n🧹 Step 2: Queue is empty, adding test URLs...");
      await runCommand("node", ["reset-and-add-urls.js"]);
    } else {
      console.log("\n✅ Step 2: Queue has URLs, skipping reset");
    }

    // Step 3: Run scraper if there are pending URLs
    const statusAfterReset = await checkQueueStatus();
    if (statusAfterReset.pending > 0) {
      console.log(`\n🕷️  Step 3: Scraping ${statusAfterReset.pending} URLs...`);
      await runCommand("npm", ["run", "scrape:venues"]);
    } else {
      console.log("\n✅ Step 3: No pending URLs to scrape");
    }

    // Step 4: Run extraction if there are completed URLs
    const statusAfterScraping = await checkQueueStatus();
    const venuesAfterScraping = await checkVenuesStatus();

    if (statusAfterScraping.completed > 0 && venuesAfterScraping === 0) {
      console.log(
        `\n🧠 Step 4: Extracting data from ${statusAfterScraping.completed} scraped URLs...`
      );
      await runCommand("npm", ["run", "scrape:extract"]);
    } else if (venuesAfterScraping > 0) {
      console.log(
        `\n✅ Step 4: ${venuesAfterScraping} venues already extracted`
      );
    } else {
      console.log("\n⏭️  Step 4: No completed URLs to extract");
    }

    // Step 5: Final status
    console.log("\n📊 Step 5: Final Results");
    console.log("------------------------");

    const finalStatus = await checkQueueStatus();
    const finalVenues = await checkVenuesStatus();

    const { data: packages } = await supabaseAdmin
      .from("party_packages")
      .select("*");
    const packageCount = packages?.length || 0;

    console.log(`📦 Final Queue Status:`);
    console.log(`   ⏳ Pending: ${finalStatus.pending}`);
    console.log(`   ✅ Completed: ${finalStatus.completed}`);
    console.log(`   ❌ Failed: ${finalStatus.failed}`);
    console.log(`🏢 Venues extracted: ${finalVenues}`);
    console.log(`📦 Packages extracted: ${packageCount}`);

    if (finalVenues > 0) {
      console.log("\n🎉 SUCCESS! Pipeline completed successfully!");
      console.log(`   → ${finalVenues} venues extracted`);
      console.log(`   → ${packageCount} packages extracted`);
      console.log(`   → View at: http://localhost:3000/venues`);
    } else if (finalStatus.completed > 0) {
      console.log(
        "\n⚠️  Partial success: URLs scraped but no venues extracted"
      );
      console.log("   → Check extraction logs for errors");
    } else {
      console.log("\n❌ Pipeline needs attention");
      console.log("   → Check scraping logs for errors");
    }
  } catch (error) {
    console.error("\n❌ Automated pipeline failed:", error.message);
    console.log("\n🔍 Troubleshooting steps:");
    console.log("   1. Check environment variables: npm run debug:status");
    console.log("   2. Check queue manually: npm run debug:queue");
    console.log("   3. Run pipeline test: npm run test:pipeline");
  }
}

runAutomatedPipeline();
