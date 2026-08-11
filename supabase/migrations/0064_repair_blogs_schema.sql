-- Migration: 0064_repair_blogs_schema.sql
-- Description: Bring public.blogs to the shape the application actually expects.
--
-- 0047_create_blogs_table is recorded in supabase_migrations.schema_migrations as
-- applied, but its effects are not present in the database. Observed live before
-- this migration:
--
--   blogs         -> id, title, body, status, campus_id, posted_by, created_at, updated_at
--   announcements -> still present (0047 was supposed to drop it)
--   blog_status   -> enum does not exist
--   policies      -> blogs_select / blogs_write / blogs_public_select, i.e. the
--                    pre-0047 set, not 0047's insert/update/delete trio
--
-- So the table carries the old announcements shape with a text `status`. Meanwhile
-- actions/blogs.ts writes slug, summary, content, cover_image, category, tags,
-- reading_time_minutes, author_id, seo_title, meta_description, keywords,
-- og_image, canonical_url — none of which exist — and reads author_id. Every
-- create/edit therefore failed with `column "slug" of relation "blogs" does not
-- exist`, and the table has never held a row.
--
-- blogs and announcements were both empty (0 rows) with no inbound foreign keys
-- when this was written, so recreating rather than patching column-by-column is
-- safe and leaves the stale policies behind with the old table. The resulting
-- schema is 0047's verbatim, which is what types/database.ts BlogRow describes.

-- ─── blog_status enum ────────────────────────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'blog_status') THEN
    CREATE TYPE blog_status AS ENUM
      ('draft', 'submitted', 'in_review', 'approved', 'published', 'rejected');
  END IF;
END;
$$;

-- ─── Retire announcements (0047 intent) ──────────────────────────────────────
DROP TABLE IF EXISTS public.announcements CASCADE;

-- ─── Rebuild blogs ───────────────────────────────────────────────────────────
DROP TABLE IF EXISTS public.blogs CASCADE;

CREATE TABLE public.blogs (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title                 text NOT NULL,
  slug                  text NOT NULL UNIQUE,
  summary               text NOT NULL,
  content               text NOT NULL,
  cover_image           text,
  category              text NOT NULL,
  campus_id             uuid REFERENCES public.campuses(id) ON DELETE SET NULL,
  author_id             uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  tags                  text[] NOT NULL DEFAULT '{}',
  reading_time_minutes  integer NOT NULL DEFAULT 1,
  featured              boolean NOT NULL DEFAULT false,

  -- SEO metadata
  seo_title             text,
  meta_description      text,
  keywords              text[] NOT NULL DEFAULT '{}',
  og_image              text,
  canonical_url         text,

  status                blog_status NOT NULL DEFAULT 'draft'::blog_status,
  rejected_reason       text,

  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now(),
  published_at          timestamptz
);

COMMENT ON TABLE public.blogs IS
  'Articles, school visits, and stories authored by campus teams, reviewed and published by admins.';

CREATE TRIGGER trg_blogs_updated
  BEFORE UPDATE ON public.blogs FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE INDEX blogs_campus_idx ON public.blogs (campus_id);
CREATE INDEX blogs_author_idx ON public.blogs (author_id);
CREATE INDEX blogs_status_idx ON public.blogs (status);

ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;

-- SELECT: published to everyone; drafts to author + admin; submitted/in_review/
-- approved additionally to the author's own campus.
CREATE POLICY blogs_select ON public.blogs FOR SELECT TO anon, authenticated
  USING (
    status = 'published'::blog_status
    OR (
      auth.role() = 'authenticated'
      AND (
        is_admin()
        OR author_id = auth.uid()
        OR (campus_id = auth_campus()
            AND status IN ('submitted'::blog_status, 'in_review'::blog_status, 'approved'::blog_status))
      )
    )
  );

-- INSERT: a team member may create their own draft, in their own campus.
CREATE POLICY blogs_insert ON public.blogs FOR INSERT TO authenticated
  WITH CHECK (
    (is_admin() OR (author_id = auth.uid() AND (campus_id IS NULL OR campus_id = auth_campus())))
    AND status = 'draft'::blog_status
  );

-- UPDATE: author may edit their own draft/rejected article (and submit it);
-- admin may edit anything.
CREATE POLICY blogs_update ON public.blogs FOR UPDATE TO authenticated
  USING (
    is_admin()
    OR (author_id = auth.uid() AND status IN ('draft'::blog_status, 'rejected'::blog_status))
  )
  WITH CHECK (
    is_admin()
    OR (author_id = auth.uid() AND status IN ('draft'::blog_status, 'submitted'::blog_status))
  );

-- DELETE: author may remove their own draft/rejected article; admin anything.
CREATE POLICY blogs_delete ON public.blogs FOR DELETE TO authenticated
  USING (
    is_admin()
    OR (author_id = auth.uid() AND status IN ('draft'::blog_status, 'rejected'::blog_status))
  );
