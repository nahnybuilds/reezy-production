import Link from "next/link";
import { LogoSlot } from "@/components/brand/LogoSlot";

// Phase 0 holding page. Today (the real home) is built in Phase 1–2 from the frozen Figma frames.
export default function Home() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-reading flex-col gap-6 px-6 py-16">
      <LogoSlot height={28} />
      <h1 className="text-heading">Reezy V1 is being built.</h1>
      <p className="text-body text-ink-muted">Phase 0: foundations. The product screens arrive from Phase 1.</p>
      {process.env.VERCEL_ENV !== "production" && (
        <Link href="/dev/foundations" className="text-label text-plum underline underline-offset-4">
          View foundations (tokens, type, primitives, slots)
        </Link>
      )}
    </main>
  );
}
