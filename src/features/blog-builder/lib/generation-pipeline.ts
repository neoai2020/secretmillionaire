import type { SupabaseClient } from "@supabase/supabase-js";
import { generateBlogPostContent } from "./generate-content";
import { weaveAffiliateLinks } from "./affiliate";
import {
  resolvePostImage,
  resolveFastImageUrl,
  persistExternalImage,
  type ResolvedImage,
} from "./images";
import { buildClusterTopics, buildInternalLinks } from "./templates";
import { getSiteTerritory } from "./site-territory";
import { injectMidArticleFigure, stripLeadingHeroFigure } from "./article-html";
import { mapWithConcurrency } from "./concurrency";
import type { ArmedLink, BlogPost, BlogSite, ClusterTopic, ContentTier } from "../types";

/**
 * GPT text calls share one RapidAPI quota. A small pool (not strictly serial)
 * cuts bulk generation time ~Nx while per-post retry/backoff absorbs the
 * occasional 429. Tune via env if the quota tier changes.
 */
export const TEXT_GENERATION_CONCURRENCY = Number(
  process.env.TEXT_GENERATION_CONCURRENCY ?? 3
);
export const POST_GENERATION_ATTEMPTS = 3;

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

/**
 * Fire-and-forget: download the shown external image and cache it to Supabase,
 * then swap the post's image_url and the <img src> inside its html. Runs after
 * the response is sent so the user sees the image immediately. Safe on a
 * persistent Node server (DigitalOcean); failures are logged, never thrown.
 */
export function persistPostImageInBackground(params: {
  supabase: SupabaseClient;
  userId: string;
  postId: string;
  externalUrl: string;
}): void {
  const { supabase, userId, postId, externalUrl } = params;

  void (async () => {
    try {
      const newUrl = await persistExternalImage({ url: externalUrl, userId, supabase });
      if (!newUrl || newUrl === externalUrl) return;

      const post = await loadOwnedPost(supabase, userId, postId);
      if (!post) return;

      const html = (post.html ?? "").split(externalUrl).join(newUrl);
      await supabase
        .from("posts")
        .update({ image_url: newUrl, html })
        .eq("id", postId)
        .eq("user_id", userId);
    } catch (err) {
      console.error("[image-persist] background upload failed", err);
    }
  })();
}

export interface GeneratePostParams {
  supabase: SupabaseClient;
  userId: string;
  site: BlogSite;
  topic: ClusterTopic;
  productContext?: string;
  /** Niche trend angles, computed once per site and shared across the cluster. */
  trendContext?: string;
  /** deploy = shorter copy for Empire Builder deploy; full = templates / bulk seed. */
  contentTier?: ContentTier;
  /** Text-only — image attached in a second pass. */
  skipImage?: boolean;
  /** Fast Pollinations/picsum only (skip NanoBanana). Used during deploy. */
  fastImage?: boolean;
}

export async function generateAndSavePost(
  params: GeneratePostParams
): Promise<{ post: BlogPost; skipped: boolean }> {
  const {
    supabase,
    userId,
    site,
    topic,
    productContext = "",
    trendContext = "",
    contentTier = "full",
    skipImage = false,
    fastImage = false,
  } = params;

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
    trendContext,
    contentTier,
  });

  const postId = crypto.randomUUID();
  let imageUrl: string | null = null;
  let imageAlt = `${content.title} — ${territory}`;
  // External (hotlinked) URL to cache to Supabase in the background after save.
  let externalImageUrl: string | null = null;

  if (!skipImage) {
    if (fastImage) {
      // Fast: show a direct URL now, cache it to storage afterwards.
      const image = await resolveFastImageUrl({ title: content.title, subject: territory });
      imageUrl = image.url || null;
      imageAlt = image.alt;
      externalImageUrl = image.url || null;
    } else {
      // Guaranteed-persisted before returning (no background work).
      const image = await resolvePostImage({
        title: content.title,
        subject: territory,
        userId,
        supabase,
        fast: false,
      });
      imageUrl = image.url || null;
      imageAlt = image.alt;
    }
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

  if (externalImageUrl) {
    persistPostImageInBackground({ supabase, userId, postId, externalUrl: externalImageUrl });
  }

  return { post: post as BlogPost, skipped: false };
}

/** Delete the existing slug (if any) and generate a fresh post — used for template repair. */
export async function regenerateAndSavePost(params: GeneratePostParams): Promise<BlogPost> {
  const {
    supabase,
    userId,
    site,
    topic,
    productContext = "",
    trendContext = "",
    contentTier = "full",
    skipImage = false,
    fastImage = false,
  } = params;

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
    trendContext,
    contentTier,
  });

  const postId = crypto.randomUUID();
  let imageUrl: string | null = null;
  let imageAlt = `${content.title} — ${territory}`;
  let externalImageUrl: string | null = null;

  if (!skipImage) {
    if (fastImage) {
      const image = await resolveFastImageUrl({ title: content.title, subject: territory });
      imageUrl = image.url || null;
      imageAlt = image.alt;
      externalImageUrl = image.url || null;
    } else {
      const image = await resolvePostImage({
        title: content.title,
        subject: territory,
        userId,
        supabase,
        fast: false,
      });
      imageUrl = image.url || null;
      imageAlt = image.alt;
    }
  }

  let html = content.html;
  if (imageUrl) {
    html = injectMidArticleFigure(html, imageUrl, imageAlt);
  }

  html = weaveAffiliateLinks(html, armedLinks, postId, site.id);
  html += buildInternalLinks(topics, site.slug, topic.slug);

  // Generate first — only delete/replace after content is ready (avoids data loss on timeout).
  await supabase
    .from("posts")
    .delete()
    .eq("site_id", site.id)
    .eq("user_id", userId)
    .eq("slug", topic.slug);

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

  if (externalImageUrl) {
    persistPostImageInBackground({ supabase, userId, postId, externalUrl: externalImageUrl });
  }

  return post as BlogPost;
}

export async function attachImageToPost(params: {
  supabase: SupabaseClient;
  userId: string;
  postId: string;
  /** Hero image resolved during deploy prefetch — skips another lookup. */
  prefetched?: ResolvedImage | null;
}): Promise<BlogPost> {
  const post = await loadOwnedPost(params.supabase, params.userId, params.postId);
  if (!post) throw new Error("Post not found");

  if (post.image_url) return post;

  const site = await loadOwnedSite(params.supabase, params.userId, post.site_id);
  if (!site) throw new Error("Site not found");

  const territory = getSiteTerritory(site);

  const fast =
    params.prefetched ??
    (await resolveFastImageUrl({ title: post.title, subject: territory }));
  if (fast.url) {
    const bodyHtml = stripLeadingHeroFigure(post.html, post.image_url);
    const html = injectMidArticleFigure(bodyHtml, fast.url, fast.alt);

    const { data: updated, error } = await params.supabase
      .from("posts")
      .update({
        html,
        image_url: fast.url,
        image_alt: fast.alt,
      })
      .eq("id", post.id)
      .eq("user_id", params.userId)
      .select()
      .single();

    if (error) throw new Error(error.message);

    if (!fast.url.includes("/blog-images/")) {
      persistPostImageInBackground({
        supabase: params.supabase,
        userId: params.userId,
        postId: post.id,
        externalUrl: fast.url,
      });
    }

    return updated as BlogPost;
  }

  // Slow fallback: download + upload before return (NanoBanana / guaranteed persist).
  const image = await resolvePostImage({
    title: post.title,
    subject: territory,
    userId: params.userId,
    supabase: params.supabase,
    fast: true,
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

/**
 * Server-side safety net: attach a hero image to every live/draft post in a site
 * that is still missing one. Runs at publish so images no longer depend on the
 * browser staying open after deploy (the previous fire-and-forget client step
 * was the main cause of missing pictures). Best-effort — failures are logged.
 */
export async function backfillMissingPostImages(
  supabase: SupabaseClient,
  userId: string,
  siteId: string
): Promise<number> {
  const { data: posts } = await supabase
    .from("posts")
    .select("id")
    .eq("site_id", siteId)
    .eq("user_id", userId)
    .is("image_url", null);

  const ids = (posts ?? []).map((p) => (p as { id: string }).id);
  if (ids.length === 0) return 0;

  let attached = 0;
  await mapWithConcurrency(ids, 3, async (postId) => {
    try {
      const updated = await attachImageToPost({ supabase, userId, postId });
      if (updated.image_url) attached += 1;
    } catch (err) {
      console.error("[image-backfill] failed for post", postId, err);
    }
  });

  return attached;
}

export interface PostUpdatePayload {
  title?: string;
  excerpt?: string | null;
  meta_description?: string | null;
  html?: string;
  image_url?: string | null;
  image_alt?: string | null;
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

  if (body.image_url === null || typeof body.image_url === "string") {
    const u = body.image_url?.trim() ?? "";
    if (u && !/^https?:\/\//i.test(u)) return null;
    if (u.length > 2048) return null;
    out.image_url = u || null;
  }

  if (body.image_alt === null || typeof body.image_alt === "string") {
    const a = body.image_alt?.trim() ?? "";
    if (a.length > 300) return null;
    out.image_alt = a || null;
  }

  if (Object.keys(out).length === 0) return null;
  return out;
}
