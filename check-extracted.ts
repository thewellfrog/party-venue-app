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

async function checkExtractedData() {
  try {
    const { data: items, error } = await supabaseAdmin
      .from("scraping_queue")
      .select("*")
      .not("extracted_data", "is", null);

    if (error) {
      console.error("❌ Error:", error);
      return;
    }

    console.log(`Found ${items?.length || 0} items with extracted data`);

    items?.forEach((item, index) => {
      console.log(`\n${index + 1}. ${item.url}`);
      console.log(`Status: ${item.status}`);

      if (item.extracted_data) {
        console.log("Extracted data:");
        console.log(JSON.stringify(item.extracted_data, null, 2));
      }
    });
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

checkExtractedData();
