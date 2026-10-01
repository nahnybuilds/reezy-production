import { NextResponse, type NextRequest } from "next/server";
import { openLibraryContact } from "@/lib/env";
import { OpenLibraryError, searchBooks } from "@/lib/openlibrary";
import { createClient } from "@/lib/supabase/server";

/** GET /api/books/search?q=… — Open Library search proxy for signed-in readers (proxy.ts also guards it). */
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) return NextResponse.json({ error: "not_signed_in" }, { status: 401 });

  const q = request.nextUrl.searchParams.get("q") ?? "";
  if (q.trim().length < 2) return NextResponse.json({ results: [] });

  try {
    const results = await searchBooks(q, openLibraryContact());
    return NextResponse.json({ results }, { headers: { "Cache-Control": "private, max-age=60" } });
  } catch (e) {
    if (e instanceof OpenLibraryError) return NextResponse.json({ error: "library_unreachable" }, { status: 502 });
    throw e;
  }
}
