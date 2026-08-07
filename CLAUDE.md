# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Commonplace is an AI-powered "second brain" app (Expo / React Native / TypeScript). Users save
screenshots, articles, links, images, notes, ideas, and other content; AI analyzes it, extracts
information, generates tags/summaries, identifies entities/topics, and connects related items.
Users can later search semantically, ask questions across saved content, and rediscover forgotten
information. The app is meant to minimize manual organization — the user saves, the AI structures
and retrieves.

The repo is an Expo TypeScript app scaffolded from the bare `blank-typescript` template. `App.tsx`
currently renders only a static starter screen (title, subtitle, an "Add something" button with no
action wired up, and an empty "Recently saved" placeholder) — there is no backend, no AI
integration, no navigation, and no UI library yet. Treat any of those as a deliberate choice, not
an oversight, until the user asks for them.

## Commands

```bash
npm install          # install dependencies
npm start             # start Metro / Expo dev server (same as `npx expo start`)
npm run ios           # start dev server and open iOS simulator
npm run android        # start dev server and open Android emulator
npm run web             # start dev server for web (requires react-dom + react-native-web, not yet installed)
npx tsc --noEmit         # type-check the project (no separate lint/test scripts exist yet)
npx expo-doctor            # validate Expo project health/config
```

There are no test or lint scripts configured yet. Add them (and wire this section) if you introduce
a test runner or linter.

## Architecture

The app follows the standard Expo managed-workflow entry chain:

- `index.ts` — registers `App` as the root component via `registerRootComponent` (works for both
  Expo Go and native builds).
- `App.tsx` — the root React component and, currently, the entire UI (single file, one
  `StyleSheet.create` block, only core `react-native` components — no custom component files yet).
- `app.json` — Expo config (app name/slug, icons, splash, platform-specific settings).
- `tsconfig.json` — extends `expo/tsconfig.base` with `strict: true`.

There is no `src/` directory, navigation, or state management yet — as the app grows, expect these
to be introduced deliberately rather than assumed to already exist.

## Expo SDK is pinned to 54 — do not casually upgrade

`package.json` pins `expo@54` (`react-native@0.81.5`, `react@19.1.0`). This is intentional and
lower than the SDK npm currently publishes as "latest": the published Expo Go client app (App
Store/Play Store) only supports SDK 54, and running a newer SDK in this project makes it
impossible to open in Expo Go on a physical device ("Project is incompatible with this version of
Expo Go", with no store update available to fix it). If you ever run `npx expo install expo@latest`
or similar, re-check Expo Go's current published version compatibility first, or you'll reintroduce
this breakage. Because of this pin, `AGENTS.md`'s pointer to `https://docs.expo.dev/versions/v57.0.0/`
is stale — use `https://docs.expo.dev/versions/v54.0.0/` for docs matching the code actually
installed here, and update both this note and `AGENTS.md` if the pinned SDK version changes.

## Node version

This Expo SDK requires Node `^20.19.4` (or `^22.13.0`/`^24.3.0`+). An `.nvmrc` (`20.19.4`) is
checked into the repo root, and `~/.zshrc` has an nvm auto-use hook installed that switches to it
automatically when you `cd` into this directory — new terminal sessions here should already resolve
`node -v` to `20.19.4`. If you ever see `EBADENGINE` warnings or `node -v` resolving to something
older (e.g. 20.11.1), it likely means the auto-use hook is missing/broken or the shell's `PATH` was
pre-seeded with a stale Node bin path by the launching IDE/tool before nvm loaded — run
`nvm use 20.19.4` explicitly rather than assuming the environment is correct.
