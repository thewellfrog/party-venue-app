#!/usr/bin/env tsx

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { existsSync } from "fs";
import { join } from "path";

// Load environment variables
const envLocalPath = join(process.cwd(), ".env.local");
if (existsSync(envLocalPath)) {
  config({ path: envLocalPath });
}

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function createVenues() {
  console.log("🏢 Creating venues from extracted data...");
  console.log("=====================================\n");

  try {
    // Get items ready for venue creation (extracted but not completed)
    const { data: queueItems, error: queueError } = await supabaseAdmin
      .from("scraping_queue")
      .select("*")
      .in("status", ["review", "extracted"]);

    if (queueError) {
      console.error("❌ Error fetching queue:", queueError);
      return;
    }

    if (!queueItems || queueItems.length === 0) {
      console.log("📋 No items ready for venue creation");
      return;
    }

    console.log(`📋 Found ${queueItems.length} items ready for venue creation`);

    let successCount = 0;
    let failureCount = 0;

    for (const queueItem of queueItems) {
      try {
        const extractedData = queueItem.extracted_data;
        const venueData = extractedData?.venue;

        if (!venueData || !venueData.name) {
          console.log(`❌ No valid venue data for ${queueItem.url}`);
          failureCount++;
          continue;
        }

        console.log(`📝 Creating venue: ${venueData.name}`);

        // Generate unique slug
        const baseSlug = generateSlug(venueData.name);
        let slug = baseSlug;
        let counter = 1;

        while (true) {
          const { data: existingVenue } = await supabaseAdmin
            .from("venues")
            .select("id")
            .eq("slug", slug)
            .single();

          if (!existingVenue) break;
          slug = `${baseSlug}-${counter}`;
          counter++;
        }

        // Create venue object with only fields that exist in schema
        const venue = {
          slug,
          name: venueData.name,
          description: venueData.description || null,
          address_line_1: venueData.address_line_1 || "",
          city: venueData.city || "London",
          borough: venueData.borough || null,
          postcode: venueData.postcode || "",
          country: "UK",
          phone: venueData.phone || null,
          email: venueData.email || null,
          website: queueItem.url,
          source_url: queueItem.url,
          status: "published",
        };

        // Insert venue
        const { data: insertedVenue, error: venueError } = await supabaseAdmin
          .from("venues")
          .insert(venue)
          .select()
          .single();

        if (venueError) {
          console.error(`❌ Error creating venue:`, venueError);
          failureCount++;
          continue;
        }

        console.log(
          `✅ Created venue: ${insertedVenue.name} (ID: ${insertedVenue.id})`
        );

        // Create packages if available
        const packages = extractedData?.packages || [];
        let packageCount = 0;

        for (const packageData of packages) {
          if (!packageData.name) continue;

          const partyPackage = {
            venue_id: insertedVenue.id,
            name: packageData.name,
            description: packageData.description || null,
            base_price: packageData.base_price || null,
            status: "active",
          };

          const { error: packageError } = await supabaseAdmin
            .from("party_packages")
            .insert(partyPackage);

          if (packageError) {
            console.error(`⚠️  Package creation error:`, packageError);
          } else {
            packageCount++;
          }
        }

        console.log(`   📦 Created ${packageCount} packages`);

        // Update queue status to completed
        await supabaseAdmin
          .from("scraping_queue")
          .update({ status: "completed" })
          .eq("id", queueItem.id);

        successCount++;
      } catch (error) {
        console.error(`❌ Error processing ${queueItem.url}:`, error);
        failureCount++;
      }
    }

    console.log(`\n📊 Venue creation complete!`);
    console.log(`✅ Successfully created: ${successCount} venues`);
    console.log(`❌ Failed: ${failureCount} venues`);

    // Show final stats
    const { data: totalVenues } = await supabaseAdmin
      .from("venues")
      .select("id");

    const { data: totalPackages } = await supabaseAdmin
      .from("party_packages")
      .select("id");

    console.log(`\n🏢 Total venues in database: ${totalVenues?.length || 0}`);
    console.log(`📦 Total packages in database: ${totalPackages?.length || 0}`);
  } catch (error) {
    console.error("❌ Fatal error:", error);
  }
}

createVenues();
