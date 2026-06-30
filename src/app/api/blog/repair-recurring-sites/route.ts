import { NextResponse } from "next/server";
import { getServiceRoleClient } from "@/lib/api-auth";
import {
  listRecurringWealthSites,
  repairAllRecurringWealthSites,
  repairRecurringSite,
} from "@/features/blog-builder/lib/recurring-site-repair";
import type { BlogSite } from "@/features/blog-builder/types";

export const dynamic = "force-dynamic";
export const maxDuration = 800;

/**
 * Repair Recurring Wealth cloned sites: fresh contextual Pixabay images,
 * dedupe hero/inline photos, strip in-article disclosure, upgrade to premium theme.
 *
 * Auth: header `x-seed-secret` must match SEED_SECRET env.
 * Body: { siteSlug?, includeTemplates?, siteLimit?, postLimit? }
 */
export async function POST(request: Request) {
  const secret = process.env.SEED_SECRET;
  if (!secret || request.headers.get("x-seed-secret") !== secret) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const admin = getServiceRoleClient();
  if (!admin) {
    return NextResponse.json({ error: "SUPABASE_SERVICE_ROLE_KEY is not configured" }, { status: 500 });
  }

  const body = await request.json().catch(() => ({}));
  const siteSlug = typeof body.siteSlug === "string" ? body.siteSlug.trim() : "";
  const includeTemplates = body.includeTemplates === true;
  const siteLimit = typeof body.siteLimit === "number" ? Math.min(body.siteLimit, 20) : undefined;
  const postLimit = typeof body.postLimit === "number" ? Math.min(body.postLimit, 30) : undefined;

  try {
    if (siteSlug) {
      const { data: siteRow } = await admin
        .from("sites")
        .select("*")
        .eq("slug", siteSlug)
        .maybeSingle();

      const site = siteRow as BlogSite | null;
      if (!site?.template_key?.startsWith("recurring-")) {
        return NextResponse.json({ error: "Not a Recurring Wealth site" }, { status: 404 });
      }

      const result = await repairRecurringSite({
        admin,
        site,
        postLimit,
        concurrency: 2,
      });

      return NextResponse.json({ ok: true, ...result });
    }

    const summary = await repairAllRecurringWealthSites({
      admin,
      includeTemplates,
      siteLimit,
      postLimit,
    });

    const sites = await listRecurringWealthSites(admin);

    return NextResponse.json({
      ok: true,
      ...summary,
      siteCount: sites.length,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Repair failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
