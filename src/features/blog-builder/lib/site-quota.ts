import type { SupabaseClient } from "@supabase/supabase-js";
import { isFeatureEnabled } from "@/config/features.config";

export const DAILY_SITE_GENERATION_LIMIT = 5;

/** The Accelerator "Society Upgrade" grants unlimited Empire Builder generations. */
export function hasUnlimitedGenerations(): boolean {
  return isFeatureEnabled("premium-accelerator");
}

export function startOfUtcDay(date = new Date()): string {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString();
}

export async function countSitesCreatedToday(
  supabase: SupabaseClient,
  userId: string
): Promise<number> {
  const { count, error } = await supabase
    .from("sites")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", startOfUtcDay());

  if (error) throw new Error(error.message);
  return count ?? 0;
}

export async function getDailyGenerationQuota(
  supabase: SupabaseClient,
  userId: string
): Promise<{ limit: number | null; usedToday: number; remaining: number | null; unlimited: boolean }> {
  const usedToday = await countSitesCreatedToday(supabase, userId);

  if (hasUnlimitedGenerations()) {
    return { limit: null, usedToday, remaining: null, unlimited: true };
  }

  const remaining = Math.max(0, DAILY_SITE_GENERATION_LIMIT - usedToday);
  return { limit: DAILY_SITE_GENERATION_LIMIT, usedToday, remaining, unlimited: false };
}
