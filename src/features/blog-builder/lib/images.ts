import { randomUUID } from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY ?? "";
const RAPIDAPI_IMAGE_HOST =
  process.env.RAPIDAPI_IMAGE_HOST ?? "google-nano-banana4.p.rapidapi.com";

export function pollinationsImageUrl(title: string, hobby: string): string {
  const prompt = [
    "professional blog hero image",
    hobby,
    title,
    "photorealistic",
    "vibrant",
    "no text",
    "no watermark",
  ].join(", ");

  const seed = title.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);

  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1200&height=800&seed=${seed}&nologo=true`;
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
    if (/^https?:\/\//i.test(s)) return null;
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

async function callNanoBanana(prompt: string): Promise<Buffer | null> {
  if (!RAPIDAPI_KEY) return null;

  try {
    const response = await fetch(`https://${RAPIDAPI_IMAGE_HOST}/txt-to-img`, {
      method: "POST",
      headers: {
        "x-rapidapi-key": RAPIDAPI_KEY,
        "x-rapidapi-host": RAPIDAPI_IMAGE_HOST,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt: prompt.slice(0, 500) }),
      signal: AbortSignal.timeout(90000),
    });

    if (!response.ok) return null;

    const data = await response.json();
    const b64 = findBase64InResponse(data);
    if (b64) return Buffer.from(b64, "base64");

    const url =
      typeof data === "object" && data && "url" in data && typeof data.url === "string"
        ? data.url
        : null;
    if (url) {
      const imgRes = await fetch(url, { signal: AbortSignal.timeout(60000) });
      if (imgRes.ok) return Buffer.from(await imgRes.arrayBuffer());
    }
  } catch {
    return null;
  }
  return null;
}

export async function resolvePostImage(params: {
  title: string;
  hobby: string;
  userId: string;
  supabase: SupabaseClient;
  /** Skip slow RapidAPI image gen — use Pollinations only (faster deploy). */
  fast?: boolean;
}): Promise<{ url: string; alt: string }> {
  const alt = `${params.title} — ${params.hobby} guide`;
  const prompt = `Professional blog hero photo about ${params.hobby}: ${params.title}. Photorealistic, vibrant, no text.`;

  const buffer = params.fast ? null : await callNanoBanana(prompt);
  if (buffer) {
    const fileName = `${params.userId}/${randomUUID()}.png`;
    const { error } = await params.supabase.storage
      .from("blog-images")
      .upload(fileName, buffer, { contentType: "image/png", upsert: false });

    if (!error) {
      const { data } = params.supabase.storage.from("blog-images").getPublicUrl(fileName);
      return { url: data.publicUrl, alt };
    }
  }

  return { url: pollinationsImageUrl(params.title, params.hobby), alt };
}
