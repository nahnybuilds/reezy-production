"use client";

import { useRouter } from "next/navigation";
import { useId, useState, useTransition } from "react";
import { startReading } from "@/app/actions/books";
import { Button } from "@/components/ui/Button";
import {
  justStarting,
  parsePercent,
  parseWholeNumber,
  PROGRESS_ERROR_COPY,
  validateProgress,
  type Unit,
} from "@/lib/reading/position";

export type WhereAreYouBook = {
  olWorkKey: string;
  title: string;
  /** The reader's copy page count if known (stored, or seeded from Open Library). */
  copyPageCount: number | null;
};

type Props = {
  book: WhereAreYouBook;
  /** Called after the book is saved as Reading; defaults to a hard refresh into Today. */
  onDone?: () => void;
  /** Dev preview only: render without calling the server. */
  preview?: boolean;
};

/**
 * Figma A6 "Where are you in {title}?" — one number, page/% toggle, the copy page-count card only when
 * the length is unknown (D24), Start reading, and the "I'm just starting" shortcut.
 */
export function WhereAreYou({ book, onDone, preview }: Props) {
  const [unit, setUnit] = useState<Unit>("page");
  const [value, setValue] = useState("");
  const [copyPages, setCopyPages] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const numId = useId();
  const pagesId = useId();
  const errId = useId();
  const router = useRouter();

  const askCopyPages = unit === "page" && book.copyPageCount === null;

  function submit(next: { unit: Unit; value: number; copyPageCount: number | null }) {
    setError(null);
    const invalid = validateProgress({ unit: next.unit, value: next.value, copyPageCount: next.unit === "page" ? next.copyPageCount ?? book.copyPageCount : null });
    if (invalid) return setError(PROGRESS_ERROR_COPY[invalid]);
    if (preview) return;
    startTransition(async () => {
      const res = await startReading({ olWorkKey: book.olWorkKey, unit: next.unit, value: next.value, copyPageCount: next.copyPageCount });
      if (!res.ok) return setError(res.message);
      if (onDone) onDone();
      else {
        router.replace("/");
        router.refresh(); // Today re-renders with the book now Reading
      }
    });
  }

  function onStart(e: React.FormEvent) {
    e.preventDefault();
    const v = unit === "page" ? parseWholeNumber(value) : parsePercent(value);
    if (v === null) return setError(PROGRESS_ERROR_COPY.enter_a_number);
    const pages = askCopyPages ? parseWholeNumber(copyPages) : null;
    if (askCopyPages && pages === null) return setError(PROGRESS_ERROR_COPY.copy_pages_needed);
    submit({ unit, value: v, copyPageCount: pages });
  }

  function onJustStarting() {
    const pages = askCopyPages ? parseWholeNumber(copyPages) : null;
    const start = justStarting(pages ?? book.copyPageCount);
    submit({ ...start, copyPageCount: pages });
  }

  return (
    <form onSubmit={onStart} noValidate className="flex flex-col gap-[18px]">
      <h1 className="text-title">Where are you in {book.title}?</h1>

      <div className="flex items-end justify-between">
        <label htmlFor={numId} className="flex items-baseline gap-1.5 border-b-2 border-rule pb-1.5 focus-within:border-plum">
          <span className="sr-only">{unit === "page" ? "Page you're on" : "Percent through the book"}</span>
          {unit === "page" && <span aria-hidden className="text-title text-ink-muted">p.</span>}
          <input
            id={numId}
            autoFocus
            inputMode={unit === "page" ? "numeric" : "decimal"}
            enterKeyHint="go"
            autoComplete="off"
            value={value}
            onChange={(e) => setValue(e.target.value.replace(unit === "page" ? /[^\d]/g : /[^\d.]/g, ""))}
            placeholder="0"
            aria-describedby={error ? errId : undefined}
            className="w-[3.2ch] min-w-[2ch] bg-transparent text-numeral text-ink caret-plum placeholder:text-rule focus:outline-none"
            style={{ width: `${Math.max(2, value.length) + 0.4}ch` }}
          />
          {unit === "percent" && <span aria-hidden className="text-title text-ink-muted">%</span>}
          {unit === "page" && book.copyPageCount !== null && <span className="text-body text-ink-muted">of {book.copyPageCount}</span>}
        </label>

        <div role="group" aria-label="Progress unit" className="flex rounded-full bg-rule p-[3px]">
          {(["page", "percent"] as const).map((u) => (
            <button
              key={u}
              type="button"
              aria-pressed={unit === u}
              onClick={() => { setUnit(u); setError(null); }}
              className={`min-h-8 rounded-full px-3.5 text-label ${unit === u ? "bg-surface text-ink" : "text-ink-muted"}`}
            >
              {u === "page" ? "page" : "%"}
            </button>
          ))}
        </div>
      </div>

      {askCopyPages && (
        <div className="flex flex-col gap-2.5 rounded-block border border-rule bg-surface p-4">
          <label htmlFor={pagesId} className="text-body-strong">How many pages is your copy?</label>
          <div className="flex items-center gap-3">
            <span className="flex items-baseline gap-1.5 border-b-2 border-plum pb-1">
              <input
                id={pagesId}
                inputMode="numeric"
                autoComplete="off"
                value={copyPages}
                onChange={(e) => setCopyPages(e.target.value.replace(/[^\d]/g, ""))}
                placeholder="0"
                className="bg-transparent text-title text-ink caret-plum placeholder:text-rule focus:outline-none"
                style={{ width: `${Math.max(2, copyPages.length) + 0.4}ch` }}
              />
            </span>
            <span className="text-label text-ink-muted">pages · we&rsquo;ll only ask once</span>
          </div>
          <p className="text-label text-ink-muted">Open Library doesn&rsquo;t list a page count for this edition. Or switch to %.</p>
        </div>
      )}

      {error && <p id={errId} role="alert" className="text-label text-danger">{error}</p>}

      <Button type="submit" block disabled={pending}>{pending ? "Saving…" : "Start reading"}</Button>
      <div className="flex justify-center">
        <Button type="button" variant="quiet" size="sm" onClick={onJustStarting} disabled={pending}>I&rsquo;m just starting</Button>
      </div>
    </form>
  );
}
