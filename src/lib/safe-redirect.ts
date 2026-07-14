/**
 * Only allow same-origin relative paths for post-auth redirects.
 * Blocks open redirects via absolute URLs or protocol-relative //evil.com.
 */
export function safeInternalPath(raw: string | null | undefined, fallback: string): string {
  if (!raw) return fallback;
  const path = raw.trim();
  if (!path.startsWith("/") || path.startsWith("//")) return fallback;
  if (path.includes("\\") || path.includes("\0")) return fallback;
  // Block embedding credentials / host tricks like /@evil or /\evil
  if (path.startsWith("/\\") || path.includes("://")) return fallback;
  return path;
}
