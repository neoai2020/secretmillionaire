/** Prevent browsers/CDNs from caching per-user API responses. */
export const NO_STORE_HEADERS = {
  "Cache-Control": "private, no-store, no-cache, must-revalidate",
  Pragma: "no-cache",
} as const;
