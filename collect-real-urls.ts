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

// Targeted search queries for testing
const testQueries = [
  "trampoline park party london",
  "soft play party venue london",
  "bowling party venue london",
];

// Search DuckDuckGo for venue URLs
async function searchDuckDuckGo(query: string): Promise<string[]> {
  console.log(`🔍 Searching for: ${query}`);

  try {
    const duckDuckGo = await import("duck-duck-scrape");
    const results = await duckDuckGo.search(query, {
      safeSearch: duckDuckGo.SafeSearchType.STRICT,
    });

    if (!results.results) {
      console.log("No results found");
      return [];
    }

    // Extract URLs and filter for likely venue websites
    const urls = results.results
      .slice(0, 5) // Take only first 5 results for testing
      .map((result) => result.url)
      .filter((url) => {
        // Filter out unwanted domains
        const unwantedDomains = [
          "facebook.com",
          "youtube.com",
          "instagram.com",
          "twitter.com",
          "yelp.com",
          "tripadvisor.",
          "google.com",
          "wikipedia.org",
          "indeed.com",
          "reed.co.uk",
          "gumtree.com",
        ];

        return !unwantedDomains.some((domain) => url.includes(domain));
      });

    console.log(`✅ Found ${urls.length} potential venue URLs:`);
    urls.forEach((url, index) => {
      console.log(`   ${index + 1}. ${url}`);
    });

    // Add delay to be respectful
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return urls;
  } catch (error) {
    console.error(`❌ Error searching for "${query}":`, error);
    return [];
  }
}

async function main() {
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
  console.log("🔍 Starting URL collection with targeted searches...");

  let totalUrls = 0;

  for (const query of testQueries) {
    try {
      const urls = await searchDuckDuckGo(query);

      // Save URLs to database
      for (const url of urls) {
        const { error } = await supabaseAdmin.from("scraping_queue").insert({
          url,
          search_query: query,
          status: "pending",
          created_at: new Date().toISOString(),
        });

        if (error) {
          console.error(`❌ Error saving URL ${url}:`, error.message);
        } else {
          totalUrls++;
        }
      }
    } catch (error) {
      console.error(`❌ Error processing query "${query}":`, error);
    }
  }

  console.log(`\n🎉 Collection complete!`);
  console.log(`📊 Total URLs collected: ${totalUrls}`);

  // Show final queue status
  const { data: queue } = await supabaseAdmin
    .from("scraping_queue")
    .select("url, search_query")
    .order("created_at", { ascending: true });

  console.log("\n📋 URLs in queue:");
  queue?.forEach((item, index) => {
    console.log(`${index + 1}. ${item.url} (from: ${item.search_query})`);
  });

  console.log("\n🚀 Ready for next step!");
  console.log("Run: npx tsx scripts/scrape-venues.ts");
}

main().catch(console.error);
