-- Initial Commonplace schema: items, tags, item_tags, plus RLS and the
-- resolve_tags() helper. See src/models/item.ts for the TS-side ItemType /
-- CaptureType unions that the CHECK constraints below must stay in sync
-- with — Postgres enforces the value list as a backstop, but the TS union
-- is the source of truth for what the app can actually produce.

-- ITEMS -----------------------------------------------------------------
create table public.items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,

  title text not null,
  type text not null,
  custom_type_label text,
  category text,

  capture_type text not null,
  source_name text,
  source_url text,
  media_uri text,
  original_text text,

  summary text,
  relevant_info jsonb,
  entities text[],

  user_note text,
  why_saved text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint items_type_check check (type in (
    'idea','note','article','book','movie','tv_show','song','podcast',
    'product','place','recipe','quote','image','other'
  )),
  constraint items_capture_type_check check (capture_type in (
    'screenshot','url','manual','image','text'
  )),
  -- 'other' requires a genuinely non-blank label; built-in types must NOT
  -- carry a stray label (e.g. switching type away from 'other' without
  -- the client clearing the field).
  constraint items_custom_type_label_check check (
    (type = 'other' and custom_type_label is not null and length(trim(custom_type_label)) > 0)
    or
    (type <> 'other' and custom_type_label is null)
  )
);

create index items_user_id_idx on public.items(user_id);

-- TAGS --------------------------------------------------------------------
create table public.tags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null,
  name_key text generated always as (lower(trim(name))) stored,
  created_at timestamptz not null default now(),

  unique (user_id, name_key),
  constraint tags_name_not_blank check (length(trim(name)) > 0)
);

create index tags_user_id_idx on public.tags(user_id);

-- ITEM_TAGS (join) ----------------------------------------------------------
create table public.item_tags (
  item_id uuid not null references public.items(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (item_id, tag_id)
);

create index item_tags_tag_id_idx on public.item_tags(tag_id);

-- updated_at trigger --------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger items_set_updated_at
  before update on public.items
  for each row execute function public.set_updated_at();

-- resolve_tags(): insert-or-return-existing tags without ever overwriting
-- an existing tag's stored capitalization. Trims, drops blanks, and
-- case-insensitively dedupes its own input (keeping the first-occurring
-- casing per array position) before inserting — two input names sharing a
-- name_key would otherwise make a single INSERT hit Postgres's "ON CONFLICT
-- DO UPDATE command cannot affect row a second time" error.
create or replace function public.resolve_tags(p_names text[])
returns setof public.tags
language sql
security invoker
as $$
  with cleaned as (
    select distinct on (lower(trim(name)))
      trim(name) as name
    from unnest(p_names) with ordinality as t(name, ord)
    where length(trim(name)) > 0
    order by lower(trim(name)), ord
  )
  insert into public.tags (user_id, name)
  select auth.uid(), name
  from cleaned
  on conflict (user_id, name_key) do update
    set name = tags.name -- deliberate no-op: forces the DO UPDATE branch (so
                          -- RETURNING always yields a row) without changing
                          -- the existing row's stored name.
  returning tags.*;
$$;

-- ROW LEVEL SECURITY --------------------------------------------------------
alter table public.items enable row level security;

create policy "select own items" on public.items for select
  using (auth.uid() = user_id);
create policy "insert own items" on public.items for insert
  with check (auth.uid() = user_id);
create policy "update own items" on public.items for update
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "delete own items" on public.items for delete
  using (auth.uid() = user_id);

alter table public.tags enable row level security;

create policy "select own tags" on public.tags for select
  using (auth.uid() = user_id);
create policy "insert own tags" on public.tags for insert
  with check (auth.uid() = user_id);
create policy "update own tags" on public.tags for update
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "delete own tags" on public.tags for delete
  using (auth.uid() = user_id);

alter table public.item_tags enable row level security;

create policy "select own item_tags" on public.item_tags for select
  using (exists (select 1 from public.items i where i.id = item_id and i.user_id = auth.uid()));
create policy "insert own item_tags" on public.item_tags for insert
  with check (
    exists (select 1 from public.items i where i.id = item_id and i.user_id = auth.uid())
    and exists (select 1 from public.tags t where t.id = tag_id and t.user_id = auth.uid())
  );
create policy "delete own item_tags" on public.item_tags for delete
  using (exists (select 1 from public.items i where i.id = item_id and i.user_id = auth.uid()));
