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

async function resetQueue() {
  try {
    console.log("🧹 Clearing existing queue...");

    // Delete all existing entries
    const { error: deleteError } = await supabaseAdmin
      .from("scraping_queue")
      .delete()
      .gte("id", 0); // Delete all rows

    if (deleteError) {
      console.error("❌ Delete error:", deleteError);
      return;
    }

    console.log("✅ Queue cleared");

    // Add real venue URL
    const { data, error: insertError } = await supabaseAdmin
      .from("scraping_queue")
      .insert({
        url: "https://www.flipout.co.uk/locations/london-wandsworth/",
        status: "pending",
      })
      .select();

    if (insertError) {
      console.error("❌ Insert error:", insertError);
    } else {
      console.log("✅ Added real Flipout URL:", data);
    }

    // Verify the queue
    const { data: queue, error: selectError } = await supabaseAdmin
      .from("scraping_queue")
      .select("*");

    if (selectError) {
      console.error("❌ Select error:", selectError);
    } else {
      console.log("📋 Current queue:");
      queue?.forEach((item, index) => {
        console.log(`${index + 1}. ${item.url} - ${item.status}`);
      });
    }
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

resetQueue();
