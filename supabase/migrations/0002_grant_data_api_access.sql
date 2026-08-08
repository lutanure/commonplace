-- The Supabase project has "Automatically expose new tables" OFF, so the
-- Data API (PostgREST) requires explicit GRANTs on top of RLS before any
-- role can touch these tables — RLS alone does not imply table privileges.
-- This was omitted from 0001_init.sql; without it every request fails with
-- Postgres error 42501 ("permission denied for table ...") regardless of
-- RLS policy, which is what produced "Could not load your library" and
-- failed item saves in the app.
--
-- Only the `authenticated` role is granted access. Supabase anonymous
-- sign-ins still authenticate (role = 'authenticated'), so this covers
-- anonymous users too; the unauthenticated `anon` role intentionally gets
-- nothing here. RLS policies from 0001 are untouched and remain the layer
-- that scopes rows to auth.uid() — grants only control table/function
-- reachability.

grant usage on schema public to authenticated;

grant select, insert, update, delete on public.items to authenticated;
grant select, insert, update, delete on public.tags to authenticated;
grant select, insert, delete on public.item_tags to authenticated;

-- resolve_tags() is SECURITY INVOKER, so it runs with the caller's
-- privileges and needs the same underlying table grants as above (already
-- covered by the tags grant). Lock execution down from PUBLIC/anon first,
-- then grant it explicitly to authenticated.
revoke all on function public.resolve_tags(text[]) from public;
revoke all on function public.resolve_tags(text[]) from anon;
grant execute on function public.resolve_tags(text[]) to authenticated;
