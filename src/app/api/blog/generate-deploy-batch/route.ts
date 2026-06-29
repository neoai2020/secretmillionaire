import { NextResponse } from "next/server";
import { featureApiGuard } from "@/lib/feature-api-guard";
import { getApiUser } from "@/lib/api-auth";
import {
  generateAndSavePost,
  loadOwnedSite,
  POST_GENERATION_ATTEMPTS,
} from "@/features/blog-builder/lib/generation-pipeline";
import { buildClusterTopics } from "@/features/blog-builder/lib/templates";
import { getSiteTerritory } from "@/features/blog-builder/lib/site-territory";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/** Generate all pending deploy posts in one server request (text only — images attached later). */
export async function POST(request: Request) {
  const guard = featureApiGuard("blog-builder");
  if (guard) return guard;

  const { supabase, user } = await getApiUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const siteId = typeof body.siteId === "string" ? body.siteId : "";
  const productContext = typeof body.productContext === "string" ? body.productContext : "";
  const startIndex = typeof body.startIndex === "number" ? Math.max(0, body.startIndex) : 0;

  if (!siteId) {
    return NextResponse.json({ error: "siteId is required" }, { status: 400 });
  }

  const site = await loadOwnedSite(supabase, user.id, siteId);
  if (!site) return NextResponse.json({ error: "Site not found" }, { status: 404 });

  const territory = getSiteTerritory(site);
  const topics = buildClusterTopics(territory, site.hobby);
  const pending = topics.slice(startIndex);

  const results: Array<{ index: number; topic: ClusterTopic; post?: unknown; error?: string }> = [];

  for (let offset = 0; offset < pending.length; offset++) {
    const index = startIndex + offset;
    const topic = pending[offset];
    let saved = false;

    for (let attempt = 0; attempt < POST_GENERATION_ATTEMPTS; attempt++) {
      if (attempt > 0) {
        await new Promise((r) => setTimeout(r, 2000 * attempt));
      }

      try {
        const result = await generateAndSavePost({
          supabase,
          userId: user.id,
          site,
          topic,
          productContext,
          skipImage: true,
        });
        results.push({ index, topic, post: result.post });
        saved = true;
        break;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Generation failed";
        if (attempt === POST_GENERATION_ATTEMPTS - 1) {
          results.push({ index, topic, error: message });
        }
      }
    }

    if (!saved && !results.some((r) => r.index === index)) {
      results.push({ index, topic, error: "Generation failed" });
    }

    if (offset < pending.length - 1) {
      await new Promise((r) => setTimeout(r, 400));
    }
  }

  const failures = results.filter((r) => r.error);
  const posts = results.filter((r) => r.post).map((r) => r.post);

  return NextResponse.json({
    results,
    posts,
    failures: failures.map((f) => ({ index: f.index, slug: f.topic.slug, error: f.error })),
    completedCount: posts.length,
    totalCount: pending.length,
  });
}
