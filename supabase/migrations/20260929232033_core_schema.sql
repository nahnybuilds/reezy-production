-- Reezy V1 · core schema (D63: 9 tables, editions deferred)
-- Tables: profiles, works, user_books, check_ins, thoughts, reflection_events, replies, likes, reports
-- Authority rule (D63): user_books.copy_page_count + position_pct are authoritative for progress
-- and spoiler visibility. works.page_count_median is metadata / seed only.

-- ---------- enums ----------
create type public.book_status as enum ('want_to_read', 'reading', 'finished');
create type public.position_unit as enum ('page', 'percent');
create type public.thought_privacy as enum ('private', 'shared');
create type public.reflection_outcome as enum ('shown', 'responded', 'skipped', 'new_instead');
create type public.report_target as enum ('thought', 'reply');
create type public.report_status as enum ('open', 'reviewed', 'actioned', 'dismissed');

-- ---------- profiles ----------
-- One row per auth user. display_name is null until needed (D41).
create table public.profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  display_name  text check (display_name is null or char_length(btrim(display_name)) between 1 and 40),
  avatar_url    text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ---------- works ----------
-- A book as a work (all editions share one conversation, D14). Cached from Open Library.
-- Written only by server code with the service role (no user write policies).
create table public.works (
  id                 uuid primary key default gen_random_uuid(),
  ol_work_key        text not null unique check (ol_work_key ~ '^OL[0-9]+W$'),
  title              text not null check (char_length(title) between 1 and 500),
  authors            text[] not null default '{}',
  first_publish_year int,
  description        text,
  cover_id           bigint,
  page_count_median  int check (page_count_median is null or page_count_median > 0), -- metadata / seed only (D63)
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

-- ---------- user_books ----------
-- One reader's relationship with one work. Holds the edition data V1 needs (D63).
create table public.user_books (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  work_id           uuid not null references public.works (id) on delete restrict,
  ol_edition_key    text check (ol_edition_key is null or ol_edition_key ~ '^OL[0-9]+M$'),
  isbn_13           text check (isbn_13 is null or isbn_13 ~ '^[0-9]{13}$'),
  status            public.book_status not null,
  copy_page_count   int check (copy_page_count is null or copy_page_count between 1 and 20000), -- authoritative (D63)
  position_pct      numeric(5,2) not null default 0 check (position_pct between 0 and 100),       -- authoritative (D63)
  position_page     int check (position_page is null or position_page >= 0),
  position_unit     public.position_unit not null default 'page',
  started_at        timestamptz,
  finished_at       timestamptz,
  last_check_in_at  timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  unique (user_id, work_id),
  check (position_page is null or copy_page_count is null or position_page <= copy_page_count)
);
create index user_books_user_reading_idx on public.user_books (user_id, status, last_check_in_at desc);
create index user_books_work_idx on public.user_books (work_id);

-- ---------- check_ins ----------
-- Append-only progress history ("Last time p. 61 · 3 days ago", journey dates).
create table public.check_ins (
  id             uuid primary key default gen_random_uuid(),
  user_book_id   uuid not null references public.user_books (id) on delete cascade,
  user_id        uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  position_pct   numeric(5,2) not null check (position_pct between 0 and 100),
  position_page  int check (position_page is null or position_page >= 0),
  position_unit  public.position_unit not null,
  created_at     timestamptz not null default now()
);
create index check_ins_user_book_idx on public.check_ins (user_book_id, created_at desc);

-- ---------- thoughts ----------
-- The core object: Thoughts, reflection responses (parent_thought_id) and final reflections (is_final).
-- Position is copied from the reader's user_book at insert time and is immutable (D32).
-- Deletion is soft; deleted Thoughts keep their row so chains and other readers' replies stay intact.
create table public.thoughts (
  id                      uuid primary key default gen_random_uuid(),
  user_id                 uuid default auth.uid() references public.profiles (id) on delete set null, -- null only for tombstones (D60)
  work_id                 uuid not null references public.works (id) on delete restrict,
  user_book_id            uuid references public.user_books (id) on delete set null,
  body                    text check (body is null or char_length(btrim(body)) between 1 and 4000),
  position_pct            numeric(5,2) not null check (position_pct between 0 and 100),
  position_page           int check (position_page is null or position_page >= 0),
  position_unit           public.position_unit not null,
  privacy                 public.thought_privacy not null default 'private', -- D42
  parent_thought_id       uuid references public.thoughts (id) on delete restrict, -- then → now (D17)
  chain_root_id           uuid references public.thoughts (id) on delete restrict, -- groups a chain; = id for a root
  is_final                boolean not null default false,                          -- final reflection at 100% (D28)
  author_seen_replies_at  timestamptz not null default now(),                      -- in-app reply notices (D19)
  created_at              timestamptz not null default now(),
  edited_at               timestamptz,
  deleted_at              timestamptz,
  check (deleted_at is not null or body is not null),
  check (parent_thought_id is null or parent_thought_id <> id)
);
create index thoughts_work_visible_idx on public.thoughts (work_id, position_pct) where privacy = 'shared' and deleted_at is null;
create index thoughts_user_work_idx on public.thoughts (user_id, work_id, created_at desc);
create index thoughts_chain_idx on public.thoughts (chain_root_id);
create index thoughts_parent_idx on public.thoughts (parent_thought_id);

-- ---------- reflection_events ----------
-- Each resurfacing and its outcome: skip limit (D30), chain continuation (D31), waiting card (D37).
create table public.reflection_events (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  user_book_id         uuid not null references public.user_books (id) on delete cascade,
  thought_id           uuid not null references public.thoughts (id) on delete cascade,  -- "then"
  shown_at_pct         numeric(5,2) not null check (shown_at_pct between 0 and 100),
  outcome              public.reflection_outcome not null default 'shown',
  response_thought_id  uuid references public.thoughts (id) on delete set null,          -- "now"
  created_at           timestamptz not null default now(),
  resolved_at          timestamptz,
  check (outcome <> 'responded' or response_thought_id is not null)
);
create index reflection_events_thought_idx on public.reflection_events (thought_id, created_at desc);
create index reflection_events_pending_idx on public.reflection_events (user_id, user_book_id) where outcome = 'shown';

-- ---------- replies ----------
-- No position of their own: they inherit the parent Thought's position (D26).
create table public.replies (
  id          uuid primary key default gen_random_uuid(),
  thought_id  uuid not null references public.thoughts (id) on delete restrict,
  user_id     uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  body        text check (body is null or char_length(btrim(body)) between 1 and 2000),
  created_at  timestamptz not null default now(),
  edited_at   timestamptz,
  deleted_at  timestamptz,
  check (deleted_at is not null or body is not null)
);
create index replies_thought_idx on public.replies (thought_id, created_at);

-- ---------- likes ----------
create table public.likes (
  user_id     uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  thought_id  uuid not null references public.thoughts (id) on delete restrict,
  created_at  timestamptz not null default now(),
  primary key (user_id, thought_id)
);
create index likes_thought_idx on public.likes (thought_id);

-- ---------- reports ----------
-- Insert-only for users; reviewed manually by the founder in the dashboard (D33).
create table public.reports (
  id           uuid primary key default gen_random_uuid(),
  reporter_id  uuid default auth.uid() references public.profiles (id) on delete set null,
  target_type  public.report_target not null,
  target_id    uuid not null,
  reason       text check (reason is null or char_length(reason) <= 1000),
  status       public.report_status not null default 'open',
  created_at   timestamptz not null default now()
);
create index reports_status_idx on public.reports (status, created_at);
