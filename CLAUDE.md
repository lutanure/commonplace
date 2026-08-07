# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Commonplace is an AI-powered "second brain" app (Expo / React Native / TypeScript). Users save
screenshots, articles, links, images, notes, ideas, and other content; AI analyzes it, extracts
information, generates tags/summaries, identifies entities/topics, and connects related items.
Users can later search semantically, ask questions across saved content, and rediscover forgotten
information. The app is meant to minimize manual organization — the user saves, the AI structures
and retrieves.

The repo is currently a freshly scaffolded Expo TypeScript app (bare `blank-typescript` template)
with no product features yet — no backend, no AI integration, no navigation, no UI library. Treat
any of those as a deliberate choice, not an oversight, until the user asks for them.

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
- `App.tsx` — the root React component. Currently a placeholder single-screen view.
- `app.json` — Expo config (app name/slug, icons, splash, platform-specific settings).
- `tsconfig.json` — extends `expo/tsconfig.base` with `strict: true`.

There is no `src/` directory, navigation, or state management yet — as the app grows, expect these
to be introduced deliberately rather than assumed to already exist.

## Node version

This Expo SDK requires Node `^20.19.4` (or `^22.13.0`/`^24.3.0`+). The system default Node on this
machine may resolve to an older version (e.g. 20.11.1) depending on shell setup; if you see
`EBADENGINE` warnings or odd Metro/react-native behavior, check `node -v` and switch to a supported
version (e.g. via `nvm use 20.19.4`) before running `npm`/`npx expo` commands.

## Notes from AGENTS.md

The Expo template's `AGENTS.md` (included via `CLAUDE.md`'s own `@AGENTS.md` import previously)
flags that Expo has changed significantly across recent SDKs: read the versioned docs at
https://docs.expo.dev/versions/v57.0.0/ before writing code against Expo APIs, rather than relying
on older/general knowledge of Expo.
