import type { ArmedLink } from "../types";
import { stripAffiliateBlocks, weaveAffiliateLinks } from "./affiliate";
import { insertAfterH2 } from "./html-insert";

const LEADING_FIGURE_RE = /^<figure[^>]*>[\s\S]*?<\/figure>\s*/i;

export function heroFigureHtml(imageUrl: string, alt: string): string {
  const safeAlt = alt.replace(/"/g, "&quot;");
  return `<figure class="sms-inline-figure"><img src="${imageUrl}" alt="${safeAlt}" loading="lazy" /></figure>`;
}

/** Remove hero figures prepended to stored HTML (legacy pipeline duplicated the layout hero). */
export function stripLeadingHeroFigure(html: string, imageUrl?: string | null): string {
  let out = html.trim();
  while (LEADING_FIGURE_RE.test(out)) {
    const match = out.match(LEADING_FIGURE_RE);
    if (!match) break;
    if (imageUrl) {
      const srcFragment = imageUrl.split("/").pop() ?? imageUrl;
      if (!match[0].includes(srcFragment) && !match[0].includes(imageUrl)) break;
    }
    out = out.slice(match[0].length).trim();
  }
  return out;
}

/** Place the inline figure after the 2nd H2 (fallback: 1st H2, then first paragraph). */
export function injectMidArticleFigure(html: string, imageUrl: string, alt: string): string {
  const figure = heroFigureHtml(imageUrl, alt);
  const cleaned = stripLeadingHeroFigure(html, imageUrl);

  if (cleaned.includes(imageUrl)) return cleaned;

  return insertAfterH2(cleaned, figure, 1);
}

export function prepareArticleHtml(post: {
  html: string;
  image_url: string | null;
  image_alt: string | null;
  title: string;
  id: string;
  armedLinks?: ArmedLink[];
  siteId?: string;
}): string {
  const alt = post.image_alt ?? post.title;
  let html = stripLeadingHeroFigure(post.html, post.image_url);

  if (post.image_url && !html.includes(post.image_url)) {
    html = injectMidArticleFigure(html, post.image_url, alt);
  }

  if (post.armedLinks?.length && post.siteId) {
    html = weaveAffiliateLinks(html, post.armedLinks, post.id, post.siteId);
  } else {
    html = stripAffiliateBlocks(html);
  }

  return html;
}
