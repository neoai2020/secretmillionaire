import { NextResponse } from "next/server";
import { featureApiGuard } from "@/lib/feature-api-guard";
import { getApiUser } from "@/lib/api-auth";
import { NO_STORE_HEADERS } from "@/lib/api-cache-headers";
import { getDailyGenerationQuota } from "@/features/blog-builder/lib/site-quota";
import type { BlogSite } from "@/features/blog-builder/types";

export const dynamic = "force-dynamic";

export interface SiteVaultSummary {
  site: BlogSite;
  postCount: number;
  livePostCount: number;
  clickCount: number;
}

function countBySite(rows: { site_id: string | null }[] | null): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const row of rows ?? []) {
    if (!row.site_id) continue;
    counts[row.site_id] = (counts[row.site_id] ?? 0) + 1;
  }
  return counts;
}

export async function GET(request: Request) {
  const guard = featureApiGuard("blog-builder");
  if (guard) return guard;

  const { supabase, user } = await getApiUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: NO_STORE_HEADERS });
  }

  const siteId = new URL(request.url).searchParams.get("siteId");
  const quota = await getDailyGenerationQuota(supabase, user.id);

  const { data: session } = await supabase
    .from("blog_builder_sessions")
    .select("site_id")
    .eq("user_id", user.id)
    .maybeSingle();

  const { data: sites } = await supabase
    .from("sites")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const siteList = (sites ?? []) as BlogSite[];
  const siteIds = siteList.map((s) => s.id);

  if (siteIds.length === 0) {
    return NextResponse.json(
      { summaries: [], site: null, posts: [], clicks: 0, quota, activeSiteId: session?.site_id ?? null },
      { headers: NO_STORE_HEADERS }
    );
  }

  const [{ data: postRows }, { data: clickRows }] = await Promise.all([
    supabase.from("posts").select("site_id, status").in("site_id", siteIds),
    supabase.from("affiliate_clicks").select("site_id").in("site_id", siteIds),
  ]);

  const postCounts = countBySite(postRows);
  const livePostCounts: Record<string, number> = {};
  for (const row of postRows ?? []) {
    if (!row.site_id || row.status !== "live") continue;
    livePostCounts[row.site_id] = (livePostCounts[row.site_id] ?? 0) + 1;
  }
  const clickCounts = countBySite(clickRows);

  const summaries: SiteVaultSummary[] = siteList.map((site) => ({
    site,
    postCount: postCounts[site.id] ?? 0,
    livePostCount: livePostCounts[site.id] ?? 0,
    clickCount: clickCounts[site.id] ?? 0,
  }));

  if (siteId) {
    const summary = summaries.find((s) => s.site.id === siteId);
    if (!summary) {
      return NextResponse.json({ error: "Site not found" }, { status: 404, headers: NO_STORE_HEADERS });
    }

    const { data: posts } = await supabase
      .from("posts")
      .select("*")
      .eq("site_id", siteId)
      .order("is_pillar", { ascending: false })
      .order("created_at", { ascending: true });

    return NextResponse.json(
      {
        summaries,
        site: summary.site,
        posts: posts ?? [],
        clicks: summary.clickCount,
        quota,
        activeSiteId: session?.site_id ?? null,
      },
      { headers: NO_STORE_HEADERS }
    );
  }

  const latest = summaries[0] ?? null;

  return NextResponse.json(
    {
      summaries,
      site: latest?.site ?? null,
      posts: [],
      clicks: latest?.clickCount ?? 0,
      quota,
      activeSiteId: session?.site_id ?? null,
    },
    { headers: NO_STORE_HEADERS }
  );
}
