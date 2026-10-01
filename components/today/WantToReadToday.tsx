"use client";

import { useState } from "react";
import { WhereAreYou } from "@/components/onboarding/WhereAreYou";
import { Button } from "@/components/ui/Button";
import { BookHero, Masthead } from "./TodayView";

type Props = {
  book: { olWorkKey: string; title: string; authors: string[]; coverId: number | null; copyPageCount: number | null };
  preview?: boolean;
};

/**
 * Today when the reader only has Want to Read books (approved minimal state, DESIGN §11 known gap):
 * the existing Today language — masthead, cover, title, byline — plus one action, Start reading,
 * which leads to the approved "Where are you?" step.
 */
export function WantToReadToday({ book, preview }: Props) {
  const [starting, setStarting] = useState(false);

  if (starting) {
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col px-6 pt-[60px] pb-10">
        <WhereAreYou book={{ olWorkKey: book.olWorkKey, title: book.title, copyPageCount: book.copyPageCount }} preview={preview} />
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col px-6 pt-14 pb-10">
      <Masthead />
      <div className="mt-6">
        <BookHero title={book.title} authors={book.authors} coverId={book.coverId} />
      </div>
      <p className="mt-6 text-center text-label text-plum">Want to Read</p>
      <div className="mt-4">
        <Button block onClick={() => setStarting(true)}>Start reading</Button>
      </div>
    </main>
  );
}
