type Props = {
  title: string;
  author?: string;
  /** Open Library cover id (works.cover_id). Null → typographic fallback. */
  coverId?: number | null;
  /** Rendered width in px; covers are always 2:3 (DESIGN.md §9.7). */
  width: number;
  className?: string;
};

// Fallback palettes: plum, pink or paper, chosen deterministically from the title. No worm, no stock art.
const FALLBACKS = [
  { bg: "bg-plum", fg: "text-paper" },
  { bg: "bg-pink", fg: "text-plum" },
  { bg: "bg-surface", fg: "text-ink" },
] as const;

function fallbackFor(title: string) {
  let h = 0;
  for (const ch of title) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return FALLBACKS[h % FALLBACKS.length];
}

export function coverUrl(coverId: number, width: number) {
  const size = width > 180 ? "L" : width > 60 ? "M" : "S";
  return `https://covers.openlibrary.org/b/id/${coverId}-${size}.jpg`;
}

/** Figma: Cover — real art with 3–4px corners, 1px inner hairline, slight shadow; typographic fallback. */
export function Cover({ title, author, coverId, width, className = "" }: Props) {
  const height = Math.round(width * 1.5);
  const radius = width < 60 ? "rounded-[3px]" : "rounded-cover";
  const shadow = width > 80 ? "shadow-cover" : "shadow-cover-sm";
  const frame = `relative shrink-0 overflow-hidden ${radius} ${shadow} ${className}`;
  const hairline = <span aria-hidden className={`pointer-events-none absolute inset-0 ${radius} ring-1 ring-inset ring-cover-hairline`} />;

  if (coverId) {
    return (
      <span className={frame} style={{ width, height }}>
        {/* Plain <img>: Open Library serves sized JPEGs; avoids image-optimization costs. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={coverUrl(coverId, width)} alt={`Cover of ${title}`} width={width} height={height} loading="lazy" className="size-full object-cover" />
        {hairline}
      </span>
    );
  }

  const { bg, fg } = fallbackFor(title);
  const pad = Math.round(width * 0.1);
  return (
    <span role="img" aria-label={`Cover of ${title}`} className={`${frame} ${bg} flex flex-col justify-end`} style={{ width, height, padding: pad }}>
      {width >= 80 ? (
        <>
          <span className={`font-ui font-semibold leading-tight ${fg}`} style={{ fontSize: Math.round(width * 0.12) }}>{title}</span>
          {author && <span className={`font-ui ${fg}`} style={{ fontSize: Math.round(width * 0.065) }}>{author}</span>}
        </>
      ) : (
        <span aria-hidden className={`h-0.5 ${fg.replace("text-", "bg-")}`} style={{ width: Math.round(width * 0.45) }} />
      )}
      {hairline}
    </span>
  );
}
