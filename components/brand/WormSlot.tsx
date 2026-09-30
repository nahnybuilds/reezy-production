import { BRAND_ASSETS } from "@/lib/brand";

/**
 * The six approved worm appearances (DESIGN.md §8, D58). Each is a placement of the single
 * approved drawing — cropped, scaled or rotated, never redrawn.
 */
export type WormAppearance =
  | "welcome" // #1 full size, bleeding off the right edge of plum
  | "first-run-today" // #2 peeks over the top edge of the cover
  | "empty-state" // #3 peeks from behind the search field / sits on a shelf line
  | "reflection" // #4 peeks over the pinned note
  | "finish" // #5 full size on plum
  | "journey-end"; // #6 tiny, curled below the final dot

type Props = {
  appearance: WormAppearance;
  width: number;
  height: number;
  /** Degrees; the asset may be rotated, never redrawn. */
  rotate?: number;
  className?: string;
};

/** Decorative only (aria-hidden): screens must read completely without it. */
export function WormSlot({ appearance, width, height, rotate = 0, className = "" }: Props) {
  const style = { width, height, transform: rotate ? `rotate(${rotate}deg)` : undefined };
  if (BRAND_ASSETS.worm) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={BRAND_ASSETS.worm} alt="" aria-hidden data-worm={appearance} style={{ ...style, objectFit: "cover" }} className={className} />
    );
  }
  return (
    <span
      aria-hidden
      data-placeholder="worm"
      data-worm={appearance}
      style={style}
      className={`inline-flex items-center justify-center rounded-t-full rounded-b-md border-[1.5px] border-dashed border-plum bg-paper text-[10px] font-semibold text-plum ${className}`}
    >
      worm
    </span>
  );
}
