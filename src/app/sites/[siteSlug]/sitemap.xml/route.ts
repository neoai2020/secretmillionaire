import { createPublicSupabaseClient } from "@/lib/supabase-public";
import { getAppUrl } from "@/lib/brand-vars";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ siteSlug: string }> };

export async function GET(_request: Request, { params }: Props) {
  const { siteSlug } = await params;
  const supabase = createPublicSupabaseClient();
  const base = process.env.NEXT_PUBLIC_APP_URL || getAppUrl();

  const { data: site } = await supabase
    .from("sites")
    .select("id")
    .eq("slug", siteSlug)
    .eq("status", "live")
    .maybeSingle();

  if (!site) {
    return new Response("Not found", { status: 404 });
  }

  const { data: posts } = await supabase
    .from("posts")
    .select("slug, created_at")
    .eq("site_id", site.id)
    .eq("status", "live");

  const urls = (posts ?? [])
    .map(
      (p) => `  <url>
    <loc>${base}/sites/${siteSlug}/${p.slug}</loc>
    <lastmod>${new Date(p.created_at).toISOString()}</lastmod>
  </url>`
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${base}/sites/${siteSlug}</loc>
  </url>
${urls}
</urlset>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml" },
  });
}
