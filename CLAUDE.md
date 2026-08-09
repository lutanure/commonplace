# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this
repository. It is the authoritative source of project guidance — if anything here conflicts with
`AGENTS.md` or another doc, follow this file and flag the conflict to the user.

## Project overview

Commonplace is a digital commonplace notebook / "second brain" (Expo / React Native /
TypeScript). Users log arbitrary pieces of information — words, ideas, notes, recommendations,
links, and more — tag them, and later find them again through search. The core interaction is
free-form capture now, flexible retrieval later: e.g. jotting down an unfamiliar word and later
finding it by searching a related concept, or logging a movie recommendation with who recommended
it and later searching the person's name to recall what they suggested.

The MVP is: log anything, tag it, search it. AI-assisted processing (auto-tagging, summarization,
entity extraction, semantic search, screenshot ingestion) is the intended long-term direction but
is **not yet built** — treat any AI-processing code as future work, not something already wired
up, unless the user says otherwise.

The app currently has a full `src/` structure (see Architecture below) with working Supabase
persistence, anonymous auth, and a relational tag system. Search is not yet implemented.

## Commands

```bash
nvm use 20.19.4              # ensure correct Node version
npm start                    # start Metro / Expo dev server (same as `npx expo start`)
npx expo start -c            # restart Expo + clear Metro cache
npm run typecheck            # tsc --noEmit
npm run lint                 # expo lint
npm run format                # Prettier --write
npm run format:check          # Prettier --check (used in CI/verify; does not modify files)
npm test                      # Jest unit tests
npm run verify                 # typecheck && lint && format:check && test, in that order
npx expo-doctor                 # validate Expo project health/config
```

## Verification before declaring a task complete

- Before declaring any implementation task complete, run `npm run verify` and report the result.
- If the change touches Expo config, dependencies, native modules, or other platform-sensitive
  behavior, also run `npx expo-doctor`.
- If the change affects user-facing mobile behavior, `npm run verify` passing is not sufficient —
  explicitly tell the user what to check in Expo Go on a physical device.
- Never weaken, remove, skip, or rewrite an existing test merely to make a change pass without
  first explaining the underlying reason.
- Never commit or push — the user handles all Git commits and pushes.

## Git workflow

- For every meaningful new feature, fix, refactor, or infrastructure task, work on a short-lived
  branch rather than directly on `main`.
- Before starting work, inspect the current branch and `git status`.
  - If the working tree is clean and on `main`, create an appropriately named branch:
    `feat/...`, `fix/...`, `refactor/...`, or `chore/...`.
  - If already on a branch for the current task, keep using it — don't create a new branch for
    every small follow-up or UI tweak within the same task.
- Never switch branches when doing so could endanger uncommitted work.
- Never commit, push, merge, rebase, reset, force-push, delete branches, or open/merge pull
  requests unless explicitly asked — the user handles all of that themselves.
- When a task is finished, leave all changes uncommitted and report: (1) the current branch,
  (2) files changed, (3) verification/tests run and their results, and (4) a suggested
  Conventional Commit message (e.g. `feat: ...`, `fix: ...`, `chore: ...`).

## Architecture

Layered structure, thin UI, no service/database logic inside components:

```
src/
  components/   reusable UI
  screens/      screen-level components (thin — delegate to state/data layers)
  state/        contexts/providers (e.g. ItemsContext — app state + CRUD methods)
  data/         repositories (itemsRepository.ts, tagsRepository.ts) + mappers.ts
                (DB row <-> domain model conversion); this is the only layer that
                talks to Supabase
  lib/          supabaseClient.ts — single Supabase client/config entry point
  models/       domain types (see data-model.md)
  navigation/   navigation config
  theme/        design tokens
  utils/        pure helpers
```

Data flow: **UI → `ItemsContext` → repository (`data/`) → `supabaseClient` → Supabase.**
`ItemsContext` never calls Supabase directly, and components never call repositories directly.

Conventions:
- Strict TypeScript throughout.
- Tests colocated as `*.test.ts(x)`.
- `src/data/mockItems.ts` is fixture data for tests only — it is **not** part of the production
  data flow. `ItemsContext` loads from the Supabase repository, not from `mockItems`, in
  production.

See `data-model.md` for the full `Item`/`Tag` domain model and rationale, and
`supabase-setup.md` for backend setup, environment config, and RLS verification steps.

## Stack

- React Native + Expo SDK 57, TypeScript
- Node.js 20.19.4 (`.nvmrc` checked in)
- React Context for state (`ItemsContext`)
- Expo Google Fonts (Bowlby One + Instrument Sans)
- Supabase: Postgres + anonymous Auth + Row Level Security (RLS is the actual security boundary,
  not secrecy of the publishable key). Not yet using Realtime or Edge Functions; Storage and
  possibly Edge Functions are planned for screenshot uploads and AI processing.

## Tagging & search

- Tags are stored relationally (`tags` + `item_tags` join table) with database-level
  case-insensitive deduplication.
- Type/tag input logic is currently handled client-side.
- **Search is not yet implemented.** When it is, decide deliberately between Postgres full-text
  search, array/tag-column filtering, or vector/semantic search — don't assume one has been
  chosen already.

## Notes on other docs in this repo

- `AGENTS.md` is a separate, standalone note and is **not** kept in sync with this file — do not
  assume it reflects the current Expo SDK version or project state. If it conflicts with this
  file, this file wins; flag the discrepancy to the user rather than silently resolving it.
- `data-model.md` and `supabase-setup.md` are accurate and actively maintained — treat them as
  authoritative for domain model and backend setup details respectively.