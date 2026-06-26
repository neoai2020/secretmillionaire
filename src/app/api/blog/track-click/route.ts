import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

function getAnonClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const to = searchParams.get("to");
  const postId = searchParams.get("post");
  const siteId = searchParams.get("site");

  if (!to) {
    return NextResponse.json({ error: "Missing destination" }, { status: 400 });
  }

  let target: URL;
  try {
    target = new URL(to);
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  const supabase = getAnonClient();
  await supabase.from("affiliate_clicks").insert({
    post_id: postId || null,
    site_id: siteId || null,
    link_url: target.toString(),
  });

  return NextResponse.redirect(target.toString(), 302);
}
