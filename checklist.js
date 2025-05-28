#!/usr/bin/env node

const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Checklist items with validation functions
const checklist = [
  {
    step: "1. Environment Variables",
    description: "Check that all required environment variables are loaded",
    async check() {
      const required = [
        "NEXT_PUBLIC_SUPABASE_URL",
        "NEXT_PUBLIC_SUPABASE_ANON_KEY",
        "SUPABASE_SERVICE_ROLE_KEY",
        "OPENAI_API_KEY",
      ];

      const missing = required.filter((key) => !process.env[key]);

      if (missing.length === 0) {
        return { status: "✅", message: "All environment variables are set" };
      } else {
        return { status: "❌", message: `Missing: ${missing.join(", ")}` };
      }
    },
  },

  {
    step: "2. Database Connection",
    description: "Verify Supabase database connection",
    async check() {
      try {
        const { data, error } = await supabaseAdmin
          .from("scraping_queue")
          .select("count")
          .limit(1);

        if (error) {
          return { status: "❌", message: `Database error: ${error.message}` };
        }

        return { status: "✅", message: "Database connection successful" };
      } catch (error) {
        return { status: "❌", message: `Connection failed: ${error.message}` };
      }
    },
  },

  {
    step: "3. Database Schema",
    description: "Check that required tables exist",
    async check() {
      try {
        const tables = ["scraping_queue", "venues", "packages"];
        const results = [];

        for (const table of tables) {
          const { data, error } = await supabaseAdmin
            .from(table)
            .select("count")
            .limit(1);

          if (error) {
            results.push(`${table}: ❌`);
          } else {
            results.push(`${table}: ✅`);
          }
        }

        const failed = results.filter((r) => r.includes("❌"));
        if (failed.length === 0) {
          return { status: "✅", message: "All required tables exist" };
        } else {
          return {
            status: "❌",
            message: `Table issues: ${failed.join(", ")}`,
          };
        }
      } catch (error) {
        return {
          status: "❌",
          message: `Schema check failed: ${error.message}`,
        };
      }
    },
  },

  {
    step: "4. URLs in Queue",
    description: "Check if there are URLs ready for scraping",
    async check() {
      try {
        const { data, error } = await supabaseAdmin
          .from("scraping_queue")
          .select("*")
          .eq("status", "pending");

        if (error) {
          return {
            status: "❌",
            message: `Queue check failed: ${error.message}`,
          };
        }

        if (!data || data.length === 0) {
          return {
            status: "⚠️",
            message: "No pending URLs found - need to add URLs",
          };
        }

        return {
          status: "✅",
          message: `${data.length} URLs ready for scraping`,
        };
      } catch (error) {
        return { status: "❌", message: `Queue check error: ${error.message}` };
      }
    },
  },

  {
    step: "5. Scraped Data",
    description: "Check if any URLs have been successfully scraped",
    async check() {
      try {
        const { data, error } = await supabaseAdmin
          .from("scraping_queue")
          .select("*")
          .eq("status", "completed")
          .not("scraped_data", "is", null);

        if (error) {
          return {
            status: "❌",
            message: `Scraped data check failed: ${error.message}`,
          };
        }

        if (!data || data.length === 0) {
          return {
            status: "⚠️",
            message: "No scraped data found - need to run scraping",
          };
        }

        return {
          status: "✅",
          message: `${data.length} URLs have scraped data`,
        };
      } catch (error) {
        return {
          status: "❌",
          message: `Scraped data check error: ${error.message}`,
        };
      }
    },
  },

  {
    step: "6. OpenAI API",
    description: "Test OpenAI API connection and key",
    async check() {
      try {
        const { OpenAI } = await import("openai");
        const openai = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY,
        });

        // Simple test API call
        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "user",
              content:
                "Hello, just testing the API. Please respond with 'API working'.",
            },
          ],
          max_tokens: 10,
        });

        if (completion.choices[0]?.message?.content) {
          return { status: "✅", message: "OpenAI API working correctly" };
        } else {
          return {
            status: "❌",
            message: "OpenAI API returned unexpected response",
          };
        }
      } catch (error) {
        if (error.code === "invalid_api_key") {
          return { status: "❌", message: "Invalid OpenAI API key" };
        }
        return { status: "❌", message: `OpenAI API error: ${error.message}` };
      }
    },
  },

  {
    step: "7. Extracted Data",
    description: "Check if any data has been extracted by OpenAI",
    async check() {
      try {
        const { data, error } = await supabaseAdmin
          .from("scraping_queue")
          .select("*")
          .not("extracted_data", "is", null);

        if (error) {
          return {
            status: "❌",
            message: `Extracted data check failed: ${error.message}`,
          };
        }

        if (!data || data.length === 0) {
          return {
            status: "⚠️",
            message: "No extracted data found - need to run extraction",
          };
        }

        return {
          status: "✅",
          message: `${data.length} URLs have extracted data`,
        };
      } catch (error) {
        return {
          status: "❌",
          message: `Extracted data check error: ${error.message}`,
        };
      }
    },
  },

  {
    step: "8. Venues Created",
    description: "Check if venues have been created in the database",
    async check() {
      try {
        const { data, error } = await supabaseAdmin.from("venues").select("*");

        if (error) {
          return {
            status: "❌",
            message: `Venues check failed: ${error.message}`,
          };
        }

        if (!data || data.length === 0) {
          return {
            status: "⚠️",
            message: "No venues found - extraction may have failed",
          };
        }

        return {
          status: "✅",
          message: `${data.length} venues created successfully`,
        };
      } catch (error) {
        return {
          status: "❌",
          message: `Venues check error: ${error.message}`,
        };
      }
    },
  },

  {
    step: "9. Packages Created",
    description: "Check if party packages have been created",
    async check() {
      try {
        const { data, error } = await supabaseAdmin
          .from("packages")
          .select("*");

        if (error) {
          return {
            status: "❌",
            message: `Packages check failed: ${error.message}`,
          };
        }

        if (!data || data.length === 0) {
          return {
            status: "⚠️",
            message: "No packages found - extraction may be incomplete",
          };
        }

        return {
          status: "✅",
          message: `${data.length} packages created successfully`,
        };
      } catch (error) {
        return {
          status: "❌",
          message: `Packages check error: ${error.message}`,
        };
      }
    },
  },
];

async function runChecklist() {
  console.log("🔍 Party Venue App - Pipeline Checklist");
  console.log("==========================================\n");

  const results = [];

  for (const item of checklist) {
    console.log(`Checking: ${item.step} - ${item.description}`);

    try {
      const result = await item.check();
      console.log(`${result.status} ${result.message}\n`);
      results.push({ ...item, ...result });
    } catch (error) {
      console.log(`❌ Unexpected error: ${error.message}\n`);
      results.push({
        ...item,
        status: "❌",
        message: `Unexpected error: ${error.message}`,
      });
    }
  }

  // Summary
  console.log("📊 SUMMARY");
  console.log("==========");

  const passed = results.filter((r) => r.status === "✅").length;
  const warnings = results.filter((r) => r.status === "⚠️").length;
  const failed = results.filter((r) => r.status === "❌").length;

  console.log(`✅ Passed: ${passed}`);
  console.log(`⚠️  Warnings: ${warnings}`);
  console.log(`❌ Failed: ${failed}`);

  // Next steps recommendations
  console.log("\n🚀 NEXT STEPS");
  console.log("=============");

  const failedItems = results.filter((r) => r.status === "❌");
  const warningItems = results.filter((r) => r.status === "⚠️");

  if (failedItems.length > 0) {
    console.log("❌ Fix these critical issues first:");
    failedItems.forEach((item) => {
      console.log(`   - ${item.step}: ${item.message}`);
    });
  }

  if (warningItems.length > 0 && failedItems.length === 0) {
    console.log("⚠️  Address these warnings:");
    warningItems.forEach((item) => {
      console.log(`   - ${item.step}: ${item.message}`);
    });

    // Specific next step recommendations
    if (warningItems.some((item) => item.step.includes("URLs in Queue"))) {
      console.log("\n💡 To add URLs:");
      console.log("   npm run scrape:urls  # Collect URLs from DuckDuckGo");
      console.log("   # OR manually add URLs to scraping_queue table");
    }

    if (warningItems.some((item) => item.step.includes("Scraped Data"))) {
      console.log("\n💡 To scrape venues:");
      console.log("   npm run scrape:venues");
    }

    if (warningItems.some((item) => item.step.includes("Extracted Data"))) {
      console.log("\n💡 To extract data:");
      console.log("   npm run scrape:extract");
    }
  }

  if (passed === checklist.length) {
    console.log("🎉 All checks passed! Pipeline is fully operational.");
    console.log("💡 View results at: http://localhost:3000/admin");
  }
}

runChecklist().catch(console.error);
