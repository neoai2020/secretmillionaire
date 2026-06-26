import { NextResponse } from "next/server";
import { featureApiGuard } from "@/lib/feature-api-guard";
import { getApiUser } from "@/lib/api-auth";
import { NO_STORE_HEADERS } from "@/lib/api-cache-headers";

export const dynamic = "force-dynamic";

export async function GET() {
  const guard = featureApiGuard("extraction-workflow");
  if (guard) return guard;

  const { supabase, user } = await getApiUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: NO_STORE_HEADERS });
  }

  const { data } = await supabase
    .from("extraction_sessions")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  return NextResponse.json({ session: data ?? null }, { headers: NO_STORE_HEADERS });
}

export async function PUT(request: Request) {
  const guard = featureApiGuard("extraction-workflow");
  if (guard) return guard;

  const { supabase, user } = await getApiUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: NO_STORE_HEADERS });
  }

  const body = await request.json();

  const payload = {
    user_id: user.id,
    step: typeof body.step === "number" ? body.step : 0,
    connected: Boolean(body.connected),
    scanned: Boolean(body.scanned),
    extracted: Boolean(body.extracted),
    balance: typeof body.balance === "number" ? body.balance : 0,
    commissions_found:
      typeof body.commissionsFound === "number"
        ? body.commissionsFound
        : typeof body.commissions_found === "number"
          ? body.commissions_found
          : 0,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("extraction_sessions")
    .upsert(payload, { onConflict: "user_id" })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: NO_STORE_HEADERS });
  }

  return NextResponse.json({ session: data }, { headers: NO_STORE_HEADERS });
}

export async function DELETE() {
  const guard = featureApiGuard("extraction-workflow");
  if (guard) return guard;

  const { supabase, user } = await getApiUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: NO_STORE_HEADERS });
  }

  await supabase.from("extraction_sessions").delete().eq("user_id", user.id);

  return NextResponse.json({ ok: true }, { headers: NO_STORE_HEADERS });
}
