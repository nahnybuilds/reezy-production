import { BackLink } from "@/components/ui/BackLink";

/** Shell for the V1 placeholder Terms / Privacy pages (D61): clearly marked as drafts, not legal advice. */
export function DraftLegalPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-reading flex-col gap-6 px-6 pt-[54px] pb-16">
      <BackLink href="/welcome" />
      <p role="note" className="rounded-block border border-plum bg-surface p-4 text-label text-plum">
        DRAFT — placeholder text for review. Not final, and not legal advice.
      </p>
      <h1 className="text-heading">{title}</h1>
      <div className="flex flex-col gap-4 text-body [&_h2]:mt-4 [&_h2]:text-body-strong">{children}</div>
    </main>
  );
}
