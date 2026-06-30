import { NextResponse } from "next/server";
import { featureApiGuard } from "@/lib/feature-api-guard";
import { getApiUser } from "@/lib/api-auth";
import { NO_STORE_HEADERS } from "@/lib/api-cache-headers";
import { generateWithGPT, extractJsonFromText } from "@/features/blog-builder/lib/ai";
import { getSiteTerritory } from "@/features/blog-builder/lib/site-territory";
import {
  listFacebookPostsForSite,
  saveFacebookPostBatch,
} from "@/features/blog-builder/lib/facebook-posts-vault";
import type { BlogSite } from "@/features/blog-builder/types";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

const POST_COUNT = 10;

async function loadOwnedSite(supabase: Awaited<ReturnType<typeof getApiUser>>["supabase"], userId: string, siteId: string) {
  const { data: site } = await supabase
    .from("sites")
    .select("*")
    .eq("id", siteId)
    .eq("user_id", userId)
    .maybeSingle();

  return (site as BlogSite | null) ?? null;
}

/** List saved Facebook posts for a money site (Asset Vault + Accelerator). */
export async function GET(request: Request) {
  const vaultGuard = featureApiGuard("blog-builder");
  const accelGuard = featureApiGuard("premium-accelerator");
  if (vaultGuard && accelGuard) return vaultGuard;

  const { supabase, user } = await getApiUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: NO_STORE_HEADERS });
  }

  const siteId = new URL(request.url).searchParams.get("siteId") ?? "";
  if (!siteId) {
    return NextResponse.json({ error: "siteId is required" }, { status: 400, headers: NO_STORE_HEADERS });
  }

  const site = await loadOwnedSite(supabase, user.id, siteId);
  if (!site) {
    return NextResponse.json({ error: "Site not found" }, { status: 404, headers: NO_STORE_HEADERS });
  }

  try {
    const posts = await listFacebookPostsForSite(supabase, user.id, siteId);
    return NextResponse.json({ posts, slug: site.slug, count: posts.length }, { headers: NO_STORE_HEADERS });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to load posts";
    return NextResponse.json({ error: msg }, { status: 500, headers: NO_STORE_HEADERS });
  }
}

/** Generate and append Facebook posts for a money site. */
export async function POST(request: Request) {
  const guard = featureApiGuard("premium-accelerator");
  if (guard) return guard;

  const { supabase, user } = await getApiUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const siteId = typeof body.siteId === "string" ? body.siteId : "";
  if (!siteId) return NextResponse.json({ error: "siteId is required" }, { status: 400 });

  const typedSite = await loadOwnedSite(supabase, user.id, siteId);
  if (!typedSite) return NextResponse.json({ error: "Site not found" }, { status: 404 });

  const territory = getSiteTerritory(typedSite);

  const { data: postRows } = await supabase
    .from("posts")
    .select("title")
    .eq("site_id", siteId)
    .limit(8);

  const articleTitles = (postRows ?? [])
    .map((p) => (p as { title: string }).title)
    .filter(Boolean);

  const system = `You are a direct-response social media copywriter. You write scroll-stopping Facebook posts that get clicks.
Return ONLY JSON: { "posts": ["...", ...] } with no commentary.`;

  const userPrompt = [
    `Write ${POST_COUNT} short Facebook posts that promote this website and make people want to click through.`,
    `Website topic / niche: ${territory}`,
    typedSite.title ? `Website name: ${typedSite.title}` : "",
    articleTitles.length ? `Some articles on the site:\n- ${articleTitles.join("\n- ")}` : "",
    "",
    "Rules for each post:",
    "- 1-3 sentences, conversational and curiosity-driven (personal-story or helpful-tip angle).",
    "- A light emoji or two is fine; do NOT use hashtags.",
    "- Vary the hooks so the 10 posts feel distinct.",
    "- Each post MUST end with the exact placeholder [LINK] (the app swaps in the real URL).",
    "- Do not invent fake statistics, prices, or brand names.",
    "",
    `Return ONLY JSON: { "posts": [ ${POST_COUNT} strings ] }`,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const raw = await generateWithGPT(system, userPrompt, { temperature: 0.8, maxRetries: 3 });
    const parsed = extractJsonFromText(raw) as { posts?: unknown } | null;

    let generated = Array.isArray(parsed?.posts)
      ? (parsed!.posts as unknown[]).filter((p): p is string => typeof p === "string" && p.trim().length > 0)
      : [];

    generated = generated
      .map((p) => (p.includes("[LINK]") ? p : `${p.trim()} [LINK]`))
      .slice(0, POST_COUNT);

    if (generated.length === 0) {
      return NextResponse.json({ error: "The generator returned nothing. Please try again." }, { status: 502 });
    }

    const saved = await saveFacebookPostBatch(supabase, user.id, siteId, generated);

    return NextResponse.json({
      posts: saved,
      slug: typedSite.slug,
      batchCount: saved.length,
      totalSaved: saved.length,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Generation failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
