import { NextResponse } from "next/server";
import { featureApiGuard } from "@/lib/feature-api-guard";
import { getApiUser, getServiceRoleClient } from "@/lib/api-auth";
import { getWebsiteForUser } from "@/features/blog-builder/lib/recurring-templates";
import { isValidAffiliateUrl, normalizeAffiliateUrl } from "@/features/blog-builder/lib/affiliate-url";
import { RECURRING_PRODUCTS } from "@/features/premium-recurring/data/products";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/**
 * Recurring Wealth "Get Website": clone the product's pre-seeded template into
 * the member's vault with their own affiliate link (or generate it on the fly
 * if not yet seeded).
 */
export async function POST(request: Request) {
  const guard = featureApiGuard("premium-recurring");
  if (guard) return guard;

  const { user } = await getApiUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = getServiceRoleClient();
  if (!admin) {
    return NextResponse.json({ error: "Site generation is not configured (missing service role)." }, { status: 500 });
  }

  const body = await request.json().catch(() => ({}));
  const productId = typeof body.productId === "number" ? body.productId : null;
  const affiliateUrl = normalizeAffiliateUrl(typeof body.affiliateUrl === "string" ? body.affiliateUrl : "");

  if (productId === null) {
    return NextResponse.json({ error: "productId is required" }, { status: 400 });
  }
  if (!isValidAffiliateUrl(affiliateUrl)) {
    return NextResponse.json({ error: "A valid affiliate link (https://) is required" }, { status: 400 });
  }

  const product = RECURRING_PRODUCTS.find((p) => p.id === productId);
  if (!product) return NextResponse.json({ error: "Unknown product" }, { status: 404 });

  try {
    const { site, mode } = await getWebsiteForUser({
      admin,
      userId: user.id,
      product: { id: product.id, name: product.name, niche: product.niche, productUrl: product.productUrl },
      affiliateUrl,
    });
    return NextResponse.json({ site, mode });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to build website";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
