/**
 * Open Library (no API key). Server-side only: search proxy + authoritative work lookup by key.
 * Docs: https://openlibrary.org/dev/docs/api/search — we send a descriptive User-Agent, as they ask.
 */
const SEARCH_URL = "https://openlibrary.org/search.json";
const FIELDS = "key,title,author_name,first_publish_year,cover_i,number_of_pages_median";
const WORK_KEY = /^OL[0-9]+W$/;

export type BookResult = {
  olWorkKey: string;
  title: string;
  authors: string[];
  firstPublishYear: number | null;
  coverId: number | null;
  /** Median page count across editions — metadata/seed only, never authoritative (D63). */
  pageCountMedian: number | null;
};

type SearchDoc = {
  key?: string;
  title?: string;
  author_name?: string[];
  first_publish_year?: number;
  cover_i?: number;
  number_of_pages_median?: number;
};

export class OpenLibraryError extends Error {}

export function isWorkKey(value: string): boolean {
  return WORK_KEY.test(value);
}

export function mapSearchDoc(doc: SearchDoc): BookResult | null {
  const olWorkKey = doc.key?.replace(/^\/works\//, "") ?? "";
  if (!isWorkKey(olWorkKey) || !doc.title) return null;
  const pages = doc.number_of_pages_median;
  return {
    olWorkKey,
    title: doc.title.slice(0, 500),
    authors: (doc.author_name ?? []).slice(0, 5),
    firstPublishYear: typeof doc.first_publish_year === "number" ? doc.first_publish_year : null,
    coverId: typeof doc.cover_i === "number" && doc.cover_i > 0 ? doc.cover_i : null,
    pageCountMedian: typeof pages === "number" && pages > 0 && pages <= 20000 ? Math.round(pages) : null,
  };
}

async function olFetch(url: string, contact: string, revalidate: number) {
  let res: Response;
  try {
    res = await fetch(url, {
      headers: { "User-Agent": contact, Accept: "application/json" },
      signal: AbortSignal.timeout(8000),
      next: { revalidate },
    });
  } catch {
    throw new OpenLibraryError("unreachable");
  }
  if (!res.ok) throw new OpenLibraryError(`status_${res.status}`);
  return res.json();
}

/** Search by title or author. */
export async function searchBooks(query: string, contact: string): Promise<BookResult[]> {
  const q = query.trim().slice(0, 100);
  if (q.length < 2) return [];
  const url = `${SEARCH_URL}?${new URLSearchParams({ q, fields: FIELDS, limit: "10" })}`;
  const data = (await olFetch(url, contact, 3600)) as { docs?: SearchDoc[] };
  return (data.docs ?? []).map(mapSearchDoc).filter((b): b is BookResult => b !== null);
}

/** Authoritative lookup by work key — the server never trusts book metadata sent by a client. */
export async function getWork(olWorkKey: string, contact: string): Promise<(BookResult & { description: string | null }) | null> {
  if (!isWorkKey(olWorkKey)) return null;
  const url = `${SEARCH_URL}?${new URLSearchParams({ q: `key:/works/${olWorkKey}`, fields: FIELDS, limit: "1" })}`;
  const data = (await olFetch(url, contact, 86400)) as { docs?: SearchDoc[] };
  const book = data.docs?.[0] ? mapSearchDoc(data.docs[0]) : null;
  if (!book || book.olWorkKey !== olWorkKey) return null;

  let description: string | null = null;
  try {
    const work = (await olFetch(`https://openlibrary.org/works/${olWorkKey}.json`, contact, 86400)) as {
      description?: string | { value?: string };
    };
    const raw = typeof work.description === "string" ? work.description : work.description?.value;
    description = raw ? raw.trim().slice(0, 2000) : null;
  } catch {
    description = null; // description is optional; never block adding a book on it
  }
  return { ...book, description };
}

/** "Susanna Clarke · 2020 · 272 pages" (Figma A5 result meta). */
export function resultMeta(book: Pick<BookResult, "authors" | "firstPublishYear" | "pageCountMedian">): string {
  return [book.authors[0], book.firstPublishYear, book.pageCountMedian ? `${book.pageCountMedian} pages` : null]
    .filter(Boolean)
    .join(" · ");
}
