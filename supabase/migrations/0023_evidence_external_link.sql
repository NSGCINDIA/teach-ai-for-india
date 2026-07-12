-- Let evidence point at an externally hosted file (e.g. a Google Drive share
-- link) instead of requiring a direct upload to Storage, to save on storage
-- costs (PRD §7.7 amendment).

alter table media_assets
  alter column storage_path drop not null,
  add column external_url text;

alter table media_assets
  add constraint media_assets_has_location
    check (storage_path is not null or external_url is not null);

comment on column media_assets.external_url is
  'Externally hosted evidence link (e.g. Google Drive share URL) used instead of a Storage upload.';
