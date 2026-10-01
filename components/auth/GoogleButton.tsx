"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/browser";

/** Figma A1 "Continue with Google" — surface pill, plum label. Returns via /auth/callback. */
export function GoogleButton() {
  const [pending, setPending] = useState(false);
  async function signIn() {
    setPending(true);
    const { error } = await createClient().auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) setPending(false);
  }
  return (
    <button
      type="button"
      onClick={signIn}
      disabled={pending}
      className="flex h-13 w-full items-center justify-center gap-2.5 rounded-full bg-surface text-body-strong text-plum disabled:opacity-70"
    >
      <span aria-hidden className="inline-flex size-[22px] items-center justify-center rounded-full border border-rule text-[13px] font-bold text-ink">G</span>
      Continue with Google
    </button>
  );
}
