import { createBrowserClient } from "@supabase/ssr";

const PLACEHOLDER_URL = "https://build-placeholder.supabase.co";
const PLACEHOLDER_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDU5NjgwMDAsImV4cCI6MTk2MTU0NDAwMH0.placeholder";

const configuredUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
const configuredKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";

if (!configuredUrl || !configuredKey) {
  if (typeof window === "undefined" && process.env.NEXT_PHASE !== "phase-production-build") {
    console.error("CRITICAL: Missing Supabase environment variables on server side");
  }
}

// Placeholders let `next build` finish when env vars are not injected at build time.
export const supabase = createBrowserClient(
  configuredUrl || PLACEHOLDER_URL,
  configuredKey || PLACEHOLDER_KEY
);

export function getSupabaseClient() {
  if (!configuredUrl || !configuredKey) {
    throw new Error(
      "Missing Supabase environment variables. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }
  return supabase;
}
