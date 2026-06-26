import { NextResponse } from "next/server";
import { featureApiGuard } from "@/lib/feature-api-guard";
import { getApiUser } from "@/lib/api-auth";
import { NO_STORE_HEADERS } from "@/lib/api-cache-headers";

export const dynamic = "force-dynamic";

export async function GET() {
  const guard = featureApiGuard("blog-builder");
  if (guard) return guard;

  const { supabase, user } = await getApiUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: NO_STORE_HEADERS });

  const { data: site } = await supabase
    .from("sites")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!site) {
    return NextResponse.json({ site: null, posts: [], clicks: 0 }, { headers: NO_STORE_HEADERS });
  }

  const { data: posts } = await supabase
    .from("posts")
    .select("*")
    .eq("site_id", site.id)
    .order("is_pillar", { ascending: false })
    .order("created_at", { ascending: true });

  const { count } = await supabase
    .from("affiliate_clicks")
    .select("*", { count: "exact", head: true })
    .eq("site_id", site.id);

  return NextResponse.json(
    {
      site,
      posts: posts ?? [],
      clicks: count ?? 0,
    },
    { headers: NO_STORE_HEADERS }
  );
}
