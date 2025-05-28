#!/usr/bin/env node

const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function showFinalResults() {
  console.log("🎉 Party Venue Directory - Final Results");
  console.log("========================================\n");

  try {
    // Get queue statistics
    const { data: queueItems, error: queueError } = await supabaseAdmin
      .from("scraping_queue")
      .select("*")
      .order("created_at", { ascending: false });

    if (queueError) {
      console.error("❌ Queue check failed:", queueError);
      return;
    }

    // Get venues
    const { data: venues, error: venuesError } = await supabaseAdmin
      .from("venues")
      .select("*")
      .order("created_at", { ascending: false });

    if (venuesError) {
      console.error("❌ Venues check failed:", venuesError);
      return;
    }

    // Get packages
    const { data: packages, error: packagesError } = await supabaseAdmin
      .from("party_packages")
      .select("*")
      .order("created_at", { ascending: false });

    if (packagesError) {
      console.error("❌ Packages check failed:", packagesError);
      return;
    }

    // Calculate statistics
    const queueStats =
      queueItems?.reduce((acc, item) => {
        acc[item.status] = (acc[item.status] || 0) + 1;
        return acc;
      }, {}) || {};

    // Display results
    console.log("📊 PIPELINE STATISTICS");
    console.log("----------------------");
    console.log(`📦 Total URLs processed: ${queueItems?.length || 0}`);

    Object.entries(queueStats).forEach(([status, count]) => {
      const emoji =
        status === "completed"
          ? "✅"
          : status === "review"
          ? "👀"
          : status === "pending"
          ? "⏳"
          : status === "processing"
          ? "🔄"
          : "❌";
      console.log(`   ${emoji} ${status}: ${count}`);
    });

    console.log(`\n🏢 VENUES CREATED: ${venues?.length || 0}`);
    console.log(`📦 PACKAGES CREATED: ${packages?.length || 0}`);

    if (venues && venues.length > 0) {
      console.log("\n🎯 EXTRACTED VENUES:");
      console.log("-------------------");
      venues.forEach((venue, index) => {
        console.log(`${index + 1}. ${venue.name}`);
        console.log(
          `   📍 ${venue.address_line_1}, ${venue.city} ${venue.postcode || ""}`
        );
        console.log(`   🌐 ${venue.website || "No website"}`);
        console.log(`   📞 ${venue.phone || "No phone"}`);

        if (venue.max_children) {
          console.log(`   👥 Max children: ${venue.max_children}`);
        }

        if (venue.parking_info) {
          console.log(`   🚗 Parking: ${venue.parking_info}`);
        }

        console.log(
          `   ⭐ Quality score: ${(venue.data_quality_score * 100).toFixed(0)}%`
        );
        console.log("");
      });

      if (packages && packages.length > 0) {
        console.log("🎁 PARTY PACKAGES:");
        console.log("------------------");

        const packagesByVenue = packages.reduce((acc, pkg) => {
          if (!acc[pkg.venue_id]) acc[pkg.venue_id] = [];
          acc[pkg.venue_id].push(pkg);
          return acc;
        }, {});

        venues.forEach((venue) => {
          const venuePackages = packagesByVenue[venue.id] || [];
          if (venuePackages.length > 0) {
            console.log(`\n📍 ${venue.name}:`);
            venuePackages.forEach((pkg, index) => {
              console.log(`   ${index + 1}. ${pkg.name}`);
              if (pkg.price) console.log(`      💷 £${pkg.price}`);
              if (pkg.price_per_child)
                console.log(`      💷 £${pkg.price_per_child} per child`);
              if (pkg.max_children)
                console.log(`      👥 Max ${pkg.max_children} children`);
              if (pkg.duration_minutes)
                console.log(`      ⏱️  ${pkg.duration_minutes} minutes`);
              if (pkg.includes && pkg.includes.length > 0) {
                console.log(
                  `      ✅ Includes: ${pkg.includes.slice(0, 3).join(", ")}${
                    pkg.includes.length > 3 ? "..." : ""
                  }`
                );
              }
            });
          }
        });
      }
    }

    // Show URLs that were processed
    if (queueItems && queueItems.length > 0) {
      console.log("\n🔗 PROCESSED URLs:");
      console.log("------------------");
      queueItems.forEach((item, index) => {
        const emoji =
          item.status === "completed"
            ? "✅"
            : item.status === "review"
            ? "👀"
            : item.status === "pending"
            ? "⏳"
            : item.status === "processing"
            ? "🔄"
            : "❌";
        console.log(`${index + 1}. ${emoji} ${item.url}`);
        if (item.error_message) {
          console.log(`   ⚠️  Error: ${item.error_message}`);
        }
        if (item.confidence_score) {
          console.log(
            `   📊 Confidence: ${(item.confidence_score * 100).toFixed(0)}%`
          );
        }
      });
    }

    // Calculate costs
    const completedItems =
      queueItems?.filter(
        (item) => item.status === "completed" || item.status === "review"
      ).length || 0;
    const estimatedCost = completedItems * 0.015;

    console.log("\n💰 COST ANALYSIS:");
    console.log("-----------------");
    console.log(`📊 URLs processed with OpenAI: ${completedItems}`);
    console.log(`💵 Estimated cost: ~$${estimatedCost.toFixed(3)}`);
    console.log(`📈 Cost per venue: ~$0.015`);

    // Success metrics
    const successRate =
      queueItems?.length > 0
        ? ((venues?.length || 0) / queueItems.length) * 100
        : 0;

    console.log("\n📈 SUCCESS METRICS:");
    console.log("------------------");
    console.log(`🎯 Venue extraction rate: ${successRate.toFixed(1)}%`);
    console.log(
      `📦 Packages per venue: ${
        venues?.length > 0
          ? ((packages?.length || 0) / venues.length).toFixed(1)
          : "0"
      }`
    );
    console.log(
      `⚡ Pipeline status: ${
        venues?.length > 0 ? "✅ OPERATIONAL" : "⚠️  NEEDS ATTENTION"
      }`
    );

    // Next steps
    console.log("\n🎯 NEXT STEPS:");
    console.log("--------------");
    if (venues?.length > 0) {
      console.log("✅ Pipeline is working! Next steps:");
      console.log("   1. 🌐 View results: http://localhost:3000/venues");
      console.log("   2. 🔍 Admin panel: http://localhost:3000/admin");
      console.log("   3. 📝 Add more URLs: npm run scrape:urls");
      console.log("   4. 🚀 Deploy to production");
    } else {
      console.log("⚠️  Pipeline needs attention:");
      console.log("   1. 🔍 Check logs for errors");
      console.log("   2. 🔄 Try different URLs: npm run reset:queue");
      console.log("   3. 🛠️  Debug extraction: npm run debug:queue");
    }

    console.log("\n🎉 Analysis complete!");
  } catch (error) {
    console.error("❌ Final results check failed:", error.message);
  }
}

showFinalResults();
