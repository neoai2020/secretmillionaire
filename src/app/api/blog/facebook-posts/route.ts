import { NextResponse } from "next/server";
import { featureApiGuard } from "@/lib/feature-api-guard";
import { getApiUser } from "@/lib/api-auth";
import { generateWithGPT, extractJsonFromText } from "@/features/blog-builder/lib/ai";
import { getSiteTerritory } from "@/features/blog-builder/lib/site-territory";
import type { BlogSite } from "@/features/blog-builder/types";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

const POST_COUNT = 10;

export async function POST(request: Request) {
  const guard = featureApiGuard("premium-accelerator");
  if (guard) return guard;

  const { supabase, user } = await getApiUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const siteId = typeof body.siteId === "string" ? body.siteId : "";
  if (!siteId) return NextResponse.json({ error: "siteId is required" }, { status: 400 });

  const { data: site } = await supabase
    .from("sites")
    .select("*")
    .eq("id", siteId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!site) return NextResponse.json({ error: "Site not found" }, { status: 404 });

  const typedSite = site as BlogSite;
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

    let posts = Array.isArray(parsed?.posts)
      ? (parsed!.posts as unknown[]).filter((p): p is string => typeof p === "string" && p.trim().length > 0)
      : [];

    // Guarantee the placeholder is present so the client can insert the link.
    posts = posts.map((p) => (p.includes("[LINK]") ? p : `${p.trim()} [LINK]`)).slice(0, POST_COUNT);

    if (posts.length === 0) {
      return NextResponse.json({ error: "The generator returned nothing. Please try again." }, { status: 502 });
    }

    return NextResponse.json({ posts, slug: typedSite.slug });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Generation failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
