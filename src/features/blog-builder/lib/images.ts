import { randomUUID } from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { buildHeroImagePrompt, buildHeroImageNegativePrompt } from "./prompts";

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY ?? "";
const RAPIDAPI_IMAGE_HOST =
  process.env.RAPIDAPI_IMAGE_HOST ?? "google-nano-banana4.p.rapidapi.com";

const NANO_TIMEOUT_MS = 18_000;
const POLLINATIONS_TIMEOUT_MS = 14_000;

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

async function callNanoBanana(prompt: string, negativePrompt: string): Promise<Buffer | null> {
  if (!RAPIDAPI_KEY) return null;

  try {
    const response = await fetch(`https://${RAPIDAPI_IMAGE_HOST}/txt-to-img`, {
      method: "POST",
      headers: {
        "x-rapidapi-key": RAPIDAPI_KEY,
        "x-rapidapi-host": RAPIDAPI_IMAGE_HOST,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: prompt.slice(0, 500),
        negative_prompt: negativePrompt.slice(0, 300),
      }),
      signal: AbortSignal.timeout(NANO_TIMEOUT_MS),
    });

    if (!response.ok) return null;

    const data = await response.json();
    const b64 = findBase64InResponse(data);
    if (b64) return Buffer.from(b64, "base64");

    const remoteUrl =
      typeof data === "object" && data && "url" in data && typeof data.url === "string"
        ? data.url
        : null;
    if (remoteUrl) return fetchImageBuffer(remoteUrl, 12_000);
  } catch {
    return null;
  }
  return null;
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
}): Promise<{ url: string; alt: string }> {
  const alt = `${params.title} — ${params.subject}`;
  const prompt = buildHeroImagePrompt(params.title, params.subject);
  const negative = buildHeroImageNegativePrompt();

  const sources: Array<() => Promise<Buffer | null>> = [
    () => callNanoBanana(prompt, negative),
    () => fetchImageBuffer(pollinationsImageUrl(params.title, params.subject), POLLINATIONS_TIMEOUT_MS),
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
