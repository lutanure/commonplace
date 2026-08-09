-- Adds pinning to items. `is_pinned` is client-settable (via a plain
-- update, like every other column); `pinned_at` is DB-owned, the same
-- ownership pattern as `updated_at` via `set_updated_at` in 0001_init.sql
-- — it's set the moment an item transitions to pinned and cleared on
-- unpin, so the client never has to (and can't) fabricate it. This gives
-- stable ordering among multiple pinned items (most-recently-pinned
-- first) independent of `updated_at`, which also changes on unrelated
-- edits.

alter table public.items
  add column is_pinned boolean not null default false,
  add column pinned_at timestamptz;

create or replace function public.set_pinned_at()
returns trigger as $$
begin
  if new.is_pinned and (old.is_pinned is distinct from new.is_pinned) then
    new.pinned_at = now();
  elsif not new.is_pinned then
    new.pinned_at = null;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger items_set_pinned_at
  before update on public.items
  for each row execute function public.set_pinned_at();

-- Library ordering is pinned-first, so this index carries the exact
-- predicate used to split the two groups.
create index items_is_pinned_idx on public.items(is_pinned);
