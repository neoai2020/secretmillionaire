import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { createClient, type User } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import {
  DEV_BYPASS_EMAIL,
  DEV_BYPASS_PASSWORD,
  isDevAuthBypassEnabled,
} from "@/lib/dev-bypass";

let cachedDevUserId: string | null = null;

function createServiceRoleClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) return null;

  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Service-role client (bypasses RLS) for trusted server-side work like seeding
 * shared template sites and cloning them across users. Returns null if the
 * service role key is not configured.
 */
export function getServiceRoleClient() {
  return createServiceRoleClient();
}

function buildDevUser(id: string): User {
  return {
    id,
    app_metadata: {},
    user_metadata: {},
    aud: "authenticated",
    created_at: new Date().toISOString(),
    email: DEV_BYPASS_EMAIL,
    role: "authenticated",
    updated_at: new Date().toISOString(),
  } as User;
}

async function ensureDevBypassUser(admin: ReturnType<typeof createServiceRoleClient>) {
  if (!admin) return null;
  if (cachedDevUserId) return cachedDevUserId;

  const configuredId = process.env.DEV_BYPASS_USER_ID?.trim();
  if (configuredId) {
    cachedDevUserId = configuredId;
    return configuredId;
  }

  const { data: existing } = await admin.auth.admin.listUsers({ perPage: 200 });
  const match = existing.users.find((u) => u.email === DEV_BYPASS_EMAIL);
  if (match) {
    cachedDevUserId = match.id;
    return match.id;
  }

  const { data, error } = await admin.auth.admin.createUser({
    email: DEV_BYPASS_EMAIL,
    password: DEV_BYPASS_PASSWORD,
    email_confirm: true,
  });

  if (error) {
    throw new Error(`Dev bypass user setup failed: ${error.message}`);
  }

  cachedDevUserId = data.user.id;
  return data.user.id;
}

export async function createApiSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: "", ...options });
        },
      },
    }
  );
}

export async function getApiUser() {
  if (isDevAuthBypassEnabled()) {
    const admin = createServiceRoleClient();
    if (admin) {
      const userId = await ensureDevBypassUser(admin);
      if (userId) {
        return { supabase: admin, user: buildDevUser(userId) };
      }
    }

    const fallbackId =
      process.env.DEV_BYPASS_USER_ID?.trim() ??
      "00000000-0000-4000-a800-000000000001";
    return {
      supabase: await createApiSupabaseClient(),
      user: buildDevUser(fallbackId),
    };
  }

  const supabase = await createApiSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}
