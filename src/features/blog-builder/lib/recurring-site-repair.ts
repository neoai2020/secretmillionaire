import type { SupabaseClient } from "@supabase/supabase-js";
import { stripAffiliateBlocks, weaveAffiliateLinks } from "./affiliate";
import {
  injectMidArticleFigure,
  stripFiguresMatchingUrl,
  stripLeadingHeroFigure,
} from "./article-html";
import { resolveFastImageUrl, persistExternalImage } from "./images";
import { RECURRING_PREMIUM_THEME_KEY } from "../themes/resolve-theme";
import { getSiteTerritory } from "./site-territory";
import type { ArmedLink, BlogPost, BlogSite } from "../types";

const INLINE_FIGURE_RE = /<figure[^>]*class="sms-inline-figure"[\s\S]*?<\/figure>/gi;
const DISCLOSURE_RE = /<p[^>]*class="affiliate-disclosure"[\s\S]*?<\/p>/gi;
const DISCLOSURE_EM_RE = /<p[^>]*>\s*<em>\s*Disclosure:[\s\S]*?<\/p>/gi;

export function stripArticleDisclosure(html: string): string {
  return html.replace(DISCLOSURE_RE, "").replace(DISCLOSURE_EM_RE, "").trim();
}

function stripAllInlineFigures(html: string): string {
  return html.replace(INLINE_FIGURE_RE, "").trim();
}

async function resolvePersistedImage(params: {
  title: string;
  subject: string;
  userId: string;
  supabase: SupabaseClient;
  excludeUrls: string[];
  pickOffset?: number;
}): Promise<{ url: string; alt: string } | null> {
  const resolved = await resolveFastImageUrl({
    title: params.title,
    subject: params.subject,
    pickOffset: params.pickOffset ?? 0,
    excludeUrls: params.excludeUrls,
  });
  if (!resolved.url) return null;

  const persisted = await persistExternalImage({
    url: resolved.url,
    userId: params.userId,
    supabase: params.supabase,
  });

  return { url: persisted ?? resolved.url, alt: resolved.alt };
}

/** Refresh hero + inline images and strip in-article disclosure for one post. */
export async function repairRecurringPost(params: {
  supabase: SupabaseClient;
  site: BlogSite;
  post: BlogPost;
  usedImageUrls: string[];
}): Promise<{ updated: boolean; reason?: string }> {
  const territory = getSiteTerritory(params.site);
  const armed = (params.site.armed_links ?? []) as ArmedLink[];

  let html = stripArticleDisclosure(params.post.html ?? "");
  html = stripLeadingHeroFigure(html, params.post.image_url);
  html = stripAllInlineFigures(html);
  html = stripFiguresMatchingUrl(html, params.post.image_url);

  const hero = await resolvePersistedImage({
    title: params.post.title,
    subject: territory,
    userId: params.post.user_id,
    supabase: params.supabase,
    excludeUrls: params.usedImageUrls,
    pickOffset: 0,
  });
  if (!hero?.url) return { updated: false, reason: "no hero image" };

  params.usedImageUrls.push(hero.url);

  const inline = await resolvePersistedImage({
    title: params.post.title,
    subject: territory,
    userId: params.post.user_id,
    supabase: params.supabase,
    excludeUrls: params.usedImageUrls,
    pickOffset: 2,
  });

  if (inline?.url && inline.url !== hero.url) {
    html = injectMidArticleFigure(html, inline.url, inline.alt);
    params.usedImageUrls.push(inline.url);
  }

  html = armed.length
    ? weaveAffiliateLinks(html, armed, params.post.id, params.site.id)
    : stripAffiliateBlocks(html);

  const { error } = await params.supabase
    .from("posts")
    .update({
      html,
      image_url: hero.url,
      image_alt: hero.alt,
    })
    .eq("id", params.post.id);

  if (error) return { updated: false, reason: error.message };
  return { updated: true };
}

export async function repairRecurringSite(params: {
  admin: SupabaseClient;
  site: BlogSite;
  postLimit?: number;
  concurrency?: number;
}): Promise<{ siteId: string; slug: string; repaired: number; failed: number; skipped: number }> {
  const { data: posts } = await params.admin
    .from("posts")
    .select("*")
    .eq("site_id", params.site.id)
    .order("is_pillar", { ascending: false })
    .order("created_at", { ascending: true });

  const rows = ((posts ?? []) as BlogPost[]).slice(0, params.postLimit ?? 999);
  const usedImageUrls: string[] = [];
  let repaired = 0;
  let failed = 0;
  let skipped = 0;

  for (const post of rows) {
    try {
      const result = await repairRecurringPost({
        supabase: params.admin,
        site: params.site,
        post,
        usedImageUrls,
      });
      if (result.updated) repaired += 1;
      else skipped += 1;
    } catch (err) {
      console.error("[recurring-repair] post", post.slug, err);
      failed += 1;
    }
  }

  await params.admin
    .from("sites")
    .update({ theme: RECURRING_PREMIUM_THEME_KEY })
    .eq("id", params.site.id);

  return {
    siteId: params.site.id,
    slug: params.site.slug,
    repaired,
    failed,
    skipped,
  };
}

export async function listRecurringWealthSites(admin: SupabaseClient): Promise<BlogSite[]> {
  const { data } = await admin
    .from("sites")
    .select("*")
    .like("template_key", "recurring-%")
    .order("created_at", { ascending: true });

  return (data ?? []) as BlogSite[];
}

export async function repairAllRecurringWealthSites(params: {
  admin: SupabaseClient;
  /** Repair only cloned member sites (default) or include shared templates. */
  includeTemplates?: boolean;
  siteLimit?: number;
  postLimit?: number;
}): Promise<{
  sitesProcessed: number;
  totals: { repaired: number; failed: number; skipped: number };
  results: Array<{ siteId: string; slug: string; repaired: number; failed: number; skipped: number }>;
}> {
  let sites = await listRecurringWealthSites(params.admin);
  if (!params.includeTemplates) {
    sites = sites.filter((s) => !s.is_template);
  }
  if (params.siteLimit) sites = sites.slice(0, params.siteLimit);

  const results: Array<{
    siteId: string;
    slug: string;
    repaired: number;
    failed: number;
    skipped: number;
  }> = [];

  for (const site of sites) {
    results.push(
      await repairRecurringSite({
        admin: params.admin,
        site,
        postLimit: params.postLimit,
        concurrency: 2,
      })
    );
  }

  const totals = results.reduce(
    (acc, r) => ({
      repaired: acc.repaired + r.repaired,
      failed: acc.failed + r.failed,
      skipped: acc.skipped + r.skipped,
    }),
    { repaired: 0, failed: 0, skipped: 0 }
  );

  return { sitesProcessed: results.length, totals, results };
}
