-- Deploy progress persisted server-side (not localStorage/cookies)

alter table public.blog_builder_sessions
  add column if not exists is_generating boolean not null default false,
  add column if not exists generation_log jsonb not null default '[]'::jsonb;
