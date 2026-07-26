-- ═══════════════════════════════════════════════════════════════════════════
-- Teach AI for India — 0047 Create blogs table & drop announcements
--
-- Replaces the Announcements module with the Blog Writing System.
-- Defines the blogs table, status workflow enum, RLS access, and storage policies.
-- ═══════════════════════════════════════════════════════════════════════════

-- 1. Drop Announcements table
drop table if exists public.announcements cascade;

-- 2. Create blog status enum type
do $$
begin
  if not exists (select 1 from pg_type where typname = 'blog_status') then
    create type blog_status as enum ('draft', 'submitted', 'in_review', 'approved', 'published', 'rejected');
  end if;
end;
$$;

-- 3. Create blogs table
create table public.blogs (
  id                    uuid primary key default gen_random_uuid(),
  title                 text not null,
  slug                  text not null unique,
  summary               text not null,
  content               text not null,
  cover_image           text,
  category              text not null,
  campus_id             uuid references public.campuses(id) on delete set null,
  author_id             uuid not null references public.users(id) on delete cascade,
  tags                  text[] not null default '{}',
  reading_time_minutes  integer not null default 1,
  featured              boolean not null default false,
  
  -- SEO Metadata
  seo_title             text,
  meta_description      text,
  keywords              text[] not null default '{}',
  og_image              text,
  canonical_url         text,
  
  status                blog_status not null default 'draft'::blog_status,
  rejected_reason       text,
  
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  published_at          timestamptz
);

comment on table public.blogs is 'Articles, school visits, and stories authored by campus teams, reviewed and published by admins.';

-- 4. Set up touch trigger for updated_at
create trigger trg_blogs_updated
  before update on public.blogs for each row execute function public.touch_updated_at();

-- 5. Set up indexes
create index blogs_campus_idx on public.blogs (campus_id);
create index blogs_author_idx on public.blogs (author_id);
create index blogs_status_idx on public.blogs (status);

-- 6. Enable Row Level Security (RLS)
alter table public.blogs enable row level security;

-- 7. Define RLS Policies
-- SELECT: published to everyone; drafts to author & admin; submitted/in_review/approved to campus members & admin
create policy blogs_select on public.blogs for select to anon, authenticated
  using (
    status = 'published'
    or (
      auth.role() = 'authenticated'
      and (
        is_admin()
        or author_id = auth.uid()
        or (campus_id = auth_campus() and status in ('submitted'::blog_status, 'in_review'::blog_status, 'approved'::blog_status))
      )
    )
  );

-- INSERT: authenticated team members can insert their own drafts scoped to their own campus
create policy blogs_insert on public.blogs for insert to authenticated
  with check (
    (is_admin() or (author_id = auth.uid() and (campus_id is null or campus_id = auth_campus())))
    and status = 'draft'::blog_status
  );

-- UPDATE: author can edit drafts / rejected; admin can edit everything
create policy blogs_update on public.blogs for update to authenticated
  using (
    is_admin()
    or (author_id = auth.uid() and status in ('draft'::blog_status, 'rejected'::blog_status))
  )
  with check (
    is_admin()
    or (
      author_id = auth.uid()
      and status in ('draft'::blog_status, 'submitted'::blog_status)
    )
  );

-- DELETE: author can delete drafts / rejected; admin can delete everything
create policy blogs_delete on public.blogs for delete to authenticated
  using (
    is_admin()
    or (author_id = auth.uid() and status in ('draft'::blog_status, 'rejected'::blog_status))
  );

-- 8. Storage Policy update
-- Allow any authenticated user to write files to public-assets (so drafts can upload cover images/embedded media)
create policy "blog write" on storage.objects for insert to authenticated
  with check ( bucket_id = 'public-assets' );
