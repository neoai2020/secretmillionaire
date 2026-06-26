import type { MetadataRoute } from "next";
import { createPublicSupabaseClient } from "@/lib/supabase-public";
import { getAppUrl } from "@/lib/brand-vars";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_APP_URL || getAppUrl();
  const supabase = createPublicSupabaseClient();

  const { data: sites } = await supabase.from("sites").select("slug, created_at").eq("status", "live");

  const entries: MetadataRoute.Sitemap = (sites ?? []).map((site) => ({
    url: `${base}/sites/${site.slug}`,
    lastModified: new Date(site.created_at),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return entries;
}
