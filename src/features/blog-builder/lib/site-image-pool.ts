import { normalizeImageUrl, resolveFastImageUrl, type ResolvedImage } from "./images";

type ResolveParams = Parameters<typeof resolveFastImageUrl>[0];

/**
 * Tracks stock photos used across one site generation (7 deploy posts or 25 premium).
 * Serialized lookups prevent parallel workers from picking the same Pixabay hit.
 */
export class SiteImagePool {
  private usedUrls = new Set<string>();
  private usedStockIds = new Set<string>();
  private queue: Promise<void> = Promise.resolve();

  private track(image: Pick<ResolvedImage, "url" | "stockId">) {
    if (image.url) this.usedUrls.add(normalizeImageUrl(image.url));
    if (image.stockId) this.usedStockIds.add(image.stockId);
  }

  /** Pre-register prefetched heroes so inline picks skip them. */
  seed(images: Iterable<Pick<ResolvedImage, "url" | "stockId">>) {
    for (const image of images) this.track(image);
  }

  snapshot(): { excludeUrls: string[]; excludeStockIds: string[] } {
    return {
      excludeUrls: [...this.usedUrls],
      excludeStockIds: [...this.usedStockIds],
    };
  }

  /** Resolve a unique image and register it in the pool. */
  async resolveUnique(params: ResolveParams): Promise<ResolvedImage> {
    const work = this.queue.then(async () => {
      const snap = this.snapshot();
      const image = await resolveFastImageUrl({
        ...params,
        excludeUrls: [...(params.excludeUrls ?? []), ...snap.excludeUrls],
        excludeStockIds: [...(params.excludeStockIds ?? []), ...snap.excludeStockIds],
      });
      this.track(image);
      return image;
    });
    this.queue = work.then(
      () => undefined,
      () => undefined
    );
    return work;
  }
}
