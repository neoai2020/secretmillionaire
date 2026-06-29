import type { ArmedLink } from "@/features/blog-builder/types";

/**
 * Append an affiliate link to the user's Link Vault (dedup by URL). Used by the
 * premium Society Access tools so a "synced" offer becomes a real armed link the
 * money-site builder can weave in. Best-effort — returns whether it persisted.
 */
export async function saveToLinkVault(label: string, url: string): Promise<boolean> {
  const cleanUrl = url.trim();
  if (!cleanUrl) return false;

  try {
    const res = await fetch("/api/blog/link-vault", { cache: "no-store" });
    const data = res.ok ? await res.json() : { links: [] };
    const existing: ArmedLink[] = Array.isArray(data.links) ? data.links : [];

    if (existing.some((l) => l.url.trim() === cleanUrl)) return true;

    const next: ArmedLink[] = [
      ...existing,
      { label: label.slice(0, 80) || "Society Offer", url: cleanUrl, network: "digistore" },
    ];

    const put = await fetch("/api/blog/link-vault", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({ links: next }),
    });

    return put.ok;
  } catch {
    return false;
  }
}
