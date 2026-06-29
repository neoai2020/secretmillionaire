import { NextResponse } from "next/server";
import { getServiceRoleClient } from "@/lib/api-auth";
import { seedProductTemplate } from "@/features/blog-builder/lib/recurring-templates";
import { RECURRING_PRODUCTS } from "@/features/premium-recurring/data/products";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/**
 * One-time (and idempotent) seeding of the shared DFY template sites that power
 * the Recurring Wealth "Get Website" flow. Heavy job — call once per product.
 *
 * Auth: header `x-seed-secret` must match SEED_SECRET env.
 * Body: { productId } (seed one product). Requires TEMPLATE_OWNER_ID env.
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
  const productId = typeof body.productId === "number" ? body.productId : null;
  if (productId === null) {
    return NextResponse.json(
      { error: "productId (number) is required. Seed one product per request." },
      { status: 400 }
    );
  }

  const product = RECURRING_PRODUCTS.find((p) => p.id === productId);
  if (!product) {
    return NextResponse.json({ error: "Unknown productId" }, { status: 404 });
  }

  try {
    const result = await seedProductTemplate(admin, {
      id: product.id,
      name: product.name,
      niche: product.niche,
      productUrl: product.productUrl,
    });
    return NextResponse.json({ ok: true, productId, ...result });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Seed failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
