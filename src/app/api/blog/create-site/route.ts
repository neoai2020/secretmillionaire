import { NextResponse } from "next/server";
import { featureApiGuard } from "@/lib/feature-api-guard";
import { getApiUser } from "@/lib/api-auth";
import { slugify } from "@/features/blog-builder/lib/seo";
import type { ArmedLink } from "@/features/blog-builder/types";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const guard = featureApiGuard("blog-builder");
  if (guard) return guard;

  const { supabase, user } = await getApiUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const hobby = typeof body.hobby === "string" ? body.hobby.trim() : "";
  const territory =
    typeof body.territory === "string" ? body.territory.trim() : hobby;
  const armedLinks = Array.isArray(body.armedLinks) ? (body.armedLinks as ArmedLink[]) : [];

  if (!hobby) return NextResponse.json({ error: "hobby is required" }, { status: 400 });

  const title = `${territory} Money Site`;
  const baseSlug = slugify(territory) || slugify(hobby) || "site";
  const slug = `${baseSlug}-${user.id.slice(0, 8)}`;

  const { data: existing } = await supabase
    .from("sites")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  const payload = {
    user_id: user.id,
    hobby,
    title,
    tagline: `Your private cash asset for ${territory}`,
    slug,
    armed_links: armedLinks,
    status: "draft" as const,
  };

  if (existing?.id) {
    const { data, error } = await supabase
      .from("sites")
      .update(payload)
      .eq("id", existing.id)
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ site: data });
  }

  const { data, error } = await supabase.from("sites").insert(payload).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ site: data });
}
