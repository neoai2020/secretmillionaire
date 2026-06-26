import { NextResponse } from "next/server";
import { featureApiGuard } from "@/lib/feature-api-guard";
import { getApiUser } from "@/lib/api-auth";
import { resolvePostImage } from "@/features/blog-builder/lib/images";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function POST(request: Request) {
  const guard = featureApiGuard("blog-builder");
  if (guard) return guard;

  const { supabase, user } = await getApiUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const hobby = typeof body.hobby === "string" ? body.hobby.trim() : "";

  if (!title || !hobby) {
    return NextResponse.json({ error: "title and hobby are required" }, { status: 400 });
  }

  const image = await resolvePostImage({
    title,
    hobby,
    userId: user.id,
    supabase,
  });

  return NextResponse.json(image);
}
