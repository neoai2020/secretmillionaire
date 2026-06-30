import type { SupabaseClient } from "@supabase/supabase-js";

export interface SavedFacebookPost {
  id: string;
  site_id: string;
  body: string;
  batch_id: string;
  created_at: string;
}

export async function listFacebookPostsForSite(
  supabase: SupabaseClient,
  userId: string,
  siteId: string
): Promise<SavedFacebookPost[]> {
  const { data, error } = await supabase
    .from("site_facebook_posts")
    .select("id, site_id, body, batch_id, created_at")
    .eq("user_id", userId)
    .eq("site_id", siteId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as SavedFacebookPost[];
}

export async function saveFacebookPostBatch(
  supabase: SupabaseClient,
  userId: string,
  siteId: string,
  bodies: string[]
): Promise<SavedFacebookPost[]> {
  const batchId = crypto.randomUUID();
  const rows = bodies.map((body) => ({
    user_id: userId,
    site_id: siteId,
    body: body.trim(),
    batch_id: batchId,
  }));

  const { data, error } = await supabase
    .from("site_facebook_posts")
    .insert(rows)
    .select("id, site_id, body, batch_id, created_at");

  if (error) throw new Error(error.message);
  return (data ?? []) as SavedFacebookPost[];
}

export async function countFacebookPostsBySite(
  supabase: SupabaseClient,
  userId: string,
  siteIds: string[]
): Promise<Record<string, number>> {
  if (siteIds.length === 0) return {};

  const { data, error } = await supabase
    .from("site_facebook_posts")
    .select("site_id")
    .eq("user_id", userId)
    .in("site_id", siteIds);

  if (error) throw new Error(error.message);

  const counts: Record<string, number> = {};
  for (const row of data ?? []) {
    const siteId = (row as { site_id: string }).site_id;
    counts[siteId] = (counts[siteId] ?? 0) + 1;
  }
  return counts;
}
