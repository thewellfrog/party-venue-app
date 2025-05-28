#!/usr/bin/env node
console.log("Starting quick test...");

// Test 1: Environment loading
require("dotenv").config({ path: ".env.local" });
console.log("✅ Environment variables loaded");

// Test 2: Check key environment variables
const envVars = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "OPENAI_API_KEY",
];

console.log("\n🔍 Environment Variable Check:");
let allPresent = true;
envVars.forEach((varName) => {
  if (process.env[varName]) {
    console.log(`✅ ${varName}: ${process.env[varName].substring(0, 20)}...`);
  } else {
    console.log(`❌ ${varName}: Missing`);
    allPresent = false;
  }
});

if (!allPresent) {
  console.log("\n❌ Some environment variables are missing. Exiting.");
  process.exit(1);
}

// Test 3: Database connection
console.log("\n🔍 Testing Database Connection...");
const { createClient } = require("@supabase/supabase-js");

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testDatabase() {
  try {
    const { data, error } = await supabaseAdmin
      .from("scraping_queue")
      .select("count")
      .limit(1);

    if (error) {
      console.log(`❌ Database error: ${error.message}`);
      return false;
    }

    console.log("✅ Database connection successful");
    return true;
  } catch (error) {
    console.log(`❌ Connection failed: ${error.message}`);
    return false;
  }
}

// Test 4: Check queue status
async function checkQueue() {
  try {
    console.log("\n🔍 Checking Scraping Queue...");

    const { data: all, error: allError } = await supabaseAdmin
      .from("scraping_queue")
      .select("*");

    if (allError) {
      console.log(`❌ Queue check failed: ${allError.message}`);
      return;
    }

    console.log(`📊 Total items in queue: ${all?.length || 0}`);

    if (all && all.length > 0) {
      const statusCounts = {};
      all.forEach((item) => {
        statusCounts[item.status] = (statusCounts[item.status] || 0) + 1;
      });

      console.log("📈 Status breakdown:");
      Object.entries(statusCounts).forEach(([status, count]) => {
        console.log(`   ${status}: ${count}`);
      });

      // Show first few items
      console.log("\n📝 First 3 items:");
      all.slice(0, 3).forEach((item, index) => {
        console.log(`   ${index + 1}. ${item.url} - Status: ${item.status}`);
      });
    }
  } catch (error) {
    console.log(`❌ Queue check failed: ${error.message}`);
  }
}

// Run tests
async function runTests() {
  const dbSuccess = await testDatabase();
  if (dbSuccess) {
    await checkQueue();
  }

  console.log("\n🏁 Quick test completed!");
}

runTests().catch((error) => {
  console.error("❌ Test failed:", error.message);
  process.exit(1);
});
