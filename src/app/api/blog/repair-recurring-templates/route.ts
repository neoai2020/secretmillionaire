import { NextResponse } from "next/server";
import { getServiceRoleClient } from "@/lib/api-auth";
import { repairTemplateProduct } from "@/features/blog-builder/lib/template-repair";
import { RECURRING_PRODUCTS } from "@/features/premium-recurring/data/products";

export const dynamic = "force-dynamic";
export const maxDuration = 800;

/**
 * Regenerate defective posts on shared Recurring Wealth template sites
 * (chess-title leak, AlgePrime pool drift, EchoXen tech drift, etc.).
 *
 * Auth: header `x-seed-secret` must match SEED_SECRET env.
 * Body: { productId?: number } — omit productId to repair all 10 products sequentially.
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
  const limit = typeof body.limit === "number" ? Math.min(body.limit, 5) : 2;

  const products =
    productId !== null
      ? RECURRING_PRODUCTS.filter((p) => p.id === productId)
      : RECURRING_PRODUCTS;

  if (products.length === 0) {
    return NextResponse.json({ error: "Unknown productId" }, { status: 404 });
  }

  const results: Array<{
    productId: number;
    name: string;
    repaired: number;
    failed: number;
    remaining: number;
  }> = [];

  try {
    for (const product of products) {
      const result = await repairTemplateProduct(
        admin,
        {
          id: product.id,
          name: product.name,
          niche: product.niche,
          productUrl: product.productUrl,
        },
        limit
      );
      results.push({
        productId: product.id,
        name: product.name,
        ...result,
      });
    }

    const totals = results.reduce(
      (acc, r) => ({
        repaired: acc.repaired + r.repaired,
        failed: acc.failed + r.failed,
        remaining: acc.remaining + r.remaining,
      }),
      { repaired: 0, failed: 0, remaining: 0 }
    );

    return NextResponse.json({ ok: true, ...totals, results });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Repair failed";
    return NextResponse.json({ error: msg, results }, { status: 500 });
  }
}
