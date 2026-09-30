import { notFound } from "next/navigation";
import { LogoSlot } from "@/components/brand/LogoSlot";
import { WormSlot } from "@/components/brand/WormSlot";
import { Button } from "@/components/ui/Button";
import { Cover } from "@/components/ui/Cover";
import { ProgressLine } from "@/components/ui/ProgressLine";
import { TextField } from "@/components/ui/TextField";

export const metadata = { title: "Foundations · Reezy (dev)", robots: { index: false } };

const COLORS = [
  ["paper", "#FAF7F2"], ["surface", "#FFFFFF"], ["ink", "#1C1A1F"], ["ink-muted", "#6B6470"], ["rule", "#E8E2DA"],
  ["plum", "#660045"], ["pink", "#FCB5ED"], ["lime", "#F4FD1D"], ["danger", "#A8201A"],
] as const;

const TYPE = [
  ["text-display-xl", "Brand/Display XL · Rammetto One 48/52", "You finished it."],
  ["text-display-l", "Brand/Display L · Rammetto One 32/36", "72 pages later."],
  ["text-page-number", "Today page number · Rammetto One 40/48", "p. 156"],
  ["text-heading", "UI/Heading · Instrument Sans 600 28/34", "Piranesi"],
  ["text-title", "UI/Title · Instrument Sans 600 22/28", "What's on your mind?"],
  ["text-numeral", "UI/Numeral · Instrument Sans 600 48/52", "p. 84"],
  ["text-body", "UI/Body · Instrument Sans 400 17/24", "Capture something you want to remember from this point in the book."],
  ["text-body-strong", "UI/Body Strong · Instrument Sans 600 17/24", "The Remains of the Day"],
  ["text-label", "UI/Label · Instrument Sans 500 13/18", "p. 84 · 12 Sep · Shared"],
  ["text-thought", "Reader/Thought · Newsreader 19/29", "I'm starting to think she's the only person who understands what's happening."],
  ["text-quote", "Reader/Quote · Newsreader italic 24/32", "“I don't trust this character.”"],
] as const;

/** Dev-only check of tokens and primitives against Figma "01 — Foundations". Not a product screen. */
export default function Foundations() {
  if (process.env.VERCEL_ENV === "production") notFound();
  return (
    <main className="mx-auto max-w-5xl space-y-16 px-6 py-12">
      <header className="space-y-2">
        <p className="text-label text-plum">DEV · compare with Figma → 01 — Foundations</p>
        <h1 className="text-heading">Foundations</h1>
      </header>

      <section className="space-y-4">
        <h2 className="text-title">Colors</h2>
        <div className="flex flex-wrap gap-4">
          {COLORS.map(([name, hex]) => (
            <div key={name} className="space-y-2">
              <div className="h-20 w-32 rounded-block border border-rule" style={{ background: hex }} />
              <p className="text-body-strong">{name}</p>
              <p className="text-label text-ink-muted">{hex}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-title">Type</h2>
        {TYPE.map(([cls, spec, sample]) => (
          <div key={cls} className="space-y-1">
            <p className="text-label text-ink-muted">{spec}</p>
            <p className={`${cls} ${cls.startsWith("text-display") || cls === "text-page-number" ? "text-plum" : ""}`}>{sample}</p>
          </div>
        ))}
      </section>

      <section className="space-y-4">
        <h2 className="text-title">Primitives</h2>
        <div className="flex flex-wrap items-center gap-4">
          <Button>Log progress</Button>
          <Button variant="secondary">Want to read</Button>
          <Button variant="quiet">Not now</Button>
          <Button variant="danger">Delete</Button>
          <Button size="sm" disabled>Save</Button>
        </div>
        <div className="max-w-sm space-y-4">
          <TextField label="Search by title or author" placeholder="Search by title or author" />
          <div className="space-y-2">
            <p><span className="text-numeral">p. 84</span> <span className="text-body text-ink-muted">of 272</span></p>
            <ProgressLine pct={(84 / 272) * 100} marks={[4.4, 14.7]} label="Page 84 of 272" />
          </div>
        </div>
        <div className="flex items-end gap-6">
          <Cover title="Piranesi" author="Susanna Clarke" coverId={10226290} width={112} />
          <Cover title="The Ladies of Grace Adieu" author="Susanna Clarke" width={112} />
          <Cover title="Intermezzo" author="Sally Rooney" width={48} />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-title">Brand slots (placeholders until final assets)</h2>
        <div className="flex flex-wrap items-end gap-6">
          <LogoSlot height={28} />
          <span className="inline-flex rounded-block bg-plum p-6"><LogoSlot height={28} on="plum" /></span>
          <WormSlot appearance="reflection" width={64} height={44} />
          <WormSlot appearance="journey-end" width={48} height={32} />
        </div>
      </section>
    </main>
  );
}
