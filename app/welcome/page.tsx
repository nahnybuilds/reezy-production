import Link from "next/link";
import { WormSlot } from "@/components/brand/WormSlot";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { isGoogleEnabled } from "@/lib/auth/providers";

export const metadata = { title: "Welcome · Reezy" };

/**
 * Figma A1 — Welcome. Plum full-bleed (DESIGN §9.4), worm #1 bleeding off the right edge, the brand
 * headline in Rammetto, and sign-in. Google appears only once the provider is enabled in Supabase.
 */
export default async function Welcome({ searchParams }: PageProps<"/welcome">) {
  const google = await isGoogleEnabled();
  const failed = (await searchParams).error === "sign_in_failed";
  return (
    <div className="min-h-dvh bg-plum">
      <main className="relative mx-auto flex min-h-dvh w-full max-w-[430px] flex-col overflow-hidden px-6 pb-8">
        <WormSlot appearance="welcome" width={260} height={260} className="absolute top-16 left-[170px] !rounded-block !border-lime !bg-transparent !text-lime" />
        <div className="flex flex-col gap-8 pt-[min(340px,42dvh)]">
          <h1 className="text-display-l text-lime">Keep track of what you think while you read.</h1>
          <p className="max-w-[330px] text-body text-paper">Log where you are, jot what&rsquo;s on your mind, and Reezy brings it back as you keep reading.</p>
        </div>
        <div className="mt-auto flex flex-col gap-3 pt-10">
          {failed && <p role="alert" className="text-label text-pink">That sign-in didn&rsquo;t work. Please try again.</p>}
          {google && <GoogleButton />}
          <Link
            href="/welcome/email"
            className="flex h-13 w-full items-center justify-center rounded-full border-[1.5px] border-paper text-body-strong text-paper"
          >
            Continue with email
          </Link>
          <p className="text-label text-pink">
            By continuing you agree to the{" "}
            <Link href="/terms" className="underline underline-offset-2">Terms</Link> and{" "}
            <Link href="/privacy" className="underline underline-offset-2">Privacy Policy</Link>.
          </p>
        </div>
      </main>
    </div>
  );
}
