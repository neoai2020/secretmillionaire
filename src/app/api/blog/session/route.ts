import { NextResponse } from "next/server";
import { featureApiGuard } from "@/lib/feature-api-guard";
import { getApiUser } from "@/lib/api-auth";
import { NO_STORE_HEADERS } from "@/lib/api-cache-headers";

export const dynamic = "force-dynamic";

const defaultSession = {
  step: 0,
  hobby: "",
  territory: "",
  suggestions: [] as string[],
  territory_chosen: false,
  links_armed: false,
  deployed: false,
  site_id: null as string | null,
  site_slug: null as string | null,
};

export async function GET() {
  const guard = featureApiGuard("blog-builder");
  if (guard) return guard;

  const { supabase, user } = await getApiUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: NO_STORE_HEADERS });
  }

  const { data } = await supabase
    .from("blog_builder_sessions")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  return NextResponse.json({ session: data ?? null }, { headers: NO_STORE_HEADERS });
}

export async function PUT(request: Request) {
  const guard = featureApiGuard("blog-builder");
  if (guard) return guard;

  const { supabase, user } = await getApiUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: NO_STORE_HEADERS });
  }

  const body = await request.json();

  const payload = {
    user_id: user.id,
    step: typeof body.step === "number" ? body.step : defaultSession.step,
    hobby: typeof body.hobby === "string" ? body.hobby : defaultSession.hobby,
    territory: typeof body.territory === "string" ? body.territory : defaultSession.territory,
    suggestions: Array.isArray(body.suggestions) ? body.suggestions : defaultSession.suggestions,
    territory_chosen: Boolean(body.territoryChosen ?? body.territory_chosen),
    links_armed: Boolean(body.linksArmed ?? body.links_armed),
    deployed: Boolean(body.deployed),
    site_id: typeof body.siteId === "string" ? body.siteId : body.site_id ?? null,
    site_slug: typeof body.siteSlug === "string" ? body.siteSlug : body.site_slug ?? null,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("blog_builder_sessions")
    .upsert(payload, { onConflict: "user_id" })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: NO_STORE_HEADERS });
  }

  return NextResponse.json({ session: data }, { headers: NO_STORE_HEADERS });
}

export async function DELETE() {
  const guard = featureApiGuard("blog-builder");
  if (guard) return guard;

  const { supabase, user } = await getApiUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: NO_STORE_HEADERS });
  }

  await supabase.from("blog_builder_sessions").delete().eq("user_id", user.id);

  return NextResponse.json({ ok: true }, { headers: NO_STORE_HEADERS });
}
