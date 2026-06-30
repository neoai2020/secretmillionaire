import { randomUUID } from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { buildHeroImagePrompt, buildHeroImageNegativePrompt } from "./prompts";
import { mapWithConcurrency } from "./concurrency";

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY ?? "";
const RAPIDAPI_IMAGE_HOST =
  process.env.RAPIDAPI_IMAGE_HOST ?? "google-nano-banana4.p.rapidapi.com";
const RAPIDAPI_IMAGE_CREATE_PATH =
  process.env.RAPIDAPI_IMAGE_CREATE_PATH ?? "index.php";
const RAPIDAPI_IMAGE_OUTPUT_PATH =
  process.env.RAPIDAPI_IMAGE_OUTPUT_PATH ?? "index.php";
const RAPIDAPI_IMAGE_OUTPUT_QUERY =
  process.env.RAPIDAPI_IMAGE_OUTPUT_QUERY ?? "id";

// PR Labs (chatgpt-42) text-to-image — same RapidAPI key/subscription as text.
const RAPIDAPI_TEXT_HOST = process.env.RAPIDAPI_HOST ?? "chatgpt-42.p.rapidapi.com";
const RAPIDAPI_TEXTTOIMAGE_PATH = process.env.RAPIDAPI_TEXTTOIMAGE_PATH ?? "texttoimage3";
const TEXTTOIMAGE_TIMEOUT_MS = 45_000;

const PIXABAY_API_KEY = process.env.PIXABAY_API_KEY ?? "";
const PIXABAY_TIMEOUT_MS = 5_000;

const NANO_TIMEOUT_MS = 12_000;
const ULTRA_FAST_CREATE_TIMEOUT_MS = 25_000;
const ULTRA_FAST_POLL_TIMEOUT_MS = 8_000;
const ULTRA_FAST_MAX_POLLS = 20;
const ULTRA_FAST_POLL_INTERVAL_MS = 1_500;
const POLLINATIONS_TIMEOUT_MS = 10_000;
const FAST_POLLINATIONS_TIMEOUT_MS = 7_000;
const FAST_PICSUM_TIMEOUT_MS = 4_000;

const STOP_WORDS = new Set([
  "the", "a", "an", "and", "or", "for", "to", "of", "in", "on", "with", "your",
  "best", "top", "guide", "review", "reviews", "vs", "under", "how", "what",
  "why", "is", "are", "buyers", "buyer", "buying", "tips", "avoid", "mistakes",
  "honest", "worth", "picks", "week", "simple", "plan", "first", "beginner",
  "beginners", "advanced", "pro", "insider", "maximize", "results", "budget",
  "growth", "tools", "tool", "magic", "tube", "2026", "2025", "2024",
]);

/** Visual search phrases that match what stock libraries actually have. */
const HOBBY_VISUAL_QUERIES: Record<string, string> = {
  "YouTube / AI Tools": "youtube creator video editing laptop studio",
  "Pet Training": "dog training happy owner puppy",
  "Health Supplements": "health wellness vitamins supplements",
  "Online Education": "online learning student laptop classroom",
  "Financial Education": "personal finance budget planning desk",
  "Presentations / Software": "business presentation laptop office",
  "Affiliate Marketing": "online business entrepreneur laptop",
  "Dating / Relationships": "happy couple relationship together",
  "AI Writing Tools": "writer laptop content creation desk",
  "AI Platform": "artificial intelligence technology computer office",
};

function tokenizeForQuery(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w) && !/^\d+$/.test(w));
}

/** Build a concise Pixabay search query — hobby visuals first, not product brand names. */
function buildPixabayQuery(title: string, subject: string, hobby?: string): string {
  const hobbyHint = hobby?.trim() ? HOBBY_VISUAL_QUERIES[hobby.trim()] : undefined;
  const subjectTokens = new Set(tokenizeForQuery(subject));
  const titleTokens = tokenizeForQuery(title).filter((w) => !subjectTokens.has(w));

  if (hobbyHint) {
    const extra = titleTokens.slice(0, 2).join(" ");
    return `${hobbyHint}${extra ? ` ${extra}` : ""}`.slice(0, 100);
  }

  const words = tokenizeForQuery(`${subject} ${title}`);
  const seen = new Set<string>();
  const unique: string[] = [];
  for (const w of words) {
    if (seen.has(w)) continue;
    seen.add(w);
    unique.push(w);
    if (unique.length >= 5) break;
  }

  return unique.join(" ").slice(0, 100);
}

interface PixabayHit {
  id?: number;
  largeImageURL?: string;
  webformatURL?: string;
  imageWidth?: number;
  imageHeight?: number;
}

interface ImagePickOptions {
  pickOffset?: number;
  excludeUrls?: string[];
  excludeStockIds?: string[];
  hobby?: string;
  /** Extra seed variation (e.g. post index) so similar titles pick different hits. */
  seedBoost?: number;
}

export interface StockImageResult {
  url: string;
  stockId: string;
}

function normalizeImageUrl(url: string): string {
  try {
    const parsed = new URL(url);
    return `${parsed.hostname}${parsed.pathname}`;
  } catch {
    return url.split("?")[0] ?? url;
  }
}

function isExcludedUrl(url: string, excludeUrls: string[]): boolean {
  const key = normalizeImageUrl(url);
  return excludeUrls.some((ex) => normalizeImageUrl(ex) === key || ex === url);
}

function stockIdForHit(hit: PixabayHit, imageUrl: string): string {
  return hit.id ? `pixabay:${hit.id}` : normalizeImageUrl(imageUrl);
}

/**
 * Look up a relevant free stock photo from Pixabay.
 */
export async function fetchPixabayImage(
  title: string,
  subject: string,
  options?: ImagePickOptions
): Promise<StockImageResult | null> {
  if (!PIXABAY_API_KEY) {
    console.warn("[images] PIXABAY_API_KEY not set — skipping stock photos");
    return null;
  }

  const query = buildPixabayQuery(title, subject, options?.hobby);
  if (!query) return null;

  const url = new URL("https://pixabay.com/api/");
  url.searchParams.set("key", PIXABAY_API_KEY);
  url.searchParams.set("q", query);
  url.searchParams.set("image_type", "photo");
  url.searchParams.set("orientation", "horizontal");
  url.searchParams.set("safesearch", "true");
  url.searchParams.set("order", "popular");
  url.searchParams.set("per_page", "40");
  url.searchParams.set("min_width", "1200");

  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(PIXABAY_TIMEOUT_MS) });
    if (!response.ok) return null;

    const data = (await response.json()) as { hits?: PixabayHit[] };
    const hits = (data.hits ?? []).filter(
      (h) => (h.largeImageURL || h.webformatURL) && (h.imageWidth ?? 0) >= (h.imageHeight ?? 1)
    );
    if (hits.length === 0) return null;

    const seed =
      title.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) + (options?.seedBoost ?? 0) * 17;
    const offset = options?.pickOffset ?? 0;
    const exclude = options?.excludeUrls ?? [];
    const excludeIds = new Set(options?.excludeStockIds ?? []);

    for (let i = 0; i < hits.length; i++) {
      const hit = hits[(seed + offset + i) % hits.length];
      const imageUrl = hit.largeImageURL || hit.webformatURL || null;
      if (!imageUrl) continue;
      const stockId = stockIdForHit(hit, imageUrl);
      if (excludeIds.has(stockId)) continue;
      if (isExcludedUrl(imageUrl, exclude)) continue;
      console.info("[images] pixabay hit", query.slice(0, 48));
      return { url: imageUrl, stockId };
    }
    return null;
  } catch {
    return null;
  }
}

async function fetchPixabayImageUrl(
  title: string,
  subject: string,
  options?: ImagePickOptions
): Promise<string | null> {
  const hit = await fetchPixabayImage(title, subject, options);
  return hit?.url ?? null;
}

export function pollinationsImageUrl(title: string, subject: string, seedOffset = 0): string {
  const prompt = buildHeroImagePrompt(title, subject);

  const seed =
    title.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) + seedOffset;

  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1200&height=800&seed=${seed}&nologo=true`;
}

function picsumFallbackUrl(title: string, seedOffset = 0): string {
  const seed = title.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) + seedOffset;
  return `https://picsum.photos/seed/sms-${seed}/1200/800`;
}

function findBase64InResponse(val: unknown, depth = 0): string | null {
  if (depth > 8 || val == null) return null;
  if (typeof val === "string") {
    const s = val.trim();
    if (s.startsWith("data:image")) {
      const comma = s.indexOf(",");
      return comma !== -1 ? s.slice(comma + 1) : null;
    }
    const compact = s.replace(/\s/g, "");
    if (compact.length > 200 && /^[A-Za-z0-9+/]+=*$/.test(compact)) {
      return compact;
    }
    return null;
  }
  if (Array.isArray(val)) {
    for (const item of val) {
      const found = findBase64InResponse(item, depth + 1);
      if (found) return found;
    }
    return null;
  }
  if (typeof val === "object") {
    for (const v of Object.values(val as Record<string, unknown>)) {
      const found = findBase64InResponse(v, depth + 1);
      if (found) return found;
    }
  }
  return null;
}

function isUltraFastNanoBananaHost(host: string): boolean {
  return host.includes("ultra-fast-nano-banana");
}

function rapidApiHeaders(host: string): Record<string, string> {
  return {
    "x-rapidapi-key": RAPIDAPI_KEY,
    "x-rapidapi-host": host,
    "Content-Type": "application/json",
  };
}

function findRemoteImageUrl(val: unknown, depth = 0): string | null {
  if (depth > 8 || val == null) return null;

  if (typeof val === "string") {
    const s = val.trim();
    if (/^https?:\/\//i.test(s) && /\.(png|jpe?g|webp|gif)(\?|$)/i.test(s)) {
      return s;
    }
    if (/^https?:\/\//i.test(s) && s.includes("image")) return s;
    return null;
  }

  if (Array.isArray(val)) {
    for (const item of val) {
      const found = findRemoteImageUrl(item, depth + 1);
      if (found) return found;
    }
    return null;
  }

  if (typeof val === "object") {
    const obj = val as Record<string, unknown>;
    const preferredKeys = [
      "imageUrl",
      "image_url",
      "resultImageUrl",
      "result_image_url",
      "output_url",
      "url",
      "image",
    ];
    for (const key of preferredKeys) {
      const v = obj[key];
      if (typeof v === "string" && /^https?:\/\//i.test(v)) return v;
    }
    for (const v of Object.values(obj)) {
      const found = findRemoteImageUrl(v, depth + 1);
      if (found) return found;
    }
  }

  return null;
}

function findTaskId(val: unknown, depth = 0): string | null {
  if (depth > 8 || val == null) return null;

  if (typeof val === "object" && !Array.isArray(val)) {
    const obj = val as Record<string, unknown>;
    const preferredKeys = ["task_id", "taskId", "request_id", "requestId", "id", "job_id"];
    for (const key of preferredKeys) {
      const v = obj[key];
      if (typeof v === "string" && v.trim()) return v.trim();
      if (typeof v === "number" && Number.isFinite(v)) return String(v);
    }
    for (const v of Object.values(obj)) {
      const found = findTaskId(v, depth + 1);
      if (found) return found;
    }
  }

  return null;
}

async function bufferFromRapidApiImageResponse(data: unknown): Promise<Buffer | null> {
  const b64 = findBase64InResponse(data);
  if (b64) return Buffer.from(b64, "base64");

  const remoteUrl = findRemoteImageUrl(data);
  if (remoteUrl) return fetchImageBuffer(remoteUrl, 15_000);

  return null;
}

async function fetchImageBuffer(url: string, timeoutMs: number): Promise<Buffer | null> {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
    if (!response.ok) return null;
    const type = response.headers.get("content-type") ?? "";
    if (!type.startsWith("image/")) return null;
    return Buffer.from(await response.arrayBuffer());
  } catch {
    return null;
  }
}

async function pollUltraFastOutput(taskId: string): Promise<Buffer | null> {
  const queryKeys = [
    RAPIDAPI_IMAGE_OUTPUT_QUERY,
    "task_id",
    "taskId",
    "id",
    "request_id",
  ].filter((key, index, arr) => arr.indexOf(key) === index);

  for (let attempt = 0; attempt < ULTRA_FAST_MAX_POLLS; attempt++) {
    if (attempt > 0) {
      await new Promise((r) => setTimeout(r, ULTRA_FAST_POLL_INTERVAL_MS));
    }

    for (const queryKey of queryKeys) {
      const url = new URL(`https://${RAPIDAPI_IMAGE_HOST}/${RAPIDAPI_IMAGE_OUTPUT_PATH}`);
      url.searchParams.set(queryKey, taskId);

      try {
        const response = await fetch(url, {
          method: "GET",
          headers: rapidApiHeaders(RAPIDAPI_IMAGE_HOST),
          signal: AbortSignal.timeout(ULTRA_FAST_POLL_TIMEOUT_MS),
        });
        if (!response.ok) continue;

        const data = await response.json();
        if (typeof data === "object" && data && "success" in data && data.success === false) {
          continue;
        }

        const buffer = await bufferFromRapidApiImageResponse(data);
        if (buffer) return buffer;
      } catch {
        /* try next query key / poll */
      }
    }
  }

  return null;
}

async function callUltraFastNanoBanana(
  prompt: string,
  negativePrompt: string,
  referenceImageUrl: string
): Promise<Buffer | null> {
  if (!RAPIDAPI_KEY) return null;

  const fullPrompt = negativePrompt
    ? `${prompt.slice(0, 450)}\n\nAvoid: ${negativePrompt.slice(0, 200)}`
    : prompt.slice(0, 500);

  try {
    const response = await fetch(
      `https://${RAPIDAPI_IMAGE_HOST}/${RAPIDAPI_IMAGE_CREATE_PATH}`,
      {
        method: "POST",
        headers: rapidApiHeaders(RAPIDAPI_IMAGE_HOST),
        body: JSON.stringify({
          prompt: fullPrompt,
          image_urls: [referenceImageUrl],
        }),
        signal: AbortSignal.timeout(ULTRA_FAST_CREATE_TIMEOUT_MS),
      }
    );

    if (!response.ok) return null;

    const data = await response.json();
    if (typeof data === "object" && data && "success" in data && data.success === false) {
      return null;
    }

    const immediate = await bufferFromRapidApiImageResponse(data);
    if (immediate) return immediate;

    const taskId = findTaskId(data);
    if (taskId) return pollUltraFastOutput(taskId);
  } catch {
    return null;
  }

  return null;
}

async function callLegacyNanoBanana(
  prompt: string,
  negativePrompt: string
): Promise<Buffer | null> {
  if (!RAPIDAPI_KEY) return null;

  try {
    const response = await fetch(`https://${RAPIDAPI_IMAGE_HOST}/txt-to-img`, {
      method: "POST",
      headers: rapidApiHeaders(RAPIDAPI_IMAGE_HOST),
      body: JSON.stringify({
        prompt: prompt.slice(0, 500),
        negative_prompt: negativePrompt.slice(0, 300),
      }),
      signal: AbortSignal.timeout(NANO_TIMEOUT_MS),
    });

    if (!response.ok) return null;

    const data = await response.json();
    return bufferFromRapidApiImageResponse(data);
  } catch {
    return null;
  }
}

async function callRapidApiImage(params: {
  prompt: string;
  negativePrompt: string;
  referenceImageUrl: string;
}): Promise<Buffer | null> {
  if (!RAPIDAPI_KEY) return null;

  if (isUltraFastNanoBananaHost(RAPIDAPI_IMAGE_HOST)) {
    return callUltraFastNanoBanana(
      params.prompt,
      params.negativePrompt,
      params.referenceImageUrl
    );
  }

  return callLegacyNanoBanana(params.prompt, params.negativePrompt);
}

/**
 * Generate an image via the PR Labs (chatgpt-42) text-to-image endpoint using
 * the same RapidAPI key as text generation. Returns the hosted image URL.
 * NOTE: shares the account's per-second rate limit with article text calls.
 */
async function prLabsImageUrl(prompt: string): Promise<string | null> {
  if (!RAPIDAPI_KEY) return null;
  try {
    const res = await fetch(`https://${RAPIDAPI_TEXT_HOST}/${RAPIDAPI_TEXTTOIMAGE_PATH}`, {
      method: "POST",
      headers: {
        "x-rapidapi-key": RAPIDAPI_KEY,
        "x-rapidapi-host": RAPIDAPI_TEXT_HOST,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: prompt.slice(0, 500), width: 1024, height: 768 }),
      signal: AbortSignal.timeout(TEXTTOIMAGE_TIMEOUT_MS),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const url =
      typeof (data as { generated_image?: unknown })?.generated_image === "string"
        ? (data as { generated_image: string }).generated_image
        : findRemoteImageUrl(data);
    return url && /^https?:\/\//i.test(url) ? url : null;
  } catch {
    return null;
  }
}

async function prLabsImageBuffer(prompt: string): Promise<Buffer | null> {
  const url = await prLabsImageUrl(prompt);
  return url ? fetchImageBuffer(url, 20_000) : null;
}

async function uploadToBlogImages(
  supabase: SupabaseClient,
  userId: string,
  buffer: Buffer,
  ext: "png" | "jpg" = "jpg"
): Promise<string | null> {
  const fileName = `${userId}/${randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from("blog-images")
    .upload(fileName, buffer, {
      contentType: ext === "png" ? "image/png" : "image/jpeg",
      upsert: false,
    });

  if (error) return null;
  const { data } = supabase.storage.from("blog-images").getPublicUrl(fileName);
  return data.publicUrl;
}

const CONTENT_TYPE_EXT: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};

export function isSupportedImageType(contentType: string): boolean {
  return contentType.toLowerCase() in CONTENT_TYPE_EXT;
}

/**
 * Persist a user-uploaded image to the `blog-images` bucket and return its
 * public URL. Used by the manual image upload / replace flow in the editor.
 */
export async function uploadUserImage(params: {
  supabase: SupabaseClient;
  userId: string;
  buffer: Buffer;
  contentType: string;
}): Promise<string | null> {
  const ext = CONTENT_TYPE_EXT[params.contentType.toLowerCase()] ?? "jpg";
  const fileName = `${params.userId}/uploads/${randomUUID()}.${ext}`;
  const { error } = await params.supabase.storage
    .from("blog-images")
    .upload(fileName, params.buffer, {
      contentType: params.contentType,
      upsert: false,
    });

  if (error) return null;
  const { data } = params.supabase.storage.from("blog-images").getPublicUrl(fileName);
  return data.publicUrl;
}

export interface ResolvedImage {
  url: string;
  alt: string;
  stockId?: string;
}

/**
 * FAST path: return a directly-usable image URL with NO download/upload.
 */
export async function resolveFastImageUrl(params: {
  title: string;
  subject: string;
  hobby?: string;
  pickOffset?: number;
  seedBoost?: number;
  excludeUrls?: string[];
  excludeStockIds?: string[];
}): Promise<ResolvedImage> {
  const alt = `${params.title} — ${params.subject}`;
  const offset = params.pickOffset ?? 0;
  const exclude = params.excludeUrls ?? [];
  const excludeStockIds = params.excludeStockIds ?? [];

  const pixabay = await fetchPixabayImage(params.title, params.subject, {
    pickOffset: offset,
    excludeUrls: exclude,
    excludeStockIds,
    hobby: params.hobby,
    seedBoost: params.seedBoost,
  });
  if (pixabay) return { url: pixabay.url, alt, stockId: pixabay.stockId };

  const ai = await prLabsImageUrl(buildHeroImagePrompt(params.title, params.subject));
  if (ai && !isExcludedUrl(ai, exclude)) return { url: ai, alt, stockId: normalizeImageUrl(ai) };

  const pollUrl = pollinationsImageUrl(params.title, params.subject, offset + (params.seedBoost ?? 0));
  if (!isExcludedUrl(pollUrl, exclude)) {
    return { url: pollUrl, alt, stockId: normalizeImageUrl(pollUrl) };
  }

  const picsum = picsumFallbackUrl(params.title, offset + (params.seedBoost ?? 0) + 1);
  if (!isExcludedUrl(picsum, exclude)) {
    return { url: picsum, alt, stockId: normalizeImageUrl(picsum) };
  }

  const fallback = pollinationsImageUrl(params.title, params.subject, offset + (params.seedBoost ?? 0) + 2);
  return { url: fallback, alt, stockId: normalizeImageUrl(fallback) };
}

/** Prefetch hero images for all cluster topics (runs while GPT writes). */
export async function prefetchTopicImages(
  topics: ReadonlyArray<{ title: string; slug: string }>,
  subject: string,
  _concurrency = 4
): Promise<Record<string, ResolvedImage>> {
  const usedUrls: string[] = [];
  const out: Record<string, ResolvedImage> = {};

  for (const topic of topics) {
    const image = await resolveFastImageUrl({
      title: topic.title,
      subject,
      excludeUrls: usedUrls,
    });
    if (image.url) {
      usedUrls.push(image.url);
      out[topic.slug] = image;
    }
  }

  return out;
}

/**
 * Download an external image URL and cache it to Supabase Storage.
 * Returns the new public URL, or null on failure (caller keeps the original).
 */
export async function persistExternalImage(params: {
  url: string;
  userId: string;
  supabase: SupabaseClient;
}): Promise<string | null> {
  if (!params.url || params.url.includes("/blog-images/")) return null;
  const buffer = await fetchImageBuffer(params.url, 20_000);
  if (!buffer) return null;
  return uploadToBlogImages(params.supabase, params.userId, buffer);
}

/**
 * Always returns a Supabase-hosted URL (never a hotlinked Pollinations URL).
 */
export async function resolvePostImage(params: {
  title: string;
  subject: string;
  userId: string;
  supabase: SupabaseClient;
  /** Skip slow NanoBanana during bulk deploy — Pollinations + picsum only. */
  fast?: boolean;
}): Promise<{ url: string; alt: string }> {
  const alt = `${params.title} — ${params.subject}`;
  const prompt = buildHeroImagePrompt(params.title, params.subject);
  const negative = buildHeroImageNegativePrompt();
  const pollinations = pollinationsImageUrl(params.title, params.subject);

  // Stock-first: a relevant free Pixabay photo resolves in well under a second
  // and looks more professional than generation. Only generate if none is found.
  const stockSource = async (): Promise<Buffer | null> => {
    const stockUrl = await fetchPixabayImageUrl(params.title, params.subject);
    return stockUrl ? fetchImageBuffer(stockUrl, PIXABAY_TIMEOUT_MS) : null;
  };

  const sources: Array<() => Promise<Buffer | null>> = params.fast
    ? [
        stockSource,
        () => prLabsImageBuffer(prompt),
        () => fetchImageBuffer(pollinations, FAST_POLLINATIONS_TIMEOUT_MS),
        () => fetchImageBuffer(picsumFallbackUrl(params.title), FAST_PICSUM_TIMEOUT_MS),
      ]
    : [
        stockSource,
        () => prLabsImageBuffer(prompt),
        () =>
          callRapidApiImage({
            prompt,
            negativePrompt: negative,
            referenceImageUrl: pollinations,
          }),
        () => fetchImageBuffer(pollinations, POLLINATIONS_TIMEOUT_MS),
        () => fetchImageBuffer(picsumFallbackUrl(params.title), 8_000),
      ];

  for (const load of sources) {
    const buffer = await load();
    if (!buffer) continue;
    const url = await uploadToBlogImages(params.supabase, params.userId, buffer);
    if (url) return { url, alt };
  }

  // Never return an imageless post: picsum is a reliable, whitelisted host so a
  // hero always renders even if stock/AI/upload all failed.
  return { url: picsumFallbackUrl(params.title), alt };
}
