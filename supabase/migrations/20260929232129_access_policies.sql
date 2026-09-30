-- Reezy V1 · Row Level Security: privacy and spoiler rules enforced in the database
-- Visibility (D15): Want to Read / not in library → no Thoughts; Reading → shared Thoughts at or
-- behind the viewer's normalized position; Finished → all shared. Replies/likes inherit their
-- Thought's visibility (D26). Unshared/deleted Thoughts hide their replies and likes (D32).
-- Comparisons use normalized position_pct only, never raw page numbers (D63).

-- ---------- grants ----------
revoke all on all tables in schema public from anon;
grant usage on schema public to authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
revoke insert, update, delete on public.works from authenticated;       -- works are written by the server (service role)
revoke update, delete on public.check_ins from authenticated;           -- append-only
revoke delete on public.thoughts, public.replies from authenticated;    -- soft delete only
revoke select, update, delete on public.reports from authenticated;     -- insert-only

alter table public.profiles          enable row level security;
alter table public.works             enable row level security;
alter table public.user_books        enable row level security;
alter table public.check_ins         enable row level security;
alter table public.thoughts          enable row level security;
alter table public.reflection_events enable row level security;
alter table public.replies           enable row level security;
alter table public.likes             enable row level security;
alter table public.reports           enable row level security;

-- ---------- spoiler gate ----------
-- True when the current viewer may see shared content anchored at p_pct in p_work.
create or replace function public.can_see_position(p_work uuid, p_pct numeric) returns boolean
language sql stable security invoker set search_path = '' as $$
  select exists (
    select 1 from public.user_books ub
     where ub.user_id = auth.uid()
       and ub.work_id = p_work
       and (ub.status = 'finished' or (ub.status = 'reading' and ub.position_pct >= p_pct))
  );
$$;

-- ---------- profiles ----------
create policy profiles_read on public.profiles for select to authenticated using (true); -- names/avatars for signatures
create policy profiles_update_own on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- ---------- works ----------
create policy works_read on public.works for select to authenticated using (true);

-- ---------- user_books (private to the reader) ----------
create policy user_books_own on public.user_books for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---------- check_ins ----------
create policy check_ins_read_own on public.check_ins for select to authenticated using (user_id = auth.uid());
create policy check_ins_insert_own on public.check_ins for insert to authenticated
  with check (user_id = auth.uid() and exists (select 1 from public.user_books ub where ub.id = user_book_id and ub.user_id = auth.uid()));

-- ---------- thoughts ----------
-- Owners can read their own rows, including soft-deleted ones (already stripped of text), so a
-- soft delete passes RLS. The app filters deleted_at is null when displaying.
create policy thoughts_read_own on public.thoughts for select to authenticated
  using (user_id = auth.uid());
create policy thoughts_read_shared on public.thoughts for select to authenticated
  using (privacy = 'shared' and deleted_at is null and public.can_see_position(work_id, position_pct));
create policy thoughts_insert_own on public.thoughts for insert to authenticated
  with check (user_id = auth.uid());
create policy thoughts_update_own on public.thoughts for update to authenticated
  using (user_id = auth.uid() and deleted_at is null) with check (user_id = auth.uid());
-- Note: a shared reflection's parent_thought_id is just an id. Its content is only readable if the
-- parent itself passes these policies, so a private parent is never exposed (D29).

-- ---------- reflection_events (private to the reader) ----------
create policy reflection_events_own on public.reflection_events for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid() and exists (select 1 from public.thoughts t where t.id = thought_id and t.user_id = auth.uid()));

-- ---------- replies ----------
-- Visible only while the parent Thought is shared, not deleted, and visible to the viewer.
create policy replies_read on public.replies for select to authenticated
  using (deleted_at is null and exists (
    select 1 from public.thoughts t where t.id = thought_id and t.privacy = 'shared' and t.deleted_at is null));
-- Authors see their own soft-deleted replies (text already erased) so a soft delete passes RLS;
-- their live replies follow the same parent-visibility rule as everyone else's.
create policy replies_read_own on public.replies for select to authenticated
  using (user_id = auth.uid() and (deleted_at is not null or exists (
    select 1 from public.thoughts t where t.id = thought_id and t.privacy = 'shared' and t.deleted_at is null)));
create policy replies_insert on public.replies for insert to authenticated
  with check (user_id = auth.uid() and exists (
    select 1 from public.thoughts t where t.id = thought_id and t.privacy = 'shared' and t.deleted_at is null));
create policy replies_update_own on public.replies for update to authenticated
  using (user_id = auth.uid() and deleted_at is null) with check (user_id = auth.uid());

-- ---------- likes ----------
create policy likes_read on public.likes for select to authenticated
  using (exists (select 1 from public.thoughts t where t.id = thought_id and t.privacy = 'shared' and t.deleted_at is null));
create policy likes_insert on public.likes for insert to authenticated
  with check (user_id = auth.uid() and exists (
    select 1 from public.thoughts t where t.id = thought_id and t.privacy = 'shared' and t.deleted_at is null));
create policy likes_delete_own on public.likes for delete to authenticated using (user_id = auth.uid());

-- ---------- reports (insert-only) ----------
create policy reports_insert on public.reports for insert to authenticated with check (reporter_id = auth.uid());

-- ---------- counts without content (D45, D55) ----------
-- Return numbers only: no ids, no positions, no text.
create or replace function public.readers_talking(p_work uuid) returns int
language sql stable security definer set search_path = '' as $$
  select count(distinct t.user_id)::int from public.thoughts t
   where t.work_id = p_work and t.privacy = 'shared' and t.deleted_at is null and t.user_id is not null;
$$;

create or replace function public.thoughts_ahead(p_work uuid) returns int
language sql stable security definer set search_path = '' as $$
  select case
    when ub.status = 'finished' then 0
    else (select count(*)::int from public.thoughts t
           where t.work_id = p_work and t.privacy = 'shared' and t.deleted_at is null
             and (ub.status is distinct from 'reading' or t.position_pct > ub.position_pct))
  end
  from (select (select status from public.user_books where user_id = auth.uid() and work_id = p_work) as status,
               (select position_pct from public.user_books where user_id = auth.uid() and work_id = p_work) as position_pct) ub;
$$;

revoke execute on function public.readers_talking(uuid), public.thoughts_ahead(uuid), public.delete_my_account() from public, anon;
grant execute on function public.readers_talking(uuid), public.thoughts_ahead(uuid), public.delete_my_account(),
  public.log_progress(uuid, public.position_unit, numeric, int), public.can_see_position(uuid, numeric) to authenticated;
