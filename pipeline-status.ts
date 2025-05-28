import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { existsSync } from "fs";
import { join } from "path";

const envLocalPath = join(process.cwd(), ".env.local");
if (existsSync(envLocalPath)) {
  config({ path: envLocalPath });
}

console.log("🚀 Starting Pipeline Status Check...");

// Check environment variables
const requiredEnvs = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "OPENAI_API_KEY",
];

console.log("\n🔍 Environment Variables:");
let envMissing = false;
requiredEnvs.forEach((env) => {
  if (process.env[env]) {
    console.log(`✅ ${env}: ${process.env[env]?.substring(0, 20)}...`);
  } else {
    console.log(`❌ ${env}: MISSING`);
    envMissing = true;
  }
});

if (envMissing) {
  console.log(
    "\n❌ Missing environment variables. Please check .env.local file."
  );
  process.exit(1);
}

// Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkPipelineStatus() {
  try {
    console.log("\n🔍 Database Connection Test...");

    // Test connection
    const { data: testData, error: testError } = await supabase
      .from("scraping_queue")
      .select("count")
      .limit(1);

    if (testError) {
      console.log(`❌ Database error: ${testError.message}`);
      return;
    }

    console.log("✅ Database connection successful");

    // Check queue status
    console.log("\n📊 Scraping Queue Status:");
    const { data: queueData, error: queueError } = await supabase
      .from("scraping_queue")
      .select("*");

    if (queueError) {
      console.log(`❌ Queue error: ${queueError.message}`);
      return;
    }

    console.log(`📦 Total items: ${queueData?.length || 0}`);

    if (queueData && queueData.length > 0) {
      // Count by status
      const statusCounts: Record<string, number> = {};
      queueData.forEach((item) => {
        statusCounts[item.status] = (statusCounts[item.status] || 0) + 1;
      });

      console.log("\n📈 Status Breakdown:");
      Object.entries(statusCounts).forEach(([status, count]) => {
        const icon =
          status === "pending" ? "⏳" : status === "completed" ? "✅" : "❌";
        console.log(`   ${icon} ${status}: ${count}`);
      });

      // Show sample items
      console.log("\n📝 Sample Items:");
      queueData.slice(0, 3).forEach((item, index) => {
        console.log(`   ${index + 1}. ${item.url}`);
        console.log(`      Status: ${item.status}`);
        console.log(`      Scraped: ${item.scraped_data ? "YES" : "NO"}`);
        console.log();
      });
    }

    // Check venues table
    console.log("🏢 Venues Table Status:");
    const { data: venuesData, error: venuesError } = await supabase
      .from("venues")
      .select("count");

    if (venuesError) {
      console.log(`❌ Venues error: ${venuesError.message}`);
    } else {
      console.log(`✅ Venues table accessible`);
    }

    const { data: venueCount, error: countError } = await supabase
      .from("venues")
      .select("*");

    if (!countError) {
      console.log(`📦 Total venues: ${venueCount?.length || 0}`);
    }

    // Next steps recommendation
    console.log("\n🎯 Recommended Next Steps:");

    const pendingItems =
      queueData?.filter((item) => item.status === "pending")?.length || 0;
    const failedItems =
      queueData?.filter((item) => item.status === "failed")?.length || 0;
    const completedItems =
      queueData?.filter((item) => item.status === "completed")?.length || 0;

    if (pendingItems > 0) {
      console.log(`   1. ▶️  Run scraper on ${pendingItems} pending URLs`);
      console.log("      Command: npm run scrape");
    } else if (failedItems > 0) {
      console.log(`   1. 🧹 Clear ${failedItems} failed URLs from queue`);
      console.log(`   2. 🔍 Add real venue URLs for testing`);
    }

    if (completedItems > 0) {
      console.log(
        `   3. 🤖 Run extraction on ${completedItems} completed items`
      );
      console.log("      Command: npm run extract");
    }

    if (queueData?.length === 0) {
      console.log("   1. 🔍 Collect venue URLs");
      console.log("      Command: npm run collect-urls");
    }
  } catch (error) {
    console.log(`❌ Pipeline check failed: ${error}`);
  }
}

checkPipelineStatus()
  .then(() => console.log("\n🏁 Pipeline status check completed"))
  .catch((error) => console.error("❌ Error:", error));
