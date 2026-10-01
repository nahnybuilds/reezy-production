import { EmailSignIn } from "@/components/auth/EmailSignIn";

export const metadata = { title: "Continue with email · Reezy" };

/** Figma A3/A4 — email, then the 6-digit code. */
export default function EmailPage() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col px-6 pt-[54px] pb-10">
      <EmailSignIn />
    </main>
  );
}
