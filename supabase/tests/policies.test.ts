// Privacy, spoiler and integrity rules for the V1 schema (D15, D26, D29, D32, D60, D63).
// Readers of Piranesi on different copies:
//   Maya  — reading, 272-page copy, p.156 (57.35%)
//   Sam   — reading, 300-page copy (different edition), shares at 30% and 80%
//   Cleo  — Want to Read
//   Dev   — finishes the book
import { beforeAll, describe, expect, it } from "vitest";
import type { PGlite } from "@electric-sql/pglite";
import { asUser, createTestDb } from "./harness";

const MAYA = "00000000-0000-4000-8000-00000000000a";
const SAM = "00000000-0000-4000-8000-00000000000b";
const CLEO = "00000000-0000-4000-8000-00000000000c";
const DEV = "00000000-0000-4000-8000-00000000000d";

let db: PGlite;
let work: string;
const ub: Record<string, string> = {};
const t: Record<string, string> = {};

const one = async <T = Record<string, unknown>>(sql: string, params: unknown[] = []) => (await db.query<T>(sql, params)).rows[0];
const rows = async <T = Record<string, unknown>>(sql: string, params: unknown[] = []) => (await db.query<T>(sql, params)).rows;

async function addBook(user: string, status: string, copyPages: number | null) {
  const r = await asUser(db, user, () =>
    one<{ id: string }>("insert into public.user_books (work_id, status, copy_page_count) values ($1, $2, $3) returning id", [work, status, copyPages]),
  );
  ub[user] = r.id;
}
const logPage = (user: string, page: number) =>
  asUser(db, user, () => one<{ position_pct: string; status: string }>("select position_pct, status from public.log_progress($1, 'page', $2)", [ub[user], page]));
const logPct = (user: string, pct: number) =>
  asUser(db, user, () => one<{ position_pct: string; status: string }>("select position_pct, status from public.log_progress($1, 'percent', $2)", [ub[user], pct]));
async function think(user: string, key: string, body: string, opts: { privacy?: string; parent?: string; forgedPct?: number } = {}) {
  const r = await asUser(db, user, () =>
    one<{ id: string }>(
      `insert into public.thoughts (work_id, user_book_id, body, privacy, parent_thought_id, position_pct, position_unit)
       values ($1, $2, $3, $4, $5, $6, 'page') returning id`,
      [work, ub[user], body, opts.privacy ?? "private", opts.parent ?? null, opts.forgedPct ?? 0],
    ),
  );
  t[key] = r.id;
}
const visibleThoughts = (user: string) =>
  asUser(db, user, async () => (await rows<{ id: string }>("select id from public.thoughts order by position_pct")).map((r) => r.id));

beforeAll(async () => {
  db = await createTestDb();
  await db.query(
    `insert into auth.users (id, email, raw_user_meta_data) values
      ($1, 'maya@example.com', '{"full_name":"Maya Chen"}'), ($2, 'sam@example.com', '{}'),
      ($3, 'cleo@example.com', '{}'), ($4, 'dev@example.com', '{"name":"Dev"}')`,
    [MAYA, SAM, CLEO, DEV],
  );
  work = (await one<{ id: string }>(
    "insert into public.works (ol_work_key, title, authors, page_count_median) values ('OL20893680W', 'Piranesi', '{Susanna Clarke}', 272) returning id",
  )).id;
  await addBook(MAYA, "reading", 272);
  await addBook(SAM, "reading", 300);
  await addBook(CLEO, "want_to_read", null);
  await addBook(DEV, "reading", null);
});

describe("profiles", () => {
  it("are created on sign-up, using the Google name when present (D41)", async () => {
    const names = await rows<{ id: string; display_name: string | null }>("select id, display_name from public.profiles order by id");
    expect(names.find((p) => p.id === MAYA)?.display_name).toBe("Maya Chen");
    expect(names.find((p) => p.id === SAM)?.display_name).toBeNull();
  });
});

describe("progress normalization and status (D12, D25, D27, D63)", () => {
  it("normalizes pages against the reader's own copy", async () => {
    expect((await logPage(MAYA, 84)).position_pct).toBe("30.88");
    expect((await logPage(SAM, 90)).position_pct).toBe("30.00"); // p.90 of a 300-page copy
  });
  it("requires a copy page count before page-based progress (D24)", async () => {
    await expect(logPage(DEV, 50)).rejects.toThrow(/copy_page_count_required/);
  });
  it("moves to Finished at 100% and back to Reading when corrected (D27)", async () => {
    expect((await logPct(DEV, 100)).status).toBe("finished");
    expect((await logPct(DEV, 90)).status).toBe("reading");
    expect((await logPct(DEV, 100)).status).toBe("finished");
  });
  it("records an append-only check-in history", async () => {
    const n = await asUser(db, MAYA, () => one<{ n: number }>("select count(*)::int n from public.check_ins"));
    expect(n.n).toBe(1);
    await expect(asUser(db, MAYA, () => db.query("delete from public.check_ins"))).rejects.toThrow(/permission denied/);
  });
});

describe("thoughts: position authority and chains (D17, D31, D32)", () => {
  it("ignores a client-supplied position and uses the reader's place", async () => {
    await think(MAYA, "maya84", "I don't trust the Other.", { forgedPct: 99 });
    const r = await asUser(db, MAYA, () => one<{ position_pct: string; position_page: number }>("select position_pct, position_page from public.thoughts where id = $1", [t.maya84]));
    expect(r).toEqual({ position_pct: "30.88", position_page: 84 });
  });
  it("links a reflection response to the earlier Thought and keeps the chain root", async () => {
    await logPage(MAYA, 156);
    await think(MAYA, "maya156", "Less sure now.", { privacy: "shared", parent: t.maya84 });
    await logPage(MAYA, 238);
    await think(MAYA, "maya238", "Wrong question.", { parent: t.maya156 });
    const chain = await asUser(db, MAYA, () =>
      rows<{ id: string; parent_thought_id: string | null; chain_root_id: string }>(
        "select id, parent_thought_id, chain_root_id from public.thoughts where chain_root_id = $1 order by position_pct", [t.maya84]),
    );
    expect(chain.map((c) => c.id)).toEqual([t.maya84, t.maya156, t.maya238]);
    expect(chain.map((c) => c.parent_thought_id)).toEqual([null, t.maya84, t.maya156]);
    await logPage(MAYA, 156); // back to p.156 for the rest of the scenario (backward correction allowed)
  });
  it("rejects a parent from another reader", async () => {
    await expect(think(SAM, "bad", "hijack", { parent: t.maya84 })).rejects.toThrow(/parent_must_be_own_thought/);
  });
  it("keeps position and chain immutable", async () => {
    await expect(asUser(db, MAYA, () => db.query("update public.thoughts set position_pct = 1 where id = $1", [t.maya84]))).rejects.toThrow(/immutable/);
  });
  it("blocks Thoughts on a Want to Read book", async () => {
    await expect(think(CLEO, "cleo", "early")).rejects.toThrow(/thought_requires_reading_or_finished/);
  });
});

describe("spoiler visibility across readers (D15, D63)", () => {
  beforeAll(async () => {
    await think(SAM, "sam30", "He catalogues everything.", { privacy: "shared" }); // 30%
    await logPage(SAM, 240); // 80% of Sam's 300-page copy
    await think(SAM, "sam80", "Spoiler-ish thought at 80%.", { privacy: "shared" });
    await think(SAM, "samPrivate", "Private note.");
  });
  it("a reader sees shared Thoughts at or behind their normalized position only", async () => {
    const seen = await visibleThoughts(MAYA); // Maya at 57.35%
    expect(seen).toContain(t.sam30);
    expect(seen).not.toContain(t.sam80);
    expect(seen).not.toContain(t.samPrivate);
  });
  it("compares normalized progress, not raw page numbers across copies", async () => {
    // Sam's p.240 (80%) is below Maya's page number 156? No — pages differ by copy; only % matters.
    const r = await asUser(db, MAYA, () => one<{ n: number }>("select count(*)::int n from public.thoughts where id = $1", [t.sam80]));
    expect(r.n).toBe(0);
  });
  it("Want to Read sees no Thoughts, only counts (D45, D55)", async () => {
    expect(await visibleThoughts(CLEO)).toEqual([]);
    const c = await asUser(db, CLEO, () => one<{ readers: number; ahead: number }>(
      "select public.readers_talking($1) readers, public.thoughts_ahead($1) ahead", [work]));
    expect(c).toEqual({ readers: 2, ahead: 3 }); // Maya + Sam share; maya156, sam30, sam80
  });
  it("counts ahead for a Reading viewer without revealing content", async () => {
    const c = await asUser(db, MAYA, () => one<{ ahead: number }>("select public.thoughts_ahead($1) ahead", [work]));
    expect(c.ahead).toBe(1); // sam80
  });
  it("Finished readers see all shared Thoughts", async () => {
    const seen = await visibleThoughts(DEV);
    expect(seen).toEqual(expect.arrayContaining([t.sam30, t.sam80, t.maya156]));
    expect(seen).not.toContain(t.samPrivate);
  });
  it("never exposes a private parent through a shared reflection (D29)", async () => {
    const seen = await visibleThoughts(DEV);
    expect(seen).toContain(t.maya156);
    expect(seen).not.toContain(t.maya84); // private parent
  });
});

describe("replies and likes inherit the Thought's visibility (D26, D32)", () => {
  it("replies are visible only where the parent Thought is", async () => {
    await asUser(db, DEV, () => db.query("insert into public.replies (thought_id, body) values ($1, 'Finished-reader reply')", [t.sam80]));
    await asUser(db, DEV, () => db.query("insert into public.replies (thought_id, body) values ($1, 'Early reply')", [t.sam30]));
    const mayaSees = await asUser(db, MAYA, () => rows<{ body: string }>("select body from public.replies"));
    expect(mayaSees.map((r) => r.body)).toEqual(["Early reply"]);
  });
  it("a reader can't reply to or like a Thought they can't see", async () => {
    await expect(asUser(db, MAYA, () => db.query("insert into public.replies (thought_id, body) values ($1, 'x')", [t.sam80]))).rejects.toThrow();
    await expect(asUser(db, MAYA, () => db.query("insert into public.likes (thought_id) values ($1)", [t.sam80]))).rejects.toThrow();
  });
  it("unsharing hides replies but keeps them stored", async () => {
    await asUser(db, SAM, () => db.query("update public.thoughts set privacy = 'private' where id = $1", [t.sam30]));
    expect(await asUser(db, MAYA, () => rows("select id from public.replies"))).toEqual([]);
    expect((await one<{ n: number }>("select count(*)::int n from public.replies where thought_id = $1", [t.sam30])).n).toBe(1);
  });
  it("soft delete erases the words, keeps the row, hides replies", async () => {
    await asUser(db, SAM, () => db.query("update public.thoughts set deleted_at = now() where id = $1", [t.sam80]));
    const row = await one<{ body: string | null; deleted_at: string | null }>("select body, deleted_at from public.thoughts where id = $1", [t.sam80]);
    expect(row.body).toBeNull();
    expect(row.deleted_at).not.toBeNull();
    expect(await visibleThoughts(DEV)).not.toContain(t.sam80);
    expect(await asUser(db, DEV, () => rows("select id from public.replies where thought_id = $1", [t.sam80]))).toEqual([]);
  });
});

describe("replies: soft delete by the author", () => {
  it("an author can delete their own reply; it disappears for others but the row stays", async () => {
    const r = await asUser(db, DEV, () => one<{ id: string }>("insert into public.replies (thought_id, body) values ($1, 'Oops') returning id", [t.maya156]));
    await asUser(db, DEV, () => db.query("update public.replies set deleted_at = now() where id = $1", [r.id]));
    expect(await asUser(db, SAM, () => rows("select id from public.replies where id = $1", [r.id]))).toEqual([]);
    expect((await one<{ body: string | null }>("select body from public.replies where id = $1", [r.id])).body).toBeNull();
  });
});

describe("writes users must not make", () => {
  it("users can't edit cached works or read reports", async () => {
    await expect(asUser(db, MAYA, () => db.query("update public.works set title = 'x'"))).rejects.toThrow(/permission denied/);
    await asUser(db, MAYA, () => db.query("insert into public.reports (target_type, target_id) values ('thought', $1)", [t.sam30]));
    await expect(asUser(db, MAYA, () => db.query("select * from public.reports"))).rejects.toThrow(/permission denied/);
  });
  it("users can't read each other's library or reflection history", async () => {
    expect(await asUser(db, MAYA, () => rows("select id from public.user_books where user_id <> $1", [MAYA]))).toEqual([]);
  });
});

describe("explicit grants (explicit_grants migration)", () => {
  it("no API role can TRUNCATE app tables, and readers can't insert/delete profiles directly", async () => {
    const r = await one<{ trunc: boolean; prof_ins: boolean; svc_works: boolean; svc_thoughts_write: boolean }>(
      `select has_table_privilege('authenticated','public.thoughts','TRUNCATE') trunc,
              has_table_privilege('authenticated','public.profiles','INSERT') prof_ins,
              has_table_privilege('service_role','public.works','INSERT') svc_works,
              has_table_privilege('service_role','public.thoughts','UPDATE') svc_thoughts_write`);
    expect(r).toEqual({ trunc: false, prof_ins: false, svc_works: true, svc_thoughts_write: false });
  });
  it("signed-out visitors can't execute app functions (function_privileges migration)", async () => {
    const r = await one<{ anon_log: boolean; anon_gate: boolean; auth_log: boolean }>(
      `select has_function_privilege('anon','public.log_progress(uuid, public.position_unit, numeric, int)','EXECUTE') anon_log,
              has_function_privilege('anon','public.can_see_position(uuid, numeric)','EXECUTE') anon_gate,
              has_function_privilege('authenticated','public.log_progress(uuid, public.position_unit, numeric, int)','EXECUTE') auth_log`);
    expect(r).toEqual({ anon_log: false, anon_gate: false, auth_log: true });
  });
});

describe("account deletion (D60)", () => {
  it("removes the user's content and tombstones their Thoughts; others' replies stay stored but hidden", async () => {
    await asUser(db, DEV, () => db.query("insert into public.replies (thought_id, body) values ($1, 'Reply to Maya')", [t.maya156]));
    await asUser(db, MAYA, () => db.query("select public.delete_my_account()"));
    const mayaThoughts = await rows<{ user_id: string | null; body: string | null; deleted_at: string | null }>(
      "select user_id, body, deleted_at from public.thoughts where id = any($1)", [[t.maya84, t.maya156, t.maya238]]);
    expect(mayaThoughts).toHaveLength(3);
    for (const m of mayaThoughts) { expect(m.user_id).toBeNull(); expect(m.body).toBeNull(); expect(m.deleted_at).not.toBeNull(); }
    expect((await one<{ n: number }>("select count(*)::int n from public.user_books where user_id = $1", [MAYA])).n).toBe(0);
    expect((await one<{ n: number }>("select count(*)::int n from auth.users where id = $1", [MAYA])).n).toBe(0);
    expect((await one<{ n: number }>("select count(*)::int n from public.replies where thought_id = $1 and body is not null", [t.maya156])).n).toBe(1);
    expect(await asUser(db, DEV, () => rows("select id from public.replies where thought_id = $1 and deleted_at is null", [t.maya156]))).toEqual([]);
    expect((await one<{ n: number }>("select count(*)::int n from public.reports where reporter_id is null")).n).toBe(1);
  });
});
