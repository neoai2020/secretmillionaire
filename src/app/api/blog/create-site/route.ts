import { NextResponse } from "next/server";
import { featureApiGuard } from "@/lib/feature-api-guard";
import { getApiUser } from "@/lib/api-auth";
import { slugify } from "@/features/blog-builder/lib/seo";
import { pickThemeForSite, buildSiteTitle, buildSiteTagline } from "@/features/blog-builder/themes";
import { getDailyGenerationQuota } from "@/features/blog-builder/lib/site-quota";
import type { ArmedLink } from "@/features/blog-builder/types";

export const dynamic = "force-dynamic";

async function linkSiteToSession(
  supabase: Awaited<ReturnType<typeof getApiUser>>["supabase"],
  userId: string,
  siteId: string,
  siteSlug: string
) {
  await supabase.from("blog_builder_sessions").upsert(
    {
      user_id: userId,
      site_id: siteId,
      site_slug: siteSlug,
      step: 2,
      deployed: false,
      is_generating: false,
      generation_log: [],
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );
}

export async function POST(request: Request) {
  const guard = featureApiGuard("blog-builder");
  if (guard) return guard;

  const { supabase, user } = await getApiUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const quota = await getDailyGenerationQuota(supabase, user.id);
  if (!quota.unlimited && (quota.remaining ?? 0) <= 0) {
    return NextResponse.json(
      {
        error: `Daily limit reached (${quota.limit} new money sites per day). Try again tomorrow.`,
        quota,
      },
      { status: 429 }
    );
  }

  const body = await request.json();
  const hobby = typeof body.hobby === "string" ? body.hobby.trim() : "";
  const territory =
    typeof body.territory === "string" ? body.territory.trim() : hobby;
  const armedLinks = Array.isArray(body.armedLinks) ? (body.armedLinks as ArmedLink[]) : [];

  if (!hobby) return NextResponse.json({ error: "hobby is required" }, { status: 400 });

  const title = buildSiteTitle(hobby);
  const baseSlug = slugify(territory) || slugify(hobby) || "site";
  const slug = `${baseSlug}-${crypto.randomUUID().slice(0, 8)}`;

  const theme = pickThemeForSite(territory, user.id);

  const { data, error } = await supabase
    .from("sites")
    .insert({
      user_id: user.id,
      hobby,
      territory,
      title,
      tagline: buildSiteTagline(hobby),
      slug,
      theme,
      armed_links: armedLinks,
      status: "draft",
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await linkSiteToSession(supabase, user.id, data.id, data.slug);

  const quotaAfter = await getDailyGenerationQuota(supabase, user.id);

  return NextResponse.json({ site: data, quota: quotaAfter });
}
