/**
 * Progress entry rules (PRODUCT §3, D12, D24, D25, D63). The database (`log_progress`) is the authority;
 * these helpers give the reader immediate, matching feedback and format positions for display.
 */
export type Unit = "page" | "percent";

export type ProgressInput = {
  unit: Unit;
  value: number;
  /** The reader's copy page count, when known or just entered. */
  copyPageCount: number | null;
};

export type ProgressError = "enter_a_number" | "copy_pages_needed" | "copy_pages_invalid" | "past_last_page" | "percent_range";

export const MAX_COPY_PAGES = 20000;

export function parseWholeNumber(raw: string): number | null {
  const s = raw.trim();
  if (!/^\d{1,5}$/.test(s)) return null;
  return Number(s);
}

export function parsePercent(raw: string): number | null {
  const s = raw.trim().replace(/%$/, "");
  if (!/^\d{1,3}(\.\d{1,2})?$/.test(s)) return null;
  return Number(s);
}

export function validateProgress(input: ProgressInput): ProgressError | null {
  if (!Number.isFinite(input.value) || input.value < 0) return "enter_a_number";
  if (input.unit === "percent") return input.value > 100 ? "percent_range" : null;
  if (input.copyPageCount === null) return "copy_pages_needed";
  if (!Number.isInteger(input.copyPageCount) || input.copyPageCount < 1 || input.copyPageCount > MAX_COPY_PAGES) return "copy_pages_invalid";
  if (input.value > input.copyPageCount) return "past_last_page";
  return null;
}

export const PROGRESS_ERROR_COPY: Record<ProgressError, string> = {
  enter_a_number: "Enter where you are.",
  copy_pages_needed: "How many pages is your copy? Or switch to %.",
  copy_pages_invalid: "Enter your copy's page count.",
  past_last_page: "That's past the last page of your copy.",
  percent_range: "Enter a percentage from 0 to 100.",
};

/** The "I'm just starting" shortcut: page 1 when the copy's length is known, otherwise 0%. */
export function justStarting(copyPageCount: number | null): { unit: Unit; value: number } {
  return copyPageCount ? { unit: "page", value: 1 } : { unit: "percent", value: 0 };
}

/** Display in the format the reader used (PRODUCT §3): "p. 61" + "of 272", or "57%". */
export function formatPosition(p: { unit: Unit; page: number | null; pct: number; copyPageCount: number | null }) {
  if (p.unit === "page" && p.page !== null) {
    return { primary: `p. ${p.page}`, secondary: p.copyPageCount ? `of ${p.copyPageCount}` : null, label: p.copyPageCount ? `Page ${p.page} of ${p.copyPageCount}` : `Page ${p.page}` };
  }
  const pct = Math.round(p.pct);
  return { primary: `${pct}%`, secondary: null, label: `${pct} percent through` };
}
