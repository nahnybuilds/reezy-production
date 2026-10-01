import { LogoSlot } from "@/components/brand/LogoSlot";
import { WormSlot } from "@/components/brand/WormSlot";
import { Cover } from "@/components/ui/Cover";
import { ProgressLine } from "@/components/ui/ProgressLine";
import { formatPosition, type Unit } from "@/lib/reading/position";
import { TodayDate } from "./TodayDate";

export type TodayBook = {
  title: string;
  authors: string[];
  coverId: number | null;
  unit: Unit;
  page: number | null;
  pct: number;
  copyPageCount: number | null;
};

export function Masthead() {
  return (
    <div className="flex items-center justify-between">
      <LogoSlot height={24} />
      <TodayDate />
    </div>
  );
}

/** Cover, title and italic byline — shared by both Today states (Figma A7/B1). */
export function BookHero({ title, authors, coverId, coverWidth = 136, worm }: { title: string; authors: string[]; coverId: number | null; coverWidth?: number; worm?: boolean }) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative">
        {worm && (
          // Worm #2 peeks over the cover's top edge, first run only (DESIGN §8). Behind the cover.
          <WormSlot appearance="first-run-today" width={72} height={48} className="absolute -top-[34px] left-[78px] z-0" />
        )}
        <Cover title={title} author={authors[0]} coverId={coverId} width={coverWidth} className="relative z-10" />
      </div>
      <h1 className="mt-[18px] text-heading">{title}</h1>
      {authors[0] && <p className="font-reader text-[17px] leading-6 italic text-ink-muted">by {authors[0]}</p>}
    </div>
  );
}

/**
 * Today for a Reading book (Figma A7 first run / B1). Phase 1 shows the book and where you are.
 * Log progress and Leave a Thought arrive with the check-in in Phase 2 (no dead buttons).
 */
export function TodayView({ book, firstRun }: { book: TodayBook; firstRun: boolean }) {
  const pos = formatPosition({ unit: book.unit, page: book.page, pct: book.pct, copyPageCount: book.copyPageCount });
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col px-6 pt-14 pb-10">
      <Masthead />
      <div className="mt-6">
        <BookHero title={book.title} authors={book.authors} coverId={book.coverId} worm={firstRun} />
      </div>
      <div className="mt-6 flex flex-col gap-2">
        <p className="flex items-baseline gap-2">
          <span className="text-page-number text-plum">{pos.primary}</span>
          {pos.secondary && <span className="text-body text-ink-muted">{pos.secondary}</span>}
        </p>
        <ProgressLine pct={book.pct} label={pos.label} />
      </div>
      {firstRun && (
        <div className="mt-8 rounded-block border border-rule bg-surface p-4">
          <p className="text-body">When you&rsquo;re reading, check in here. Reezy will keep your place and your thoughts.</p>
        </div>
      )}
    </main>
  );
}
