import { NextResponse } from "next/server";
import { expandKeywords } from "@/features/core-workflow/lib/llm";
import { featureApiGuard } from "@/lib/feature-api-guard";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
    const blocked = featureApiGuard("core-workflow");
    if (blocked) return blocked;
    let keyword = "Business";
    try {
        const body = await req.json();
        keyword = body.keyword || "Business";

        if (!body.keyword) return NextResponse.json({ error: "Keyword required" }, { status: 400 });

        const { data: existing } = await supabase
            .from("keyword_variations")
            .select("variations")
            .eq("parent_keyword", keyword)
            .single();

        if (existing) {
            return NextResponse.json({ variations: existing.variations });
        }

        const variations = await expandKeywords(body.keyword);

        const { error } = await supabase.from("keyword_variations").insert([{
            parent_keyword: keyword,
            variations: variations
        }]);

        if (error) console.error("Supabase Persistence Error (keyword_variations):", error);

        return NextResponse.json({ variations });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to analyze marketplace. Please try again.";
        console.error("Radar Error:", error);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
