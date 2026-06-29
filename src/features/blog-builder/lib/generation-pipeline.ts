import type { SupabaseClient } from "@supabase/supabase-js";
import { generateBlogPostContent } from "./generate-content";
import { weaveAffiliateLinks } from "./affiliate";
import { resolvePostImage } from "./images";
import { buildClusterTopics, buildInternalLinks } from "./templates";
import { getSiteTerritory } from "./site-territory";
import { injectMidArticleFigure, stripLeadingHeroFigure } from "./article-html";
import type { ArmedLink, BlogPost, BlogSite, ClusterTopic } from "../types";

export const IMAGE_BATCH_CONCURRENCY = 3;

export async function loadOwnedSite(
  supabase: SupabaseClient,
  userId: string,
  siteId: string
): Promise<BlogSite | null> {
  const { data } = await supabase
    .from("sites")
    .select("*")
    .eq("id", siteId)
    .eq("user_id", userId)
    .maybeSingle();
  return (data as BlogSite) ?? null;
}

export async function loadOwnedPost(
  supabase: SupabaseClient,
  userId: string,
  postId: string
): Promise<BlogPost | null> {
  const { data } = await supabase
    .from("posts")
    .select("*")
    .eq("id", postId)
    .eq("user_id", userId)
    .maybeSingle();
  return (data as BlogPost) ?? null;
}

export interface GeneratePostParams {
  supabase: SupabaseClient;
  userId: string;
  site: BlogSite;
  topic: ClusterTopic;
  productContext?: string;
  /** Text-only first — faster/cheaper; attach image in a second pass. */
  skipImage?: boolean;
}

export async function generateAndSavePost(
  params: GeneratePostParams
): Promise<{ post: BlogPost; skipped: boolean }> {
  const { supabase, userId, site, topic, productContext = "", skipImage = false } = params;

  const { data: existing } = await supabase
    .from("posts")
    .select("*")
    .eq("site_id", site.id)
    .eq("slug", topic.slug)
    .maybeSingle();

  if (existing) {
    return { post: existing as BlogPost, skipped: true };
  }

  const territory = getSiteTerritory(site);
  const armedLinks = (site.armed_links ?? []) as ArmedLink[];
  const topics = buildClusterTopics(territory, site.hobby);

  const content = await generateBlogPostContent({
    topic: topic.title,
    territory,
    hobby: site.hobby,
    angle: topic.angle,
    affiliateContext: armedLinks.map((l) => `${l.label}: ${l.url}`).join("\n"),
    productContext,
  });

  const postId = crypto.randomUUID();
  let imageUrl: string | null = null;
  let imageAlt = `${content.title} — ${territory}`;

  if (!skipImage) {
    const image = await resolvePostImage({
      title: content.title,
      subject: territory,
      userId,
      supabase,
    });
    imageUrl = image.url || null;
    imageAlt = image.alt;
  }

  let html = content.html;
  if (imageUrl) {
    html = injectMidArticleFigure(html, imageUrl, imageAlt);
  }

  html = weaveAffiliateLinks(html, armedLinks, postId, site.id);
  html += buildInternalLinks(topics, site.slug, topic.slug);

  const { data: post, error } = await supabase
    .from("posts")
    .insert({
      id: postId,
      site_id: site.id,
      user_id: userId,
      title: content.title,
      slug: topic.slug,
      html,
      excerpt: content.excerpt,
      meta_description: content.metaDescription,
      image_url: imageUrl,
      image_alt: imageAlt,
      is_pillar: topic.isPillar,
      status: "draft",
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return { post: post as BlogPost, skipped: false };
}

export async function attachImageToPost(params: {
  supabase: SupabaseClient;
  userId: string;
  postId: string;
}): Promise<BlogPost> {
  const post = await loadOwnedPost(params.supabase, params.userId, params.postId);
  if (!post) throw new Error("Post not found");

  if (post.image_url) return post;

  const site = await loadOwnedSite(params.supabase, params.userId, post.site_id);
  if (!site) throw new Error("Site not found");

  const territory = getSiteTerritory(site);
  const image = await resolvePostImage({
    title: post.title,
    subject: territory,
    userId: params.userId,
    supabase: params.supabase,
  });

  if (!image.url) return post;

  const bodyHtml = stripLeadingHeroFigure(post.html, post.image_url);
  const html = injectMidArticleFigure(bodyHtml, image.url, image.alt);

  const { data: updated, error } = await params.supabase
    .from("posts")
    .update({
      html,
      image_url: image.url,
      image_alt: image.alt,
    })
    .eq("id", post.id)
    .eq("user_id", params.userId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return updated as BlogPost;
}

export interface PostUpdatePayload {
  title?: string;
  excerpt?: string | null;
  meta_description?: string | null;
  html?: string;
}

export function validatePostUpdate(body: PostUpdatePayload): PostUpdatePayload | null {
  const out: PostUpdatePayload = {};

  if (typeof body.title === "string") {
    const t = body.title.trim();
    if (t.length < 4 || t.length > 200) return null;
    out.title = t;
  }

  if (body.excerpt === null || typeof body.excerpt === "string") {
    const e = body.excerpt?.trim() ?? "";
    if (e.length > 500) return null;
    out.excerpt = e || null;
  }

  if (body.meta_description === null || typeof body.meta_description === "string") {
    const m = body.meta_description?.trim() ?? "";
    if (m.length > 180) return null;
    out.meta_description = m || null;
  }

  if (typeof body.html === "string") {
    const h = body.html.trim();
    if (h.length < 100) return null;
    out.html = h;
  }

  if (Object.keys(out).length === 0) return null;
  return out;
}
