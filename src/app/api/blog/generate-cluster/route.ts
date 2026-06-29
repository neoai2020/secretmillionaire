import { NextResponse } from "next/server";
import { featureApiGuard } from "@/lib/feature-api-guard";
import { getApiUser } from "@/lib/api-auth";
import { generateBlogPostContent } from "@/features/blog-builder/lib/generate-content";
import { weaveAffiliateLinks } from "@/features/blog-builder/lib/affiliate";
import { injectMidArticleFigure } from "@/features/blog-builder/lib/article-html";
import { resolvePostImage } from "@/features/blog-builder/lib/images";
import { buildClusterTopics, buildInternalLinks } from "@/features/blog-builder/lib/templates";
import { getSiteTerritory } from "@/features/blog-builder/lib/site-territory";
import { scrapePage } from "@/features/blog-builder/lib/scrape";
import type { ArmedLink, BlogSite } from "@/features/blog-builder/types";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function POST(request: Request) {
  const guard = featureApiGuard("blog-builder");
  if (guard) return guard;

  const { supabase, user } = await getApiUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const siteId = typeof body.siteId === "string" ? body.siteId : "";

  const { data: site, error: siteError } = await supabase
    .from("sites")
    .select("*")
    .eq("id", siteId)
    .eq("user_id", user.id)
    .single();

  if (siteError || !site) {
    return NextResponse.json({ error: "Site not found" }, { status: 404 });
  }

  const typedSite = site as BlogSite;
  const armedLinks = (typedSite.armed_links ?? []) as ArmedLink[];
  const affiliateUrl = armedLinks[0]?.url ?? "";

  let productContext = "";
  if (affiliateUrl) {
    const scraped = await scrapePage(affiliateUrl);
    if (scraped) {
      productContext = `${scraped.title}. ${scraped.description}`;
    }
  }

  const territory = getSiteTerritory(typedSite);
  const topics = buildClusterTopics(territory, typedSite.hobby);
  const createdPosts = [];

  for (const topic of topics) {
    const { data: existing } = await supabase
      .from("posts")
      .select("id")
      .eq("site_id", siteId)
      .eq("slug", topic.slug)
      .maybeSingle();

    if (existing) {
      createdPosts.push(existing);
      continue;
    }
    const content = await generateBlogPostContent({
      topic: topic.title,
      territory,
      hobby: typedSite.hobby,
      angle: topic.angle,
      affiliateContext: armedLinks.map((l) => `${l.label}: ${l.url}`).join("\n"),
      productContext,
    });

    const image = await resolvePostImage({
      title: content.title,
      subject: territory,
      userId: user.id,
      supabase,
    });

    const postId = crypto.randomUUID();
    let html = content.html;

    if (image.url) {
      html = injectMidArticleFigure(html, image.url, image.alt);
    }

    html = weaveAffiliateLinks(html, armedLinks, postId, siteId);
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
        image_url: image.url || null,
        image_alt: image.alt,
        is_pillar: topic.isPillar,
        status: "draft",
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    createdPosts.push(post);
  }

  return NextResponse.json({ posts: createdPosts, count: createdPosts.length });
}
