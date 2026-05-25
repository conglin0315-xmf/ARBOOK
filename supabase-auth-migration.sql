alter table child_profiles add column if not exists user_id uuid references auth.users(id) on delete cascade default auth.uid();
alter table books add column if not exists user_id uuid references auth.users(id) on delete cascade default auth.uid();
alter table reading_logs add column if not exists user_id uuid references auth.users(id) on delete cascade default auth.uid();

create or replace function public.claim_unowned_reading_tracker_data()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid;
begin
  current_user_id := auth.uid();

  if current_user_id is null then
    raise exception 'Must be signed in to claim data.';
  end if;

  update child_profiles
    set user_id = current_user_id
    where user_id is null;

  update books
    set user_id = current_user_id
    where user_id is null;

  update reading_logs
    set user_id = current_user_id
    where user_id is null;
end;
$$;

grant execute on function public.claim_unowned_reading_tracker_data() to authenticated;

alter table child_profiles enable row level security;
alter table books enable row level security;
alter table reading_logs enable row level security;

drop policy if exists "Users can read own child profiles" on child_profiles;
drop policy if exists "Users can insert own child profiles" on child_profiles;
drop policy if exists "Users can update own child profiles" on child_profiles;
drop policy if exists "Users can delete own child profiles" on child_profiles;

create policy "Users can read own child profiles"
  on child_profiles for select
  using (user_id = auth.uid());

create policy "Users can insert own child profiles"
  on child_profiles for insert
  with check (user_id = auth.uid());

create policy "Users can update own child profiles"
  on child_profiles for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Users can delete own child profiles"
  on child_profiles for delete
  using (user_id = auth.uid());

drop policy if exists "Users can read own books" on books;
drop policy if exists "Users can insert own books" on books;
drop policy if exists "Users can update own books" on books;
drop policy if exists "Users can delete own books" on books;

create policy "Users can read own books"
  on books for select
  using (user_id = auth.uid());

create policy "Users can insert own books"
  on books for insert
  with check (user_id = auth.uid());

create policy "Users can update own books"
  on books for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Users can delete own books"
  on books for delete
  using (user_id = auth.uid());

drop policy if exists "Users can read own reading logs" on reading_logs;
drop policy if exists "Users can insert own reading logs" on reading_logs;
drop policy if exists "Users can update own reading logs" on reading_logs;
drop policy if exists "Users can delete own reading logs" on reading_logs;

create policy "Users can read own reading logs"
  on reading_logs for select
  using (user_id = auth.uid());

create policy "Users can insert own reading logs"
  on reading_logs for insert
  with check (user_id = auth.uid());

create policy "Users can update own reading logs"
  on reading_logs for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Users can delete own reading logs"
  on reading_logs for delete
  using (user_id = auth.uid());
