import Link from "next/link";
import { notFound } from "next/navigation";
import { EmailSignIn } from "@/components/auth/EmailSignIn";
import { Onboarding } from "@/components/onboarding/Onboarding";
import { WhereAreYou } from "@/components/onboarding/WhereAreYou";
import { TodayView } from "@/components/today/TodayView";
import { WantToReadToday } from "@/components/today/WantToReadToday";
import type { BookResult } from "@/lib/openlibrary";

export const metadata = { title: "Phase 1 states · Reezy (dev)", robots: { index: false } };

// Dev-only visual QA of signed-in Phase 1 states with sample data (no auth, no writes). 404 in production.
const RESULTS: BookResult[] = [
  { olWorkKey: "OL20893680W", title: "Piranesi", authors: ["Susanna Clarke"], firstPublishYear: 2020, coverId: 10226290, pageCountMedian: 272 },
  { olWorkKey: "OL98455W", title: "Jonathan Strange & Mr Norrell", authors: ["Susanna Clarke"], firstPublishYear: 2004, coverId: null, pageCountMedian: 782 },
  { olWorkKey: "OL98456W", title: "The Ladies of Grace Adieu", authors: ["Susanna Clarke"], firstPublishYear: 2006, coverId: null, pageCountMedian: 235 },
];

const STATES = ["code", "search", "where-unknown", "where-known", "today-first-run", "today", "today-percent", "want-to-read"] as const;

export default async function Phase1States({ searchParams }: PageProps<"/dev/phase-1">) {
  if (process.env.VERCEL_ENV === "production") notFound();
  const state = (await searchParams).state as (typeof STATES)[number] | undefined;

  switch (state) {
    case "code":
      return <main className="mx-auto min-h-dvh max-w-[430px] px-6 pt-[54px]"><EmailSignIn preview="code" /></main>;
    case "search":
      return <Onboarding previewResults={RESULTS} previewQuery="susanna clarke" />;
    case "where-unknown":
      return <main className="mx-auto min-h-dvh max-w-[430px] px-6 pt-[60px]"><WhereAreYou preview book={{ olWorkKey: "OL20893680W", title: "Piranesi", copyPageCount: null }} /></main>;
    case "where-known":
      return <main className="mx-auto min-h-dvh max-w-[430px] px-6 pt-[60px]"><WhereAreYou preview book={{ olWorkKey: "OL20893680W", title: "Piranesi", copyPageCount: 272 }} /></main>;
    case "today-first-run":
      return <TodayView firstRun book={{ title: "Piranesi", authors: ["Susanna Clarke"], coverId: 10226290, unit: "page", page: 61, pct: 22.43, copyPageCount: 272 }} />;
    case "today":
      return <TodayView firstRun={false} book={{ title: "Piranesi", authors: ["Susanna Clarke"], coverId: 10226290, unit: "page", page: 156, pct: 57.35, copyPageCount: 272 }} />;
    case "today-percent":
      return <TodayView firstRun={false} book={{ title: "Intermezzo", authors: ["Sally Rooney"], coverId: null, unit: "percent", page: null, pct: 41, copyPageCount: null }} />;
    case "want-to-read":
      return <WantToReadToday preview book={{ olWorkKey: "OL20893680W", title: "Piranesi", authors: ["Susanna Clarke"], coverId: 10226290, copyPageCount: 272 }} />;
    default:
      return (
        <main className="mx-auto max-w-reading space-y-3 px-6 py-12">
          <h1 className="text-heading">Phase 1 states (dev)</h1>
          <ul className="space-y-2 text-body">
            <li><Link className="text-plum underline" href="/welcome">/welcome (A1, real page)</Link></li>
            <li><Link className="text-plum underline" href="/welcome/email">/welcome/email (A3, real page)</Link></li>
            {STATES.map((s) => <li key={s}><Link className="text-plum underline" href={`/dev/phase-1?state=${s}`}>{s}</Link></li>)}
          </ul>
        </main>
      );
  }
}
