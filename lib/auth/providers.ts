import "server-only";
import { publicEnv } from "@/lib/env";

/**
 * Whether Google sign-in is switched on in Supabase Auth. Read from Supabase's public settings endpoint,
 * so the Google button appears automatically once the provider is configured (no code change needed).
 */
export async function isGoogleEnabled(): Promise<boolean> {
  try {
    const env = publicEnv();
    const res = await fetch(`${env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/settings`, {
      headers: { apikey: env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY },
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return false;
    const settings = (await res.json()) as { external?: { google?: boolean } };
    return settings.external?.google === true;
  } catch {
    return false; // hide rather than show a button that can't work
  }
}
