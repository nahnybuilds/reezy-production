// TEMPORARY Phase 1 diagnostic for the Preview "Couldn't send the code" failure. Remove once resolved.
// Never prints the publishable key or any secret; the URL is reduced to its hostname.

/** Show raw auth errors on screen only in local development and Vercel Preview, never Production. */
export const SHOW_AUTH_DIAGNOSTICS =
  process.env.NODE_ENV === "development" || process.env.NEXT_PUBLIC_VERCEL_ENV === "preview";

export function supabaseEnvSummary() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  let urlHost: string | null = null;
  let urlHasExtraPath = false;
  try {
    if (url) {
      const u = new URL(url.trim());
      urlHost = u.hostname;
      urlHasExtraPath = u.pathname !== "/" && u.pathname !== "";
    }
  } catch {
    urlHost = "(not a valid URL)";
  }
  return {
    urlPresent: Boolean(url),
    urlHost,
    urlHasExtraPath,
    urlHasWhitespace: url ? url !== url.trim() : false,
    keyPresent: Boolean(key),
    keyKind: !key ? null : key.startsWith("sb_publishable_") ? "publishable" : key.startsWith("sb_secret_") ? "SECRET (wrong key!)" : key.startsWith("eyJ") ? "legacy JWT" : "unrecognised",
    keyHasWhitespace: key ? key !== key.trim() : false,
    vercelEnv: process.env.NEXT_PUBLIC_VERCEL_ENV ?? null,
  };
}

type ErrLike = { name?: string; message?: string; status?: number; code?: string; cause?: unknown };

/** Logs the full error plus the env summary to the console; returns a one-line description for the UI. */
export function describeAuthError(step: string, err: unknown): string {
  const e = (err ?? {}) as ErrLike;
  const cause = e.cause instanceof Error ? `${e.cause.name}: ${e.cause.message}` : e.cause ? String(e.cause) : undefined;
  const env = supabaseEnvSummary();
  console.error(`[reezy auth diagnostic] ${step} failed`, { name: e.name, message: e.message, status: e.status, code: e.code, cause, env }, err);
  const parts = [e.name, e.status, e.code].filter((p) => p !== undefined && p !== "").join(" · ");
  return `${parts ? `${parts}: ` : ""}${e.message ?? String(err)}${cause ? ` (cause: ${cause})` : ""} — Supabase host: ${env.urlHost ?? "MISSING"}, key: ${env.keyPresent ? env.keyKind : "MISSING"}`;
}
