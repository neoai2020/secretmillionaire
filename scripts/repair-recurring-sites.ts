/**
 * Repair all Recurring Wealth sites (cloned + templates).
 * Usage: npx tsx scripts/repair-recurring-sites.ts
 */
import { readFileSync } from "fs";
import { createClient } from "@supabase/supabase-js";
import { repairAllRecurringWealthSites, repairRecurringSite } from "../src/features/blog-builder/lib/recurring-site-repair";

function loadEnvFile(path: string) {
  try {
    const content = readFileSync(path, "utf8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq <= 0) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    /* optional */
  }
}

loadEnvFile(".env.local");
loadEnvFile(".env");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

if (!process.env.PIXABAY_API_KEY) {
  console.warn("[repair] PIXABAY_API_KEY not set — stock images may fall back to AI/picsum");
}

const admin = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

/** Repair one site by slug (or all Recurring Wealth sites). */
async function main() {
  const slug = process.argv[2]?.trim();
  console.log(
    slug
      ? `[repair] Re-running image repair for site: ${slug}`
      : "[repair] Starting full Recurring Wealth repair (sites + templates)…"
  );
  const started = Date.now();

  if (slug) {
    const { data: siteRow } = await admin.from("sites").select("*").eq("slug", slug).maybeSingle();
    if (!siteRow?.template_key?.startsWith("recurring-")) {
      console.error("Not a Recurring Wealth site:", slug);
      process.exit(1);
    }
    const result = await repairRecurringSite({ admin, site: siteRow as import("../src/features/blog-builder/types").BlogSite });
    console.log(JSON.stringify({ ...result, elapsedSeconds: Math.round((Date.now() - started) / 1000) }, null, 2));
    return;
  }

  const summary = await repairAllRecurringWealthSites({
    admin,
    includeTemplates: true,
  });

  const elapsed = Math.round((Date.now() - started) / 1000);
  console.log(JSON.stringify({ ...summary, elapsedSeconds: elapsed }, null, 2));
}

main().catch((err) => {
  console.error("[repair] failed:", err);
  process.exit(1);
});
