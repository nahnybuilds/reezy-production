"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { openLibraryContact, serverEnv } from "@/lib/env";
import { getWork, OpenLibraryError } from "@/lib/openlibrary";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { MAX_COPY_PAGES, PROGRESS_ERROR_COPY, validateProgress } from "@/lib/reading/position";

export type ActionResult = { ok: true } | { ok: false; message: string };

const workKey = z.string().regex(/^OL[0-9]+W$/);

const startSchema = z.object({
  olWorkKey: workKey,
  unit: z.enum(["page", "percent"]),
  value: z.number().min(0).max(MAX_COPY_PAGES),
  copyPageCount: z.number().int().min(1).max(MAX_COPY_PAGES).nullable(),
});

const LIBRARY_DOWN = "Couldn't reach the book library. Check your connection and try again.";
const GENERIC = "Something went wrong. Please try again.";

async function signedInClient() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return data.user ? { supabase, userId: data.user.id } : null;
}

/**
 * Make sure the work is cached in `works`. Metadata always comes from Open Library by key, never from the
 * client, and is written with the server-only secret key (readers can't write `works`, D63/D64).
 */
async function ensureWork(olWorkKey: string): Promise<{ id: string; pageCountMedian: number | null } | { error: string }> {
  try {
    serverEnv(); // the secret key is required to write `works`
  } catch {
    return { error: "Adding books isn't configured on this server yet." }; // SUPABASE_SECRET_KEY missing
  }
  let book;
  try {
    book = await getWork(olWorkKey, openLibraryContact());
  } catch (e) {
    if (e instanceof OpenLibraryError) return { error: LIBRARY_DOWN };
    throw e;
  }
  if (!book) return { error: "We couldn't find that book. Try searching again." };

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("works")
    .upsert(
      {
        ol_work_key: book.olWorkKey,
        title: book.title,
        authors: book.authors,
        first_publish_year: book.firstPublishYear,
        cover_id: book.coverId,
        page_count_median: book.pageCountMedian,
        description: book.description,
      },
      { onConflict: "ol_work_key" },
    )
    .select("id, page_count_median")
    .single();
  if (error || !data) return { error: GENERIC };
  return { id: data.id, pageCountMedian: data.page_count_median };
}

/** Get (or create) the reader's row for this work. RLS makes it the reader's own. */
async function ensureUserBook(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  workId: string,
  status: "reading" | "want_to_read",
  seedPages: number | null,
) {
  const existing = await supabase.from("user_books").select("id, copy_page_count").eq("user_id", userId).eq("work_id", workId).maybeSingle();
  if (existing.data) return existing.data;
  const inserted = await supabase
    .from("user_books")
    .insert({ work_id: workId, status, copy_page_count: seedPages })
    .select("id, copy_page_count")
    .single();
  return inserted.data;
}

function messageForDbError(message: string | undefined): string {
  if (!message) return GENERIC;
  if (message.includes("copy_page_count_required")) return PROGRESS_ERROR_COPY.copy_pages_needed;
  if (message.includes("page_beyond_copy")) return PROGRESS_ERROR_COPY.past_last_page;
  if (message.includes("invalid_position")) return PROGRESS_ERROR_COPY.enter_a_number;
  return GENERIC;
}

/** Onboarding A6 / Want to Read → Start reading: mark the book Reading at the reader's position. */
export async function startReading(input: z.infer<typeof startSchema>): Promise<ActionResult> {
  const parsed = startSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: GENERIC };
  const { olWorkKey, unit, value, copyPageCount } = parsed.data;

  const session = await signedInClient();
  if (!session) return { ok: false, message: "Your session ended. Please sign in again." };

  const work = await ensureWork(olWorkKey);
  if ("error" in work) return { ok: false, message: work.error };

  // Seed the copy page count from Open Library's median only as a starting value (D63).
  const userBook = await ensureUserBook(session.supabase, session.userId, work.id, "reading", copyPageCount ?? work.pageCountMedian);
  if (!userBook) return { ok: false, message: GENERIC };

  const pages = copyPageCount ?? userBook.copy_page_count;
  const invalid = validateProgress({ unit, value, copyPageCount: unit === "page" ? pages : null });
  if (invalid) return { ok: false, message: PROGRESS_ERROR_COPY[invalid] };

  const { error } = await session.supabase.rpc("log_progress", {
    p_user_book_id: userBook.id,
    p_unit: unit,
    p_value: value,
    ...(copyPageCount ? { p_copy_page_count: copyPageCount } : {}),
  });
  if (error) return { ok: false, message: messageForDbError(error.message) };

  revalidatePath("/");
  return { ok: true };
}

/** Onboarding "Not reading anything right now": save the book as Want to Read. */
export async function saveWantToRead(olWorkKey: string): Promise<ActionResult> {
  if (!workKey.safeParse(olWorkKey).success) return { ok: false, message: GENERIC };
  const session = await signedInClient();
  if (!session) return { ok: false, message: "Your session ended. Please sign in again." };

  const work = await ensureWork(olWorkKey);
  if ("error" in work) return { ok: false, message: work.error };

  const userBook = await ensureUserBook(session.supabase, session.userId, work.id, "want_to_read", work.pageCountMedian);
  if (!userBook) return { ok: false, message: GENERIC };

  revalidatePath("/");
  return { ok: true };
}
