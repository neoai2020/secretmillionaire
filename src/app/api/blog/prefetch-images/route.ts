import { NextResponse } from "next/server";
import { featureApiGuard } from "@/lib/feature-api-guard";
import { prefetchTopicImages } from "@/features/blog-builder/lib/images";
import type { ClusterTopic } from "@/features/blog-builder/types";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

function parseTopics(raw: unknown): Array<{ title: string; slug: string }> {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((t): t is ClusterTopic => {
      if (!t || typeof t !== "object") return false;
      const row = t as Record<string, unknown>;
      return typeof row.title === "string" && typeof row.slug === "string";
    })
    .map((t) => ({ title: t.title, slug: t.slug }));
}

/**
 * Prefetch all deploy hero images in parallel using topic titles (known before GPT).
 * Client runs this alongside sequential text generation so images are ready instantly.
 */
export async function POST(request: Request) {
  const guard = featureApiGuard("blog-builder");
  if (guard) return guard;

  const body = await request.json().catch(() => ({}));
  const topics = parseTopics(body.topics);
  const territory = typeof body.territory === "string" ? body.territory.trim() : "";
  const hobby = typeof body.hobby === "string" ? body.hobby.trim() : "";
  const subject = territory || hobby;

  if (topics.length === 0 || !subject) {
    return NextResponse.json({ error: "topics and territory are required" }, { status: 400 });
  }

  const images = await prefetchTopicImages(topics, subject, hobby || undefined);
  return NextResponse.json({
    images,
    count: Object.keys(images).length,
    total: topics.length,
  });
}
