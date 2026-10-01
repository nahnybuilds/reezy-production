"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Cover } from "@/components/ui/Cover";
import { resultMeta, type BookResult } from "@/lib/openlibrary";

type State =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "results"; results: BookResult[] }
  | { kind: "empty" }
  | { kind: "error" };

type Props = {
  onPick: (book: BookResult) => void;
  /** Dev preview only: show these results without calling the API. */
  previewResults?: BookResult[];
  previewQuery?: string;
  disabled?: boolean;
};

/**
 * Figma A5 / C1 / C4 / C5 / C6 — search by title or author (Open Library), with results, loading,
 * no-results and error states using the approved copy.
 */
export function BookSearch({ onPick, previewResults, previewQuery, disabled }: Props) {
  const [q, setQ] = useState(previewQuery ?? "");
  const [state, setState] = useState<State>(previewResults ? { kind: "results", results: previewResults } : { kind: "idle" });
  const [attempt, setAttempt] = useState(0);
  const ctrl = useRef<AbortController | null>(null);
  const router = useRouter();
  const tooShort = !previewResults && q.trim().length < 2;
  const view: State = tooShort ? { kind: "idle" } : state;

  useEffect(() => {
    if (previewResults) return;
    const query = q.trim();
    if (query.length < 2) {
      ctrl.current?.abort(); // "idle" is derived during render
      return;
    }
    const t = setTimeout(async () => {
      ctrl.current?.abort();
      const c = new AbortController();
      ctrl.current = c;
      setState({ kind: "loading" });
      try {
        const res = await fetch(`/api/books/search?q=${encodeURIComponent(query)}`, { signal: c.signal });
        if (res.status === 401) return router.replace("/welcome");
        if (!res.ok) return setState({ kind: "error" });
        const data = (await res.json()) as { results: BookResult[] };
        setState(data.results.length ? { kind: "results", results: data.results } : { kind: "empty" });
      } catch (e) {
        if ((e as Error).name !== "AbortError") setState({ kind: "error" });
      }
    }, 300);
    return () => clearTimeout(t);
  }, [q, attempt, previewResults, router]);

  return (
    <div className="flex flex-col gap-5">
      <label className="block">
        <span className="sr-only">Search by title or author</span>
        <input
          type="search"
          autoFocus
          enterKeyHint="search"
          autoComplete="off"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by title or author"
          className="h-13 w-full rounded-block border border-rule bg-surface px-5 text-body text-ink placeholder:text-ink-muted focus:border-plum focus:outline-none focus:ring-2 focus:ring-plum"
        />
      </label>

      <div aria-live="polite">
        {view.kind === "loading" && (
          <div className="flex flex-col gap-5 pt-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex gap-3.5">
                <span className="h-[66px] w-11 rounded-[3px] bg-rule" />
                <span className="flex flex-col gap-2 pt-3">
                  <span className="h-2.5 w-[200px] rounded-full bg-rule" />
                  <span className="h-2.5 w-[120px] rounded-full bg-rule" />
                </span>
              </div>
            ))}
            <p className="text-label text-ink-muted">Searching Open Library…</p>
          </div>
        )}

        {view.kind === "results" && (
          <div className="flex flex-col gap-5">
            <ul className="flex flex-col">
              {view.results.map((b) => (
                <li key={b.olWorkKey}>
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => onPick(b)}
                    className="flex w-full items-center gap-3.5 rounded-[6px] py-2.5 text-left disabled:opacity-60"
                  >
                    <Cover title={b.title} author={b.authors[0]} coverId={b.coverId} width={44} />
                    <span className="flex min-w-0 flex-col gap-0.5">
                      <span className="text-body-strong text-ink">{b.title}</span>
                      <span className="text-label text-ink-muted">{resultMeta(b)}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            <p className="text-label text-ink-muted">Results from Open Library</p>
          </div>
        )}

        {view.kind === "empty" && (
          <div className="flex flex-col gap-2 pt-6">
            <p className="text-body-strong">No books match &ldquo;{q.trim()}&rdquo;.</p>
            <p className="text-body text-ink-muted">Check the spelling, or try the author&rsquo;s name.</p>
          </div>
        )}

        {view.kind === "error" && (
          <div className="flex flex-col items-start gap-2.5 pt-6">
            <p className="text-body-strong">Couldn&rsquo;t reach the book library.</p>
            <p className="text-body text-ink-muted">Check your connection and try again. Your books and Thoughts are safe.</p>
            <Button variant="secondary" size="sm" onClick={() => setAttempt((n) => n + 1)}>Try again</Button>
          </div>
        )}
      </div>
    </div>
  );
}
