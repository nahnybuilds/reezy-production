-- Reezy V1 · rules enforced in the database
-- Profile creation, status-follows-progress (D27), progress normalization (D12, D24, D25, D63),
-- Thought position authority + immutability (D32), chains (D17, D31), soft delete, account deletion (D60).

-- ---------- helpers ----------
create or replace function public.touch_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end $$;

create trigger profiles_touch before update on public.profiles for each row execute function public.touch_updated_at();
create trigger works_touch before update on public.works for each row execute function public.touch_updated_at();

-- ---------- profiles: created on sign-up ----------
-- Google supplies a name, so most readers are never asked (D41). Email sign-ups start with no name.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    nullif(btrim(left(coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', ''), 40)), ''),
    nullif(new.raw_user_meta_data ->> 'avatar_url', '')
  );
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();

-- ---------- user_books: status follows progress (D27) ----------
create or replace function public.user_books_status() returns trigger
language plpgsql set search_path = '' as $$
begin
  if new.position_pct >= 100 then
    new.position_pct := 100;
    new.status := 'finished';
    new.finished_at := coalesce(new.finished_at, now());
  elsif tg_op = 'UPDATE' and old.status = 'finished' and new.position_pct < 100 then
    new.status := 'reading';
    new.finished_at := null;
  end if;
  if new.status in ('reading', 'finished') and new.started_at is null then
    new.started_at := now();
  end if;
  new.updated_at := now();
  return new;
end $$;

create trigger user_books_status before insert or update on public.user_books
for each row execute function public.user_books_status();

-- ---------- log_progress: the only way progress changes ----------
-- Normalizes against the reader's own copy page count (authoritative, D63), records a check-in,
-- and lets the status trigger move the book between Reading and Finished.
create or replace function public.log_progress(
  p_user_book_id uuid,
  p_unit public.position_unit,
  p_value numeric,
  p_copy_page_count int default null
) returns public.user_books
language plpgsql security invoker set search_path = '' as $$
declare
  ub public.user_books;
  pct numeric(5,2);
  pages int;
begin
  select * into ub from public.user_books where id = p_user_book_id and user_id = auth.uid() for update;
  if not found then
    raise exception 'user_book_not_found' using errcode = 'P0002';
  end if;
  if p_value is null or p_value < 0 then
    raise exception 'invalid_position' using errcode = '22023';
  end if;

  pages := coalesce(p_copy_page_count, ub.copy_page_count);

  if p_unit = 'page' then
    if pages is null then
      raise exception 'copy_page_count_required' using errcode = '22023'; -- UI asks "How many pages is your copy?" (D24)
    end if;
    if p_value > pages then
      raise exception 'page_beyond_copy' using errcode = '22023';
    end if;
    pct := round(least(100, p_value * 100.0 / pages), 2);
  else
    if p_value > 100 then
      raise exception 'invalid_position' using errcode = '22023';
    end if;
    pct := round(p_value, 2);
  end if;

  update public.user_books
     set position_pct = pct,
         position_page = case when p_unit = 'page' then p_value::int else null end,
         position_unit = p_unit,
         copy_page_count = pages,
         status = case when status = 'want_to_read' then 'reading'::public.book_status else status end,
         last_check_in_at = now()
   where id = ub.id
   returning * into ub;

  insert into public.check_ins (user_book_id, user_id, position_pct, position_page, position_unit)
  values (ub.id, ub.user_id, ub.position_pct, ub.position_page, ub.position_unit);

  return ub;
end $$;

-- ---------- thoughts: position authority, chains, immutability ----------
create or replace function public.thoughts_before_insert() returns trigger
language plpgsql set search_path = '' as $$
declare
  ub public.user_books;
  parent public.thoughts;
begin
  select * into ub from public.user_books where id = new.user_book_id;
  if not found or ub.user_id is distinct from new.user_id or ub.work_id <> new.work_id then
    raise exception 'thought_requires_own_user_book' using errcode = '42501';
  end if;
  if ub.status = 'want_to_read' then
    raise exception 'thought_requires_reading_or_finished' using errcode = '22023';
  end if;

  -- Position always comes from the reader's current place; clients can't choose it (spoiler safety).
  new.position_pct  := case when new.is_final then 100 else ub.position_pct end;
  new.position_page := case when new.is_final then ub.copy_page_count else ub.position_page end;
  new.position_unit := ub.position_unit;
  new.deleted_at := null;
  new.edited_at := null;

  if new.parent_thought_id is not null then
    select * into parent from public.thoughts where id = new.parent_thought_id;
    if not found or parent.user_id is distinct from new.user_id or parent.work_id <> new.work_id then
      raise exception 'parent_must_be_own_thought_in_same_book' using errcode = '42501';
    end if;
    new.chain_root_id := coalesce(parent.chain_root_id, parent.id);
  else
    new.chain_root_id := new.id;
  end if;
  return new;
end $$;

create trigger thoughts_before_insert before insert on public.thoughts
for each row execute function public.thoughts_before_insert();

create or replace function public.thoughts_before_update() returns trigger
language plpgsql set search_path = '' as $$
begin
  if new.position_pct is distinct from old.position_pct
     or new.position_page is distinct from old.position_page
     or new.position_unit is distinct from old.position_unit
     or new.work_id is distinct from old.work_id
     or new.user_book_id is distinct from old.user_book_id and new.user_book_id is not null
     or new.parent_thought_id is distinct from old.parent_thought_id
     or new.chain_root_id is distinct from old.chain_root_id
     or new.is_final is distinct from old.is_final
     or new.created_at is distinct from old.created_at then
    raise exception 'thought_position_and_chain_are_immutable' using errcode = '42501';
  end if;

  -- Author can only become null, and only as a tombstone (account deletion, D60 — including a
  -- profile removed directly, where the FK sets user_id to null).
  if new.user_id is distinct from old.user_id then
    if new.user_id is not null then
      raise exception 'thought_author_is_immutable' using errcode = '42501';
    end if;
    new.deleted_at := coalesce(new.deleted_at, now());
  end if;

  if old.deleted_at is not null and new.deleted_at is null then
    raise exception 'thought_cannot_be_undeleted' using errcode = '42501';
  end if;

  if new.deleted_at is not null then
    new.body := null;         -- the words leave; the row stays so chains and others' replies aren't corrupted
    new.privacy := 'private';
  elsif new.body is distinct from old.body then
    new.edited_at := now();
  end if;
  return new;
end $$;

create trigger thoughts_before_update before update on public.thoughts
for each row execute function public.thoughts_before_update();

-- ---------- replies: soft delete ----------
create or replace function public.replies_before_update() returns trigger
language plpgsql set search_path = '' as $$
begin
  if new.thought_id is distinct from old.thought_id or new.user_id is distinct from old.user_id or new.created_at is distinct from old.created_at then
    raise exception 'reply_is_immutable' using errcode = '42501';
  end if;
  if new.deleted_at is not null then
    new.body := null;
  elsif new.body is distinct from old.body then
    new.edited_at := now();
  end if;
  return new;
end $$;

create trigger replies_before_update before update on public.replies
for each row execute function public.replies_before_update();

-- ---------- account deletion (D60) ----------
-- Deletes the caller's own content. Their Thoughts become content-free tombstones only so other
-- readers' replies stay stored-but-hidden. Avatar file removal is done by the server action.
create or replace function public.delete_my_account() returns void
language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'not_authenticated' using errcode = '42501';
  end if;
  update public.thoughts set deleted_at = coalesce(deleted_at, now()), user_id = null where user_id = uid;
  delete from public.replies where user_id = uid;
  delete from public.likes where user_id = uid;
  delete from public.reflection_events where user_id = uid;
  update public.reports set reporter_id = null where reporter_id = uid;
  delete from public.user_books where user_id = uid;  -- cascades check_ins
  delete from public.profiles where id = uid;
  delete from auth.users where id = uid;
end $$;
