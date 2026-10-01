"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { BackLink } from "@/components/ui/BackLink";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { createClient } from "@/lib/supabase/browser";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function friendly(message: string | undefined, step: "send" | "verify"): string {
  const m = (message ?? "").toLowerCase();
  if (m.includes("rate") || m.includes("too many") || m.includes("security purposes")) return "Too many tries. Wait a minute and try again.";
  if (step === "verify") return "That code didn't work. Check it, or send a new one.";
  return "Couldn't send the code. Check the address and try again.";
}

/**
 * Figma A3 → A4: "Continue with email" → "Check your email" with a 6-digit code (D39, no passwords).
 * Supabase sends the code using the Reezy template; verifying it signs the reader in.
 */
export function EmailSignIn({ preview }: { preview?: "email" | "code" }) {
  const [step, setStep] = useState<"email" | "code">(preview ?? "email");
  const [email, setEmail] = useState(preview === "code" ? "maya.chen@gmail.com" : "");
  const [code, setCode] = useState(preview === "code" ? "482" : "");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const codeRef = useRef<HTMLInputElement>(null);
  const codeId = useId();
  const router = useRouter();

  async function send(e?: React.FormEvent) {
    e?.preventDefault();
    setError(null);
    setNotice(null);
    const address = email.trim();
    if (!EMAIL.test(address)) return setError("Enter a valid email address.");
    if (preview) return setStep("code");
    setPending(true);
    const { error: err } = await createClient().auth.signInWithOtp({ email: address, options: { shouldCreateUser: true } });
    setPending(false);
    if (err) return setError(friendly(err.message, "send"));
    if (step === "code") setNotice("We sent a new code.");
    setCode("");
    setStep("code");
  }

  async function verify(token: string) {
    if (preview) return;
    setError(null);
    setPending(true);
    const { error: err } = await createClient().auth.verifyOtp({ email: email.trim(), token, type: "email" });
    if (err) {
      setPending(false);
      setCode("");
      return setError(friendly(err.message, "verify"));
    }
    router.replace("/");
    router.refresh(); // server components pick up the new session cookie
  }

  useEffect(() => {
    if (step === "code") codeRef.current?.focus();
  }, [step]);

  if (step === "email") {
    return (
      <form onSubmit={send} noValidate className="flex flex-col gap-5">
        <BackLink href="/welcome" />
        <h1 className="text-heading">Continue with email</h1>
        <p className="text-body text-ink-muted">We&rsquo;ll send you a 6-digit code. No password needed.</p>
        <TextField
          label="Email address"
          type="email"
          inputMode="email"
          autoComplete="email"
          autoFocus
          enterKeyHint="send"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {error && <p role="alert" className="text-label text-danger">{error}</p>}
        <Button type="submit" block disabled={pending}>{pending ? "Sending…" : "Send code"}</Button>
      </form>
    );
  }

  const digits = code.padEnd(6, " ").slice(0, 6).split("");
  return (
    <div className="flex flex-col gap-5">
      <BackLink onClick={() => { setStep("email"); setError(null); setNotice(null); }} />
      <h1 className="text-heading">Check your email</h1>
      <p className="text-body text-ink-muted">Enter the code we sent to {email.trim()}.</p>

      <label htmlFor={codeId} className="group relative block w-full max-w-[339px]">
        <span className="sr-only">6-digit code</span>
        <input
          ref={codeRef}
          id={codeId}
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          value={code}
          disabled={pending}
          onChange={(e) => {
            const next = e.target.value.replace(/\D/g, "").slice(0, 6);
            setCode(next);
            if (next.length === 6) verify(next);
          }}
          className="absolute inset-0 z-10 h-full w-full cursor-text opacity-0"
        />
        <span aria-hidden className="grid grid-cols-6 gap-[9px]">
          {digits.map((d, i) => {
            const active = i === Math.min(code.length, 5) && code.length < 6;
            return (
              <span
                key={i}
                className={`flex h-[60px] items-center justify-center rounded-[12px] bg-surface text-[28px] font-semibold text-ink ${
                  active ? "border-2 border-rule group-focus-within:border-plum" : "border border-rule"
                }`}
              >
                {d.trim() || (active ? <span className="h-7 w-0.5 bg-plum" /> : null)}
              </span>
            );
          })}
        </span>
      </label>

      {error && <p role="alert" className="text-label text-danger">{error}</p>}
      {notice && !error && <p role="status" className="text-label text-ink-muted">{notice}</p>}
      {pending && <p role="status" className="text-label text-ink-muted">Checking…</p>}

      <div className="flex gap-2">
        <Button variant="quiet" size="sm" onClick={() => send()} disabled={pending}>Resend code</Button>
        <Button variant="quiet" size="sm" onClick={() => { setStep("email"); setCode(""); setError(null); }} disabled={pending}>Use a different email</Button>
      </div>
    </div>
  );
}
