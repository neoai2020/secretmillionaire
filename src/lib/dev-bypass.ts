/**
 * Local preview only — set DEV_BYPASS_AUTH=true in .env.local.
 * Never ships a default password; create-user path requires DEV_BYPASS_PASSWORD.
 */
export function isDevAuthBypassEnabled(): boolean {
  return (
    process.env.NODE_ENV !== "production" &&
    process.env.DEV_BYPASS_AUTH === "true"
  );
}

export const DEV_BYPASS_EMAIL =
  process.env.DEV_BYPASS_EMAIL ?? "dev-local@sms.local";

export const DEV_BYPASS_PASSWORD = process.env.DEV_BYPASS_PASSWORD ?? "";
