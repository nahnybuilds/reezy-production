import Link from "next/link";

/** Figma A3/A4 "‹ Back" — chevron + UI/Body, 44px hit area. */
export function BackLink(props: { href: string; label?: string } | { onClick: () => void; label?: string }) {
  const content = (
    <>
      <svg aria-hidden width="7" height="13" viewBox="0 0 7 13" fill="none" className="text-ink">
        <path d="M6 1 1 6.5 6 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="text-body">{props.label ?? "Back"}</span>
    </>
  );
  const cls = "-ml-1 inline-flex min-h-11 items-center gap-2 px-1 text-ink";
  return "href" in props ? (
    <Link href={props.href} className={cls}>{content}</Link>
  ) : (
    <button type="button" onClick={props.onClick} className={cls}>{content}</button>
  );
}
