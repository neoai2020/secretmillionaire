import { NextResponse } from "next/server";
import { featureApiGuard } from "@/lib/feature-api-guard";
import { getApiUser } from "@/lib/api-auth";
import { attachImageToPost } from "@/features/blog-builder/lib/generation-pipeline";

export const dynamic = "force-dynamic";
export const maxDuration = 90;

type RouteContext = { params: Promise<{ postId: string }> };

/** Generate and attach hero image to an existing draft post. */
export async function POST(_request: Request, context: RouteContext) {
  const guard = featureApiGuard("blog-builder");
  if (guard) return guard;

  const { supabase, user } = await getApiUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { postId } = await context.params;

  try {
    const post = await attachImageToPost({ supabase, userId: user.id, postId });
    return NextResponse.json({ post });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Image generation failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
