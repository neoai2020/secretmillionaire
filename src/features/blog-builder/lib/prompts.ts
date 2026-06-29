import type { GeneratedPostContent, ArticleAngle } from "../types";

export const ARTICLE_JSON_EXAMPLE = `{
  "title": "Best Wooden Chess Sets Under $50 (2026 Buyer's Guide)",
  "excerpt": "Two sentences that preview the buyer benefit and mention the niche keyword.",
  "metaDescription": "Under 155 chars. Primary keyword near the start. Clear benefit.",
  "html": "<p>Opening hook...</p><h2>Section heading</h2><p>...</p>"
}`;

export const ARTICLE_SYSTEM_PROMPT = `You are a senior SEO affiliate editor publishing buyer-intent content for a niche money site.

Goals:
- Match the search intent of the article angle (guide, comparison, mistakes, budget, review, how-to).
- Demonstrate E-E-A-T: specific facts, comparisons, criteria, trade-offs — never vague filler.
- Write for humans first; optimize naturally for Google (keywords in title, intro, one H2, meta).
- Sound like a knowledgeable enthusiast helping a friend buy — not a spammy sales page.

Hard rules:
- Stay strictly inside the TERRITORY niche. Do not drift into generic hobby content.
- Do NOT invent brand names, prices, or URLs unless provided in product context.
- Do NOT include affiliate links or CTAs in html — the app injects those separately.
- Do NOT use <h1> (the page template supplies the title).
- Do NOT use markdown, code fences, or commentary outside JSON.
- Return ONLY valid JSON with keys: title, excerpt, metaDescription, html.`;

const ANGLE_INSTRUCTIONS: Record<ArticleAngle, string> = {
  "pillar-guide": `Article type: PILLAR comprehensive buyer's guide.
Search intent: informational + commercial investigation.
Structure: intro (problem + who this is for) → how to evaluate → top criteria checklist → buying tips → short FAQ (2-3 questions in prose).
Include a comparison-style bullet list of 3-5 evaluation criteria.`,

  "best-picks": `Article type: "Best picks" comparison / listicle.
Search intent: commercial — reader wants options ranked by use case.
Structure: intro → 3-5 picks described by USE CASE (not fake brands unless in product context) → quick comparison table in HTML using <table> → who each pick is best for.
End with "how to choose" summary.`,

  mistakes: `Article type: mistakes to avoid.
Search intent: problem-aware — reader wants to not waste money.
Structure: intro → 5-7 specific mistakes (each as <h2> or strong subhead in a list) → how to fix each → prevention checklist.
Tone: helpful warning, not fear-mongering.`,

  budget: `Article type: budget buyer guide.
Search intent: price-sensitive commercial.
Structure: intro → what to prioritize at low budget vs what to skip → realistic price tiers (ranges, not fake exact prices) → DIY/maintenance tips that save money.
Mention value-for-money criteria explicitly.`,

  "pro-tips": `Article type: pro tips / advanced tactics.
Search intent: informational — reader already interested, wants edge-case advice.
Structure: intro → 6-8 actionable tips (specific, niche-relevant) → common advanced pitfalls → quick recap.
Avoid repeating basic beginner content.`,

  "worth-it": `Article type: "Is it worth it?" honest review.
Search intent: decision stage — pros/cons before buying.
Structure: intro → who it IS for / who should skip → pros (bulleted) → cons (bulleted) → verdict section with clear recommendation framework (not hype).
Be balanced and credible.`,

  beginners: `Article type: step-by-step beginner guide.
Search intent: how-to + getting started.
Structure: intro → what you need before starting → numbered steps (clear order) → first-week checklist → next steps.
Keep jargon defined in plain language.`,
};

export function getAngleInstructions(angle: ArticleAngle): string {
  return ANGLE_INSTRUCTIONS[angle];
}

export function buildArticleUserPrompt(params: {
  topic: string;
  territory: string;
  hobby: string;
  angle: ArticleAngle;
  affiliateContext?: string;
  productContext?: string;
}): string {
  const parts = [
    `TERRITORY (exact niche — every paragraph must relate to this): ${params.territory}`,
    `Article headline angle: ${params.topic}`,
    `Broad category: ${params.hobby}`,
    "",
    getAngleInstructions(params.angle),
    "",
    "Output requirements:",
    "- html: 450-650 words, 3-4 <h2> sections, mix of <p> and <ul>/<li> where useful",
    "- title: compelling, includes primary niche keywords, max ~70 chars",
    "- excerpt: 2 sentences, buyer-focused, max 200 chars",
    "- metaDescription: max 155 chars, primary keyword in first half",
  ];

  if (params.productContext?.trim()) {
    parts.push(
      "",
      "Affiliate offer page context (use for accuracy — do not copy verbatim):",
      params.productContext.trim()
    );
  }

  if (params.affiliateContext?.trim()) {
    parts.push(
      "",
      "Armed offers (for topical alignment only — do NOT paste URLs in html):",
      params.affiliateContext.trim()
    );
  }

  parts.push("", `Respond with JSON matching this shape:\n${ARTICLE_JSON_EXAMPLE}`);

  return parts.join("\n");
}

export function buildTerritorySuggestionsPrompt(hobby: string): {
  system: string;
  user: string;
} {
  return {
    system: `You identify profitable SEO blog territories for affiliate monetization.
Return ONLY JSON: { "suggestions": ["...", ...] }
Each suggestion must be a specific buyer-intent sub-niche (not a single word).`,
    user: `Hobby/interest: "${hobby}"

Suggest 6 territory angles that:
- Have clear Google search demand (buyers researching purchases)
- Fit affiliate product reviews or guides
- Are specific enough to rank (not "best ${hobby}" alone)

Examples of good specificity: materials, skill level, price tier, use case, brand category.
Return JSON only.`,
  };
}

/** Visual prompt tuned for hero images (Nano Banana + Pollinations). */
export function buildHeroImagePrompt(title: string, territory: string): string {
  const subject = territory.slice(0, 120);
  return [
    "Professional editorial blog hero photograph",
    subject,
    title.slice(0, 80),
    "single focal subject, shallow depth of field",
    "natural soft lighting, warm tones",
    "photorealistic, 16:9 composition",
    "no text, no logo, no watermark, no collage, no cartoon",
  ].join(", ");
}

export function buildHeroImageNegativePrompt(): string {
  return "text, words, letters, watermark, logo, blurry, low quality, cartoon, anime, collage, split screen";
}

/** Validate and normalize model output before save. */
export function normalizeArticleContent(
  parsed: Partial<GeneratedPostContent>,
  fallbackTitle: string
): GeneratedPostContent | null {
  if (!parsed.html?.trim() || !parsed.title?.trim()) return null;

  let html = parsed.html.trim();
  html = html.replace(/^```(?:html)?\s*/i, "").replace(/\s*```$/i, "");
  html = html.replace(/<h1[^>]*>[\s\S]*?<\/h1>/gi, "");

  if (!/<h2/i.test(html)) {
    html = `<h2>Overview</h2>${html}`;
  }

  const wordCount = html.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
  if (wordCount < 120) return null;

  const plain = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

  return {
    title: parsed.title.trim().slice(0, 120),
    excerpt: (parsed.excerpt ?? plain.slice(0, 200)).trim().slice(0, 220),
    metaDescription: (parsed.metaDescription ?? parsed.excerpt ?? parsed.title)
      .trim()
      .slice(0, 160),
    html,
  };
}
