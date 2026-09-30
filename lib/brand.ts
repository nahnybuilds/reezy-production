/**
 * Swappable brand assets (D59: logo and worm stay placeholders until the designer's final files).
 *
 * To drop in the real assets: put the files in /public/brand/ and set the paths below.
 * Nothing else needs to change — every appearance uses <LogoSlot> / <WormSlot>.
 * Never redraw or approximate the logo or worm (DESIGN.md §8).
 */
export const BRAND_ASSETS: {
  /** Full logo / wordmark (Welcome, desktop masthead, Today masthead). */
  logo: string | null;
  /** The worm drawing, used cropped/scaled/rotated only (DESIGN.md §8, appearances #1–#6). */
  worm: string | null;
} = {
  logo: null, // e.g. "/brand/reezy-logo.svg"
  worm: null, // e.g. "/brand/reezy-worm.svg"
};
