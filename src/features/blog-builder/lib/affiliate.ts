import type { ArmedLink } from "../types";
import { normalizeAffiliateUrl } from "./affiliate-url";

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
}

export function buildTrackUrl(postId: string, siteId: string, target: string): string {
  const url = normalizeAffiliateUrl(target);
  const params = new URLSearchParams({
    post: postId,
    site: siteId,
    to: url,
  });
  return `/api/blog/track-click?${params.toString()}`;
}

const AFFILIATE_BLOCK_RE =
  /<(?:aside|div|table)[^>]*class="(?:sms-affiliate-(?:banner|cta)|affiliate-(?:banner|cta)|sms-comparison)"[\s\S]*?<\/(?:aside|div|table)>/gi;

/** Remove injected affiliate blocks (legacy or current) before re-weaving. */
export function stripAffiliateBlocks(html: string): string {
  return html.replace(AFFILIATE_BLOCK_RE, "").trim();
}

export function renderCtaButton(label: string, href: string): string {
  return `<div class="affiliate-cta">
  <a href="${href}" target="_blank" rel="nofollow sponsored noopener">${escapeHtml(label)}</a>
</div>`;
}

export function renderBanner(link: ArmedLink, href: string): string {
  return `<aside class="affiliate-banner">
  <p class="affiliate-banner-eyebrow">Recommended for Initiates</p>
  <p class="affiliate-banner-copy">Discover <strong>${escapeHtml(link.label)}</strong> — our top pick for this territory.</p>
  <a href="${href}" target="_blank" rel="nofollow sponsored noopener" class="affiliate-banner-link">Check Today&apos;s Price →</a>
</aside>`;
}

function injectAfterSecondH2(html: string, chunk: string): string {
  const h2Ends: number[] = [];
  const h2Re = /<\/h2>/gi;
  let match: RegExpExecArray | null;
  while ((match = h2Re.exec(html)) !== null) {
    h2Ends.push(match.index + match[0].length);
  }

  const insertAt =
    h2Ends.length >= 2 ? h2Ends[1] : h2Ends.length === 1 ? h2Ends[0] : html.indexOf("</p>") + 4;

  if (insertAt > 3) {
    return `${html.slice(0, insertAt)}${chunk}${html.slice(insertAt)}`;
  }

  return `${chunk}${html}`;
}

const RELATED_SECTION_RE = /<section class="sms-related"[\s\S]*$/i;

function splitRelatedSection(html: string): { body: string; related: string } {
  const match = html.match(RELATED_SECTION_RE);
  if (!match || match.index === undefined) {
    return { body: html, related: "" };
  }
  return {
    body: html.slice(0, match.index).trim(),
    related: match[0],
  };
}

export function weaveAffiliateLinks(
  html: string,
  links: ArmedLink[],
  postId: string,
  siteId: string
): string {
  const cleaned = stripAffiliateBlocks(html);
  if (links.length === 0) return cleaned;

  const primary = links.find((link) => isValidLink(link)) ?? links[0];
  const offerUrl = normalizeAffiliateUrl(primary.url);
  if (!offerUrl) return cleaned;

  const tracked = buildTrackUrl(postId, siteId, offerUrl);
  const banner = renderBanner(primary, tracked);
  const cta = renderCtaButton("Get Instant Access", tracked);

  const { body, related } = splitRelatedSection(cleaned);
  const withBanner = injectAfterSecondH2(body, banner);
  return `${withBanner}${cta}${related}`;
}

function isValidLink(link: ArmedLink): boolean {
  try {
    const url = normalizeAffiliateUrl(link.url);
    return Boolean(url && new URL(url).protocol.startsWith("http"));
  } catch {
    return false;
  }
}
