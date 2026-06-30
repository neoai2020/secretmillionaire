import { readFileSync } from "fs";
import { createClient } from "@supabase/supabase-js";

function loadEnvFile(path: string) {
  try {
    for (const line of readFileSync(path, "utf8").split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq <= 0) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    /* optional */
  }
}

loadEnvFile(".env.local");

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

const slug = process.argv[2] ?? "youtube-ai-tools-d4bf095f";

async function main() {
  const { data: site } = await admin.from("sites").select("*").eq("slug", slug).maybeSingle();
  if (!site) {
    console.error("Site not found:", slug);
    process.exit(1);
  }

  const { data: posts } = await admin
    .from("posts")
    .select("slug, title, image_url")
    .eq("site_id", site.id)
    .order("created_at");

  const urls = (posts ?? []).map((p) => p.image_url).filter(Boolean) as string[];
  const unique = new Set(urls);
  const byBase = new Map<string, string[]>();

  for (const p of posts ?? []) {
    if (!p.image_url) continue;
    const base = p.image_url.split("/").slice(-2).join("/");
    const list = byBase.get(base) ?? [];
    list.push(p.slug);
    byBase.set(base, list);
  }

  const dupes = [...byBase.entries()].filter(([, slugs]) => slugs.length > 1);

  console.log(
    JSON.stringify(
      {
        slug: site.slug,
        hobby: site.hobby,
        territory: site.territory,
        template_key: site.template_key,
        theme: site.theme,
        posts: posts?.length ?? 0,
        withImage: urls.length,
        uniqueHeroUrls: unique.size,
        duplicateGroups: dupes.length,
        duplicates: dupes.slice(0, 10).map(([key, slugs]) => ({ file: key, count: slugs.length, slugs: slugs.slice(0, 3) })),
        sampleTitles: (posts ?? []).slice(0, 5).map((p) => p.title),
      },
      null,
      2
    )
  );
}

main();
