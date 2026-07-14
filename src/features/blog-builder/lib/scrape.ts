import * as cheerio from "cheerio";
import { assertPublicHttpsUrl } from "@/lib/safe-url";

export interface ScrapedPageInfo {
  title: string;
  description: string;
  h1: string;
  price: string;
  brand: string;
  rating: string;
  features: string[];
  bodySnippet: string;
}

const SCRAPE_TIMEOUT_MS = 30_000;
const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

/** Fetch raw HTML — via ScraperAPI (JS render) when configured, else a direct request. */
async function fetchHtml(url: string): Promise<string | null> {
  const scraperApiKey = process.env.SCRAPER_API_KEY;

  try {
    if (scraperApiKey) {
      const scraperUrl = `https://api.scraperapi.com?api_key=${scraperApiKey}&url=${encodeURIComponent(
        url
      )}&render=true`;
      const res = await fetch(scraperUrl, {
        method: "GET",
        signal: AbortSignal.timeout(SCRAPE_TIMEOUT_MS),
      });
      if (res.ok) return await res.text();
    }

    // Direct fallback (works for many offer/sales pages without JS gating).
    const res = await fetch(url, {
      method: "GET",
      headers: { "User-Agent": USER_AGENT, Accept: "text/html" },
      signal: AbortSignal.timeout(15_000),
      redirect: "follow",
    });
    if (res.ok) return await res.text();
  } catch {
    /* fall through */
  }

  return null;
}

type JsonLdNode = Record<string, unknown>;

/** Walk JSON-LD blocks looking for a Product node and pull structured fields. */
function extractFromJsonLd($: cheerio.CheerioAPI): Partial<ScrapedPageInfo> {
  const out: Partial<ScrapedPageInfo> = {};

  const nodes: JsonLdNode[] = [];
  $('script[type="application/ld+json"]').each((_, el) => {
    const raw = $(el).contents().text();
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      const list = Array.isArray(parsed) ? parsed : [parsed];
      for (const item of list) {
        if (item && typeof item === "object") {
          nodes.push(item as JsonLdNode);
          const graph = (item as JsonLdNode)["@graph"];
          if (Array.isArray(graph)) nodes.push(...(graph as JsonLdNode[]));
        }
      }
    } catch {
      /* ignore malformed blocks */
    }
  });

  const typeMatches = (node: JsonLdNode, type: string) => {
    const t = node["@type"];
    return Array.isArray(t) ? t.includes(type) : t === type;
  };

  const product = nodes.find((n) => typeMatches(n, "Product"));
  if (product) {
    if (typeof product.name === "string") out.title = product.name.trim();
    if (typeof product.description === "string") out.description = product.description.trim();

    const brand = product.brand;
    if (typeof brand === "string") out.brand = brand;
    else if (brand && typeof brand === "object" && typeof (brand as JsonLdNode).name === "string") {
      out.brand = (brand as JsonLdNode).name as string;
    }

    const offers = Array.isArray(product.offers) ? product.offers[0] : product.offers;
    if (offers && typeof offers === "object") {
      const o = offers as JsonLdNode;
      const price = o.price ?? o.lowPrice;
      const currency = typeof o.priceCurrency === "string" ? o.priceCurrency : "";
      if (price != null && `${price}`.trim()) out.price = `${currency} ${price}`.trim();
    }

    const rating = product.aggregateRating;
    if (rating && typeof rating === "object") {
      const r = rating as JsonLdNode;
      if (r.ratingValue != null) {
        const count = r.reviewCount ?? r.ratingCount;
        out.rating = count != null ? `${r.ratingValue}/5 from ${count} reviews` : `${r.ratingValue}/5`;
      }
    }
  }

  return out;
}

function metaContent($: cheerio.CheerioAPI, selectors: string[]): string {
  for (const sel of selectors) {
    const val = $(sel).attr("content");
    if (val && val.trim()) return val.replace(/\s+/g, " ").trim();
  }
  return "";
}

/** Heuristic price sniff from visible text when JSON-LD has none. */
function sniffPrice(text: string): string {
  const match = text.match(/(?:[$€£]|USD|EUR)\s?\d{1,4}(?:[.,]\d{2})?/);
  return match ? match[0].trim() : "";
}

/** Collect the most "feature-like" list items (benefits/specs) on the page. */
function extractFeatures($: cheerio.CheerioAPI): string[] {
  const items: string[] = [];
  $("li").each((_, el) => {
    const text = $(el).text().replace(/\s+/g, " ").trim();
    if (text.length >= 12 && text.length <= 160 && !/^(home|login|sign|menu|cart)/i.test(text)) {
      items.push(text);
    }
  });

  const seen = new Set<string>();
  const unique: string[] = [];
  for (const item of items) {
    const key = item.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(item);
    if (unique.length >= 8) break;
  }
  return unique;
}

export async function scrapePage(url: string): Promise<ScrapedPageInfo | null> {
  // Defense in depth — route also validates; keep private hosts out of direct fetch.
  let safeUrl: string;
  try {
    safeUrl = assertPublicHttpsUrl(url).toString();
  } catch {
    return null;
  }

  const html = await fetchHtml(safeUrl);
  if (!html) return null;

  try {
    const $ = cheerio.load(html);
    $("script, style, noscript, svg").remove();

    const jsonLd = extractFromJsonLd(cheerio.load(html));

    const title =
      jsonLd.title ||
      metaContent($, ['meta[property="og:title"]', 'meta[name="twitter:title"]']) ||
      $("title").first().text().replace(/\s+/g, " ").trim();

    const description =
      jsonLd.description ||
      metaContent($, [
        'meta[name="description"]',
        'meta[property="og:description"]',
        'meta[name="twitter:description"]',
      ]);

    const h1 = $("h1").first().text().replace(/\s+/g, " ").trim();

    const bodyText = $("body").text().replace(/\s+/g, " ").trim().slice(0, 2000);

    const price = jsonLd.price || sniffPrice(bodyText);
    const features = extractFeatures($);

    return {
      title: (title || h1).slice(0, 200),
      description: description.slice(0, 600),
      h1: h1.slice(0, 200),
      price: price.slice(0, 40),
      brand: (jsonLd.brand ?? "").slice(0, 80),
      rating: (jsonLd.rating ?? "").slice(0, 60),
      features,
      bodySnippet: bodyText.slice(0, 600),
    };
  } catch {
    return null;
  }
}

/** Turn scraped details into a compact, model-friendly product context block. */
export function buildProductContext(info: ScrapedPageInfo): string {
  const lines: string[] = [];
  if (info.title) lines.push(`Product: ${info.title}`);
  if (info.brand) lines.push(`Brand: ${info.brand}`);
  if (info.price) lines.push(`Price: ${info.price}`);
  if (info.rating) lines.push(`Rating: ${info.rating}`);
  if (info.description) lines.push(`Summary: ${info.description}`);
  if (info.features.length > 0) {
    lines.push(`Key points: ${info.features.slice(0, 6).join("; ")}`);
  } else if (info.bodySnippet) {
    lines.push(`Page excerpt: ${info.bodySnippet}`);
  }
  return lines.join("\n");
}
