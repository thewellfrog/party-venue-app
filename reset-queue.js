const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function resetQueue() {
  try {
    console.log("Clearing existing queue...");

    // Clear the existing URLs
    const { error: deleteError } = await supabaseAdmin
      .from("scraping_queue")
      .delete()
      .neq("id", 0);

    if (deleteError) {
      console.error("Delete error:", deleteError);
      return;
    }

    console.log("✅ Cleared existing queue");

    // Add real venue URLs that should work
    const realUrls = [
      "https://www.flipout.co.uk/locations/london-wandsworth/",
      "https://www.tumbleinthejungle.co.uk/parties/",
    ];

    for (const url of realUrls) {
      const { error: insertError } = await supabaseAdmin
        .from("scraping_queue")
        .insert({
          url: url,
          status: "pending",
        });

      if (insertError) {
        console.error(`Error adding ${url}:`, insertError);
      } else {
        console.log(`✅ Added ${url}`);
      }
    }

    console.log("Queue reset complete!");
  } catch (error) {
    console.error("Error:", error);
  }
}

resetQueue();
