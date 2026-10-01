import { describe, expect, it } from "vitest";
import { formatPosition, justStarting, parsePercent, parseWholeNumber, validateProgress } from "./position";

describe("progress entry", () => {
  it("parses whole page numbers and percentages", () => {
    expect(parseWholeNumber("61")).toBe(61);
    expect(parseWholeNumber(" 61 ")).toBe(61);
    expect(parseWholeNumber("6.1")).toBeNull();
    expect(parseWholeNumber("")).toBeNull();
    expect(parsePercent("57")).toBe(57);
    expect(parsePercent("57.5%")).toBe(57.5);
    expect(parsePercent("abc")).toBeNull();
  });

  it("requires the copy page count for page entries (D24)", () => {
    expect(validateProgress({ unit: "page", value: 61, copyPageCount: null })).toBe("copy_pages_needed");
    expect(validateProgress({ unit: "page", value: 61, copyPageCount: 272 })).toBeNull();
  });

  it("rejects pages past the reader's copy and bad percentages", () => {
    expect(validateProgress({ unit: "page", value: 300, copyPageCount: 272 })).toBe("past_last_page");
    expect(validateProgress({ unit: "page", value: 1, copyPageCount: 0 })).toBe("copy_pages_invalid");
    expect(validateProgress({ unit: "percent", value: 101, copyPageCount: null })).toBe("percent_range");
    expect(validateProgress({ unit: "percent", value: 57, copyPageCount: null })).toBeNull();
  });

  it("'I'm just starting' uses page 1 when the length is known, else 0%", () => {
    expect(justStarting(272)).toEqual({ unit: "page", value: 1 });
    expect(justStarting(null)).toEqual({ unit: "percent", value: 0 });
  });

  it("formats positions the way the reader entered them", () => {
    expect(formatPosition({ unit: "page", page: 61, pct: 22.43, copyPageCount: 272 })).toMatchObject({ primary: "p. 61", secondary: "of 272" });
    expect(formatPosition({ unit: "percent", page: null, pct: 57.4, copyPageCount: null })).toMatchObject({ primary: "57%", secondary: null });
  });
});
