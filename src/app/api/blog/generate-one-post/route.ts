import { NextResponse } from "next/server";
import { featureApiGuard } from "@/lib/feature-api-guard";
import { getApiUser } from "@/lib/api-auth";
import { generateBlogPostContent } from "@/features/blog-builder/lib/generate-content";
import { weaveAffiliateLinks } from "@/features/blog-builder/lib/affiliate";
import { resolvePostImage } from "@/features/blog-builder/lib/images";
import { buildClusterTopics, buildInternalLinks } from "@/features/blog-builder/lib/templates";
import type { ArmedLink, BlogSite, ClusterTopic } from "@/features/blog-builder/types";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

function parseTopic(raw: unknown): ClusterTopic | null {
  if (!raw || typeof raw !== "object") return null;
  const t = raw as Record<string, unknown>;
  if (typeof t.title !== "string" || typeof t.slug !== "string") return null;
  return { title: t.title, slug: t.slug, isPillar: Boolean(t.isPillar) };
}

export async function POST(request: Request) {
  const guard = featureApiGuard("blog-builder");
  if (guard) return guard;

  const { supabase, user } = await getApiUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const siteId = typeof body.siteId === "string" ? body.siteId : "";
  const topic = parseTopic(body.topic);
  const productContext =
    typeof body.productContext === "string" ? body.productContext : "";
  const fastImages = body.fastImages !== false;

  if (!siteId || !topic) {
    return NextResponse.json({ error: "siteId and topic are required" }, { status: 400 });
  }

  const { data: site, error: siteError } = await supabase
    .from("sites")
    .select("*")
    .eq("id", siteId)
    .eq("user_id", user.id)
    .single();

  if (siteError || !site) {
    return NextResponse.json({ error: "Site not found" }, { status: 404 });
  }

  const { data: existing } = await supabase
    .from("posts")
    .select("*")
    .eq("site_id", siteId)
    .eq("slug", topic.slug)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ post: existing, skipped: true });
  }

  const typedSite = site as BlogSite;
  const armedLinks = (typedSite.armed_links ?? []) as ArmedLink[];
  const topics = buildClusterTopics(typedSite.hobby);

  const content = await generateBlogPostContent({
    topic: topic.title,
    hobby: typedSite.hobby,
    affiliateContext: armedLinks.map((l) => `${l.label}: ${l.url}`).join("; "),
    productContext,
  });

  const image = await resolvePostImage({
    title: content.title,
    hobby: typedSite.hobby,
    userId: user.id,
    supabase,
    fast: fastImages,
  });

  const postId = crypto.randomUUID();
  let html = content.html;

  if (image.url) {
    html = `<figure style="margin:0 0 1.5rem;"><img src="${image.url}" alt="${image.alt.replace(/"/g, "&quot;")}" style="width:100%;border-radius:12px;max-height:420px;object-fit:cover;" loading="lazy" /></figure>${html}`;
  }

  html = weaveAffiliateLinks(html, armedLinks, postId);
  html += buildInternalLinks(topics, typedSite.slug, topic.slug);

  const { data: post, error } = await supabase
    .from("posts")
    .insert({
      id: postId,
      site_id: siteId,
      user_id: user.id,
      title: content.title,
      slug: topic.slug,
      html,
      excerpt: content.excerpt,
      meta_description: content.metaDescription,
      image_url: image.url,
      image_alt: image.alt,
      is_pillar: topic.isPillar,
      status: "draft",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ post, skipped: false });
}
