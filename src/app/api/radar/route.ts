import { NextResponse } from "next/server";
import { expandKeywords } from "@/features/core-workflow/lib/llm";
import { featureApiGuard } from "@/lib/feature-api-guard";
import { getApiUser } from "@/lib/api-auth";

export async function POST(req: Request) {
  const blocked = featureApiGuard("core-workflow");
  if (blocked) return blocked;

  const { supabase, user } = await getApiUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const keyword =
      typeof body.keyword === "string" ? body.keyword.trim().slice(0, 120) : "";

    if (!keyword) {
      return NextResponse.json({ error: "Keyword required" }, { status: 400 });
    }

    const { data: existing } = await supabase
      .from("keyword_variations")
      .select("variations")
      .eq("parent_keyword", keyword)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ variations: existing.variations });
    }

    const variations = await expandKeywords(keyword);

    const { error } = await supabase.from("keyword_variations").insert([
      {
        parent_keyword: keyword,
        variations,
      },
    ]);

    if (error) console.error("Supabase Persistence Error (keyword_variations):", error);

    return NextResponse.json({ variations });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to analyze marketplace. Please try again.";
    console.error("Radar Error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
