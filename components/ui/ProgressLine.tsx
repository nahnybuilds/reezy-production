type Props = {
  /** Normalized position, 0–100 (authoritative, D63). */
  pct: number;
  /** Positions (0–100) where the reader left Thoughts — pink margin marks (DESIGN.md §9.10). */
  marks?: number[];
  /** Spoken label, e.g. "Page 156 of 272". */
  label: string;
  className?: string;
};

/** Figma: Progress / Book — 4px rule track, plum fill, lime "you are here" dot with a plum ring. */
export function ProgressLine({ pct, marks = [], label, className = "" }: Props) {
  const p = Math.max(0, Math.min(100, pct));
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(p)}
      className={`relative h-5 w-full ${className}`}
    >
      <div className="absolute inset-x-0 top-2 h-1 rounded-full bg-rule" />
      <div className="absolute left-0 top-2 h-1 rounded-full bg-plum" style={{ width: `${p}%` }} />
      {marks.map((m, i) => (
        <span key={i} aria-hidden className="absolute -top-px h-2.5 w-[3px] -translate-x-1/2 bg-pink" style={{ left: `${m}%` }} />
      ))}
      <span
        aria-hidden
        className="absolute top-[3px] size-3.5 -translate-x-1/2 rounded-full border-2 border-plum bg-lime"
        style={{ left: `${p}%` }}
      />
    </div>
  );
}
