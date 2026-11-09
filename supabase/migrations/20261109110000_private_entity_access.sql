begin;

alter table public.entities enable row level security;
alter table public.profiles enable row level security;

do $$
declare
  existing_policy record;
begin
  for existing_policy in
    select tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in ('entities', 'profiles')
  loop
    execute format(
      'drop policy if exists %I on public.%I',
      existing_policy.policyname,
      existing_policy.tablename
    );
  end loop;
end
$$;

revoke all on table public.entities from public, anon, authenticated;
grant select, insert on table public.entities to authenticated;

create policy "Admins can read their own entities"
  on public.entities
  for select
  to authenticated
  using (
    owner_id = (select auth.uid())
    and exists (
      select 1
      from public.profiles
      where profiles.id = (select auth.uid())
        and profiles.is_admin = true
    )
  );

create policy "Admins can create entities"
  on public.entities
  for insert
  to authenticated
  with check (
    owner_id = (select auth.uid())
    and exists (
      select 1
      from public.profiles
      where profiles.id = (select auth.uid())
        and profiles.is_admin = true
    )
  );

revoke all on table public.profiles from public, anon, authenticated;
grant select on table public.profiles to authenticated;
grant insert (id, username, avatar_url, data) on table public.profiles to authenticated;
grant update (id, username, avatar_url, data) on table public.profiles to authenticated;

create policy "Users can read their own profile"
  on public.profiles
  for select
  to authenticated
  using (id = (select auth.uid()));

create policy "Users can create their own profile"
  on public.profiles
  for insert
  to authenticated
  with check (id = (select auth.uid()));

create policy "Users can update their own profile"
  on public.profiles
  for update
  to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

commit;
