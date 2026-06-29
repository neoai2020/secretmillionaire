-- Allow multiple money sites per user (daily limit enforced in application code).

alter table public.sites drop constraint if exists sites_user_id_key;

create index if not exists sites_user_id_created_at_idx
  on public.sites (user_id, created_at desc);
