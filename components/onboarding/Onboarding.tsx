"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { saveWantToRead } from "@/app/actions/books";
import { Button } from "@/components/ui/Button";
import type { BookResult } from "@/lib/openlibrary";
import { BookSearch } from "./BookSearch";
import { WhereAreYou } from "./WhereAreYou";

type Props = {
  /** Dev preview only. */
  previewResults?: BookResult[];
  previewQuery?: string;
};

/**
 * First-run Today (DESIGN §4 First-time user): "What are you reading right now?" → pick a book →
 * "Where are you?" → Today. Alternative path: "Not reading anything right now" → pick a book →
 * Want to Read → Today shows it with Start reading.
 */
export function Onboarding({ previewResults, previewQuery }: Props) {
  const [mode, setMode] = useState<"reading" | "want">("reading");
  const [picked, setPicked] = useState<BookResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function pick(book: BookResult) {
    setError(null);
    if (mode === "reading") return setPicked(book);
    if (previewResults) return;
    startTransition(async () => {
      const res = await saveWantToRead(book.olWorkKey);
      if (!res.ok) return setError(res.message);
      router.refresh(); // Today re-renders with the saved book
    });
  }

  if (picked) {
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col px-6 pt-[60px] pb-10">
        <WhereAreYou
          book={{ olWorkKey: picked.olWorkKey, title: picked.title, copyPageCount: picked.pageCountMedian }}
          preview={Boolean(previewResults)}
        />
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col px-6 pt-[70px] pb-6">
      <div className="flex flex-col gap-5">
        <p className="text-label text-plum">Welcome to Reezy</p>
        <h1 className="text-heading">{mode === "reading" ? "What are you reading right now?" : "Pick a book to read next."}</h1>
        <BookSearch onPick={pick} previewResults={previewResults} previewQuery={previewQuery} disabled={pending} />
        {error && <p role="alert" className="text-label text-danger">{error}</p>}
      </div>
      <div className="mt-auto flex justify-center pt-10">
        {mode === "reading" ? (
          <Button variant="quiet" size="sm" onClick={() => setMode("want")}>Not reading anything right now</Button>
        ) : (
          <Button variant="quiet" size="sm" onClick={() => setMode("reading")}>I&rsquo;m reading something now</Button>
        )}
      </div>
    </main>
  );
}
