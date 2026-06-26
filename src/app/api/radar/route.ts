import { NextResponse } from "next/server";
import { expandKeywords } from "@/features/core-workflow/lib/llm";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
    console.log(">>> [API/RADAR] Incoming Request");
    let keyword = "Business";
    try {
        const body = await req.json();
        console.log(">>> [API/RADAR] Body:", body);
        keyword = body.keyword || "Business";

        if (!body.keyword) return NextResponse.json({ error: "Keyword required" }, { status: 400 });

        const { data: existing } = await supabase
            .from("keyword_variations")
            .select("variations")
            .eq("parent_keyword", keyword)
            .single();

        if (existing) {
            console.log(">>> [API/RADAR] Cache Hit for:", keyword);
            return NextResponse.json({ variations: existing.variations });
        }

        console.log(">>> [API/RADAR] Cache Miss. Calling LLM...");
        const variations = await expandKeywords(body.keyword);

        // Persist to Supabase
        const { error } = await supabase.from("keyword_variations").insert([{
            parent_keyword: keyword,
            variations: variations
        }]);

        if (error) console.error("Supabase Persistence Error (keyword_variations):", error);

        return NextResponse.json({ variations });
    } catch (error: any) {
        console.error("Radar Error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to analyze marketplace. Please try again." },
            { status: 500 }
        );
    }
}
