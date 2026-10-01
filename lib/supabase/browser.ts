"use client";

import { createBrowserClient } from "@supabase/ssr";
import { publicEnv } from "@/lib/env";
import type { Database } from "./database.types";

/** Supabase client for Client Components. Uses the publishable key; RLS does the protecting. */
export function createClient() {
  const env = publicEnv();
  return createBrowserClient<Database>(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
}
