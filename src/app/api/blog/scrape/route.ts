import { NextResponse } from "next/server";
import { featureApiGuard } from "@/lib/feature-api-guard";
import { getApiUser } from "@/lib/api-auth";
import { scrapePage } from "@/features/blog-builder/lib/scrape";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const guard = featureApiGuard("blog-builder");
  if (guard) return guard;

  const { user } = await getApiUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const url = typeof body.url === "string" ? body.url.trim() : "";
  if (!url) return NextResponse.json({ error: "url is required" }, { status: 400 });

  const data = await scrapePage(url);
  return NextResponse.json({ data });
}
