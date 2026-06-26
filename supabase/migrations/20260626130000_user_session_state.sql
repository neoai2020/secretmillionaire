-- Per-Initiate session state (no localStorage / cookies for account data)

-- Empire Builder wizard progress (one row per Initiate)
create table if not exists public.blog_builder_sessions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  step smallint not null default 0 check (step >= 0 and step <= 3),
  hobby text not null default '',
  territory text not null default '',
  suggestions jsonb not null default '[]'::jsonb,
  territory_chosen boolean not null default false,
  links_armed boolean not null default false,
  deployed boolean not null default false,
  site_id uuid references public.sites(id) on delete set null,
  site_slug text,
  updated_at timestamptz not null default now()
);

-- Reusable DigiStore / affiliate links (Link Vault)
create table if not exists public.link_vault (
  user_id uuid primary key references auth.users(id) on delete cascade,
  links jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

-- Extraction protocol progress (Connect → Scan → Extract)
create table if not exists public.extraction_sessions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  step smallint not null default 0 check (step >= 0 and step <= 3),
  connected boolean not null default false,
  scanned boolean not null default false,
  extracted boolean not null default false,
  balance numeric not null default 0,
  commissions_found numeric not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.blog_builder_sessions enable row level security;
alter table public.link_vault enable row level security;
alter table public.extraction_sessions enable row level security;

drop policy if exists "own blog builder session" on public.blog_builder_sessions;
create policy "own blog builder session" on public.blog_builder_sessions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own link vault" on public.link_vault;
create policy "own link vault" on public.link_vault
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own extraction session" on public.extraction_sessions;
create policy "own extraction session" on public.extraction_sessions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
