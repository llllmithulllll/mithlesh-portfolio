-- Portfolio content backend. Replace the UUID below with your Supabase Auth user ID
-- before running this in the Supabase SQL Editor.
create table if not exists public.portfolio_content (
  id boolean primary key default true check (id),
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.portfolio_projects (
  id text primary key,
  data jsonb not null,
  sort_order integer not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.portfolio_content enable row level security;
alter table public.portfolio_projects enable row level security;
revoke all on public.portfolio_content from anon, authenticated;
revoke all on public.portfolio_projects from anon, authenticated;
grant select on public.portfolio_content to anon, authenticated;
grant select on public.portfolio_projects to anon, authenticated;
grant insert, update, delete on public.portfolio_content to authenticated;
grant insert, update, delete on public.portfolio_projects to authenticated;

create policy "Portfolio is public to read" on public.portfolio_content
  for select to anon, authenticated using (true);
create policy "Only the site owner can insert content" on public.portfolio_content
  for insert to authenticated with check ((select auth.uid()) = 'REPLACE_WITH_ADMIN_USER_UUID'::uuid);
create policy "Only the site owner can update content" on public.portfolio_content
  for update to authenticated using ((select auth.uid()) = 'REPLACE_WITH_ADMIN_USER_UUID'::uuid)
  with check ((select auth.uid()) = 'REPLACE_WITH_ADMIN_USER_UUID'::uuid);
create policy "Only the site owner can delete content" on public.portfolio_content
  for delete to authenticated using ((select auth.uid()) = 'REPLACE_WITH_ADMIN_USER_UUID'::uuid);

create policy "Projects are public to read" on public.portfolio_projects
  for select to anon, authenticated using (true);
create policy "Only the site owner can insert projects" on public.portfolio_projects
  for insert to authenticated with check ((select auth.uid()) = 'REPLACE_WITH_ADMIN_USER_UUID'::uuid);
create policy "Only the site owner can update projects" on public.portfolio_projects
  for update to authenticated using ((select auth.uid()) = 'REPLACE_WITH_ADMIN_USER_UUID'::uuid)
  with check ((select auth.uid()) = 'REPLACE_WITH_ADMIN_USER_UUID'::uuid);
create policy "Only the site owner can delete projects" on public.portfolio_projects
  for delete to authenticated using ((select auth.uid()) = 'REPLACE_WITH_ADMIN_USER_UUID'::uuid);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('portfolio-assets', 'portfolio-assets', true, 5242880, array['image/jpeg','image/png','image/webp','application/pdf'])
on conflict (id) do nothing;

create policy "Public portfolio assets are readable" on storage.objects
  for select to anon, authenticated using (bucket_id = 'portfolio-assets');
create policy "Only site owner can upload portfolio assets" on storage.objects
  for insert to authenticated with check (bucket_id = 'portfolio-assets' and (select auth.uid()) = 'REPLACE_WITH_ADMIN_USER_UUID'::uuid);
create policy "Only site owner can update portfolio assets" on storage.objects
  for update to authenticated using (bucket_id = 'portfolio-assets' and (select auth.uid()) = 'REPLACE_WITH_ADMIN_USER_UUID'::uuid)
  with check (bucket_id = 'portfolio-assets' and (select auth.uid()) = 'REPLACE_WITH_ADMIN_USER_UUID'::uuid);
create policy "Only site owner can delete portfolio assets" on storage.objects
  for delete to authenticated using (bucket_id = 'portfolio-assets' and (select auth.uid()) = 'REPLACE_WITH_ADMIN_USER_UUID'::uuid);
