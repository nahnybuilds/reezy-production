import { z } from "zod";

/**
 * Environment variables, validated once (pattern reused from reezy-kunal/backend/src/config/env.ts).
 * Public values are inlined into the browser bundle; server values must never be imported by client code.
 * Supabase issues "publishable" and "secret" keys for new projects (legacy anon / service_role keys also work).
 */
const publicSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(20),
  NEXT_PUBLIC_SITE_URL: z.string().url().default("http://localhost:3000"),
});

const serverSchema = z.object({
  SUPABASE_SECRET_KEY: z.string().min(20),
  OPEN_LIBRARY_CONTACT: z.string().min(3).default("Reezy (https://reezy.me)"),
});

export function publicEnv() {
  return publicSchema.parse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  });
}

export function serverEnv() {
  return serverSchema.parse({
    SUPABASE_SECRET_KEY: process.env.SUPABASE_SECRET_KEY,
    OPEN_LIBRARY_CONTACT: process.env.OPEN_LIBRARY_CONTACT,
  });
}

/** Contact sent to Open Library in the User-Agent. Non-secret; doesn't require the secret key. */
export function openLibraryContact() {
  const v = process.env.OPEN_LIBRARY_CONTACT?.trim();
  return v && v.length >= 3 ? v : "Reezy (https://reezy.me)";
}

/** True when Supabase env vars are present (lets Phase 0 pages render before a project is linked). */
export function hasSupabaseEnv() {
  return publicSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  }).success;
}
