-- Reezy V1 · explicit, least-privilege grants
-- The hosted project was created with automatic table exposure disabled: new tables give the API
-- roles only TRUNCATE/REFERENCES/TRIGGER and no read/write. Rather than exposing anything broadly,
-- grant exactly what the approved architecture needs, table by table, and keep future tables private.

-- 1) Never let API roles TRUNCATE (bypasses RLS), add FK references or triggers on app tables.
revoke truncate, references, trigger on
  public.profiles, public.works, public.user_books, public.check_ins, public.thoughts,
  public.reflection_events, public.replies, public.likes, public.reports
  from anon, authenticated, service_role;

-- 2) Readers (authenticated): least privilege on top of migration 000300. RLS still decides rows.
revoke insert, delete on public.profiles from authenticated;      -- created by trigger; removed by delete_my_account()
revoke delete on public.reflection_events from authenticated;     -- history is resolved, not deleted

-- 3) Server-only secret key (service_role, bypasses RLS). Used only for trusted server jobs:
--    caching Open Library works, and account-deletion housekeeping (IMPLEMENTATION.md §5).
grant select, insert, update on public.works to service_role;
grant select on
  public.profiles, public.user_books, public.check_ins, public.thoughts,
  public.reflection_events, public.replies, public.likes, public.reports
  to service_role;
grant update (status) on public.reports to service_role;          -- founder moderation status only

-- 4) Future tables in public stay private until a migration grants them deliberately.
alter default privileges for role postgres in schema public revoke all on tables from anon, authenticated, service_role;
alter default privileges for role postgres in schema public revoke all on sequences from anon, authenticated, service_role;
alter default privileges for role postgres in schema public revoke execute on functions from public, anon, authenticated, service_role;
