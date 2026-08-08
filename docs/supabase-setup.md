# Supabase setup

Commonplace persists Items/Tags to Supabase (Postgres + Auth + Row Level
Security). This doc covers creating the project and pointing a local
checkout at it. See `.claude/plans` history / git log for the architecture
rationale — this file is just the setup steps.

## 1. Create the Supabase project

1. Create a new project at [supabase.com](https://supabase.com).
2. In **Authentication → Providers**, enable **Anonymous sign-ins**. The
   app signs users in anonymously on first launch — there is no login UI
   yet.
3. In **Project Settings → API**, copy:
   - **Project URL**
   - The current **publishable key** (`sb_publishable_...`) — not the
     legacy "anon" key, and never the secret/service-role key.

## 2. Apply the schema

The schema lives in `supabase/migrations/0001_init.sql` (tables, RLS
policies, and the `resolve_tags()` function), committed as the source of
truth. Apply it with the [Supabase CLI](https://supabase.com/docs/guides/cli):

```bash
supabase link --project-ref <your-project-ref>
supabase db push
```

## 3. Configure the app

```bash
cp .env.example .env
```

Fill in `.env`:

```
EXPO_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

`.env` is bundled at build time by Expo's native `.env` support — restart
(and if things look stale, clear the cache: `npx expo start --clear`)
Metro after changing it. `.env` is gitignored; `.env.example` documents the
required keys with empty values.

The publishable key is meant to be public/embedded in the app bundle — Row
Level Security is the actual security boundary, not secrecy of that key.
The secret/service-role key must never be added to this app.

## 4. (Optional) Seed a dev project with sample data

`src/data/mockItems.ts` has 5 realistic sample items in the app's `Item`
shape, previously used to seed in-memory state before persistence existed.
It's no longer imported by any app code (avoids a real account silently
picking up fake data), but it's a convenient reference if you want to
manually insert a few rows into a fresh dev project via the SQL editor or
`supabase-js` to have something to look at.

## 5. Verify Row Level Security manually

Do **not** treat a Supabase SQL Editor query as proof RLS works — the SQL
Editor's default execution context runs with elevated privileges that
bypass RLS entirely unless an auth context is explicitly simulated, so a
query "succeeding" or "returning nothing" proves nothing about RLS on its
own.

Instead, confirm with two genuinely separate anonymous sessions — e.g. two
`supabase-js` instances, each calling `signInAnonymously()` independently
(or the app running on two simulators/devices) — and confirm session A
cannot see or modify session B's `items`/`tags` rows via the normal REST
API.

## 6. Run the app

```bash
npm start
```

The app will show a brief loading state while `AuthContext` bootstraps the
anonymous session, then load the (initially empty) library from Supabase.
