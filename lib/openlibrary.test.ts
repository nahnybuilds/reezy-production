import { afterEach, describe, expect, it, vi } from "vitest";
import { getWork, isWorkKey, mapSearchDoc, OpenLibraryError, resultMeta, searchBooks } from "./openlibrary";

const PIRANESI = {
  key: "/works/OL20893680W",
  title: "Piranesi",
  author_name: ["Susanna Clarke"],
  first_publish_year: 2020,
  cover_i: 10226290,
  number_of_pages_median: 272,
};

afterEach(() => vi.unstubAllGlobals());

describe("Open Library mapping", () => {
  it("maps a search doc to a book result", () => {
    expect(mapSearchDoc(PIRANESI)).toEqual({
      olWorkKey: "OL20893680W", title: "Piranesi", authors: ["Susanna Clarke"], firstPublishYear: 2020, coverId: 10226290, pageCountMedian: 272,
    });
    expect(resultMeta(mapSearchDoc(PIRANESI)!)).toBe("Susanna Clarke · 2020 · 272 pages");
  });

  it("drops results without a valid work key or title, and nulls missing data", () => {
    expect(mapSearchDoc({ key: "/books/OL1M", title: "x" })).toBeNull();
    expect(mapSearchDoc({ key: "/works/OL1W" })).toBeNull();
    expect(mapSearchDoc({ key: "/works/OL1W", title: "Untitled-ish", cover_i: -1, number_of_pages_median: 0 })).toMatchObject({ coverId: null, pageCountMedian: null, authors: [] });
  });

  it("validates work keys", () => {
    expect(isWorkKey("OL20893680W")).toBe(true);
    expect(isWorkKey("OL20893680M")).toBe(false);
    expect(isWorkKey("../etc")).toBe(false);
  });
});

describe("Open Library requests", () => {
  it("sends the contact User-Agent and skips very short queries", async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ docs: [PIRANESI] })));
    vi.stubGlobal("fetch", fetchMock);
    expect(await searchBooks("a", "Reezy (test)")).toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
    const results = await searchBooks("piranesi", "Reezy (test)");
    expect(results[0].title).toBe("Piranesi");
    const [, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect((init.headers as Record<string, string>)["User-Agent"]).toBe("Reezy (test)");
  });

  it("reports an unreachable library as an OpenLibraryError", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => { throw new TypeError("network"); }));
    await expect(searchBooks("piranesi", "Reezy (test)")).rejects.toBeInstanceOf(OpenLibraryError);
  });

  it("looks a work up by key only, and tolerates a missing description", async () => {
    vi.stubGlobal("fetch", vi.fn(async (url: string) =>
      url.includes("search.json") ? new Response(JSON.stringify({ docs: [PIRANESI] })) : new Response("nope", { status: 500 })));
    expect(await getWork("OL20893680W", "Reezy (test)")).toMatchObject({ title: "Piranesi", description: null });
    expect(await getWork("not-a-key", "Reezy (test)")).toBeNull();
  });
});
