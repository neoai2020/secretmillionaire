import type { ArmedLink } from "../types";
import { stripAffiliateBlocks, weaveAffiliateLinks } from "./affiliate";

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

  const h2Ends: number[] = [];
  const h2Re = /<\/h2>/gi;
  let m: RegExpExecArray | null;
  while ((m = h2Re.exec(cleaned)) !== null) {
    h2Ends.push(m.index + m[0].length);
  }

  const insertAt =
    h2Ends.length >= 2 ? h2Ends[1] : h2Ends.length === 1 ? h2Ends[0] : cleaned.indexOf("</p>") + 4;

  if (insertAt > 3) {
    return `${cleaned.slice(0, insertAt)}${figure}${cleaned.slice(insertAt)}`;
  }

  return `${figure}${cleaned}`;
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
