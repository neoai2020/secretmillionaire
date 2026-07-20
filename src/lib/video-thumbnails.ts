export const VIDEO_THUMBNAILS: Record<string, string> = {
  "1209908982": "/thumbnails/thumb-01-welcome.webp",
  "1209909366": "/thumbnails/thumb-02-build-website.webp",
  "1209920923": "/thumbnails/thumb-03-premium-features.webp",
  "1171721099": "/thumbnails/thumb-04-instant-income.webp",
  "1171734563": "/thumbnails/thumb-05-autopilot.webp",
  "1171728175": "/thumbnails/thumb-06-dfy-vault.webp",
};

export function getVideoThumbnail(videoUrlOrId: string): string | null {
  const id = videoUrlOrId.includes("vimeo")
    ? videoUrlOrId.split("/").filter(Boolean).pop() ?? ""
    : videoUrlOrId;
  return VIDEO_THUMBNAILS[id] ?? null;
}
