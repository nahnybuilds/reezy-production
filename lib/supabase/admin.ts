import "server-only";
import { createClient } from "@supabase/supabase-js";
import { publicEnv, serverEnv } from "@/lib/env";

/**
 * Privileged client (secret key, bypasses RLS). Server-only, and only for the few jobs that need it:
 * caching Open Library works, and removing a deleted account's avatar file.
 * Never use it to read or write reader content on a reader's behalf.
 */
export function createAdminClient() {
  return createClient(publicEnv().NEXT_PUBLIC_SUPABASE_URL, serverEnv().SUPABASE_SECRET_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
