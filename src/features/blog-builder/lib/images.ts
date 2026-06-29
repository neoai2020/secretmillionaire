import { randomUUID } from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { buildHeroImagePrompt, buildHeroImageNegativePrompt } from "./prompts";

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY ?? "";
const RAPIDAPI_IMAGE_HOST =
  process.env.RAPIDAPI_IMAGE_HOST ?? "google-nano-banana4.p.rapidapi.com";
const RAPIDAPI_IMAGE_CREATE_PATH =
  process.env.RAPIDAPI_IMAGE_CREATE_PATH ?? "index.php";
const RAPIDAPI_IMAGE_OUTPUT_PATH =
  process.env.RAPIDAPI_IMAGE_OUTPUT_PATH ?? "index.php";
const RAPIDAPI_IMAGE_OUTPUT_QUERY =
  process.env.RAPIDAPI_IMAGE_OUTPUT_QUERY ?? "id";

const NANO_TIMEOUT_MS = 12_000;
const ULTRA_FAST_CREATE_TIMEOUT_MS = 25_000;
const ULTRA_FAST_POLL_TIMEOUT_MS = 8_000;
const ULTRA_FAST_MAX_POLLS = 20;
const ULTRA_FAST_POLL_INTERVAL_MS = 1_500;
const POLLINATIONS_TIMEOUT_MS = 10_000;
const FAST_POLLINATIONS_TIMEOUT_MS = 7_000;
const FAST_PICSUM_TIMEOUT_MS = 4_000;

export function pollinationsImageUrl(title: string, subject: string): string {
  const prompt = buildHeroImagePrompt(title, subject);

  const seed = title.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);

  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1200&height=800&seed=${seed}&nologo=true`;
}

function picsumFallbackUrl(title: string): string {
  const seed = title.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
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

  const sources: Array<() => Promise<Buffer | null>> = params.fast
    ? [
        () => fetchImageBuffer(pollinations, FAST_POLLINATIONS_TIMEOUT_MS),
        () => fetchImageBuffer(picsumFallbackUrl(params.title), FAST_PICSUM_TIMEOUT_MS),
      ]
    : [
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

  return { url: "", alt };
}
