-- Store full territory niche on site (not just short hobby label)

alter table public.sites
  add column if not exists territory text;

update public.sites s
set territory = coalesce(
  s.territory,
  b.territory,
  regexp_replace(s.title, ' Money Site$', '')
)
from public.blog_builder_sessions b
where b.user_id = s.user_id
  and (s.territory is null or s.territory = '');
