-- Reezy V1 · function execute privileges (least privilege)
-- Postgres grants EXECUTE on new functions to PUBLIC. Remove that and grant only what the app needs.

-- Callable by signed-in readers only.
revoke execute on function public.log_progress(uuid, public.position_unit, numeric, int) from public, anon;
revoke execute on function public.can_see_position(uuid, numeric) from public, anon;
grant execute on function public.log_progress(uuid, public.position_unit, numeric, int) to authenticated;
grant execute on function public.can_see_position(uuid, numeric) to authenticated; -- used inside RLS policies

-- Trigger functions are never called directly by clients.
revoke execute on function
  public.touch_updated_at(), public.handle_new_user(), public.user_books_status(),
  public.thoughts_before_insert(), public.thoughts_before_update(), public.replies_before_update()
  from public, anon, authenticated, service_role;
