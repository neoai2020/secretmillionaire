export interface ScrapedPageInfo {
  title: string;
  description: string;
  h1: string;
  price: string;
  bodySnippet: string;
}

export async function scrapePage(url: string): Promise<ScrapedPageInfo | null> {
  const scraperApiKey = process.env.SCRAPER_API_KEY;
  if (!scraperApiKey) return null;

  try {
    const scraperUrl = `https://api.scraperapi.com?api_key=${scraperApiKey}&url=${encodeURIComponent(url)}&render=true`;
    const response = await fetch(scraperUrl, {
      method: "GET",
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) return null;

    const html = await response.text();
    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const title = titleMatch ? titleMatch[1].replace(/\s+/g, " ").trim() : "";

    const metaDescMatch = html.match(
      /<meta[^>]*name=["']description["'][^>]*content=["']([\s\S]*?)["']/i
    );
    const metaDescription = metaDescMatch
      ? metaDescMatch[1].replace(/\s+/g, " ").trim()
      : "";

    const ogTitleMatch = html.match(
      /<meta[^>]*property=["']og:title["'][^>]*content=["']([\s\S]*?)["']/i
    );
    const ogTitle = ogTitleMatch ? ogTitleMatch[1].replace(/\s+/g, " ").trim() : "";

    const ogDescMatch = html.match(
      /<meta[^>]*property=["']og:description["'][^>]*content=["']([\s\S]*?)["']/i
    );
    const ogDesc = ogDescMatch ? ogDescMatch[1].replace(/\s+/g, " ").trim() : "";

    const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    const h1Text = h1Match
      ? h1Match[1].replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim()
      : "";

    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    let bodyText = "";
    if (bodyMatch) {
      bodyText = bodyMatch[1]
        .replace(/<script[\s\S]*?<\/script>/gi, "")
        .replace(/<style[\s\S]*?<\/style>/gi, "")
        .replace(/<[^>]*>/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .substring(0, 2000);
    }

    return {
      title: ogTitle || title || h1Text,
      description: ogDesc || metaDescription,
      h1: h1Text,
      price: "",
      bodySnippet: bodyText.substring(0, 500),
    };
  } catch {
    return null;
  }
}
