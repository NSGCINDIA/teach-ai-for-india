-- ═══════════════════════════════════════════════════════════════════════════
-- Teach AI for India — 0046 Add missing indexes
-- ═══════════════════════════════════════════════════════════════════════════

-- listSchools() (lib/data/schools.ts) sorts every dashboard/admin school-list
-- load by updated_at desc; nothing supported that sort.
create index idx_schools_updated_at on schools (updated_at desc);

-- listSchools()'s search filter does `name.ilike.%term%` / `district.ilike.%term%`
-- (a plain ILIKE on the raw column, not lower()). The existing idx_schools_name_trgm
-- is a functional index on lower(name), which a bare `name ILIKE` predicate can't
-- use, and district had no trigram index at all.
create index idx_schools_name_ilike_trgm on schools using gin (name gin_trgm_ops);
create index idx_schools_district_trgm on schools using gin (district gin_trgm_ops);

-- lib/data/evidence.ts filters media_assets by school_id/session_id directly
-- (not just the entity_type+entity_id embed), and neither column was indexed.
create index idx_media_school on media_assets (school_id);
create index idx_media_session on media_assets (session_id);
