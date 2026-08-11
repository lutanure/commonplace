# Product

<!-- impeccable:product-schema 1 -->

## Platform

ios

Ships on both iOS and Android from one shared Expo/React Native codebase with a single visual
identity (no Material-vs-HIG differentiation). iOS Human Interface Guidelines are the primary
native reference point for interaction patterns, spacing, touch behavior, sheets/modals,
navigation, and accessibility going forward — the Commonplace visual identity is preserved across
both platforms rather than making the Android build read as generically Material.

## Users

A single, anonymous user (no login UI — each install signs in anonymously to Supabase on first
launch) who wants a considered personal reference library: a place to save heterogeneous things
worth remembering — articles, notes, ideas, quotes, books, movies, TV shows, songs, podcasts,
products, places, recipes, images, and anything else via an `other` + custom label escape hatch —
and later search, filter, and revisit them. This is not a write-only capture net; retrieval and
organization matter as much as saving.

## Product Purpose

Commonplace unifies the many different kinds of things people save today across siloed
single-purpose apps (a bookmarking tool for links, a notes app for text, a camera roll for
screenshots, a separate wishlist app for products) into one structured, typed, filterable personal
library. Success means the user actually returns to and finds saved items later, not just that
capture was easy.

## Positioning

Commonplace's differentiator is not "we're the only app that saves things" — plenty of apps save
one kind of thing well. It's that one underlying `Item` model deliberately spans radically
heterogeneous content (a movie recommendation, a recipe, a product, a quote, a place, an idea) and
lets all of it be typed, tagged, categorized, searched, and filtered together, instead of forcing
the user to split their memory across five single-purpose apps. AI enrichment (auto-generated
summaries, extracted facts, entities) is an intended future layer — the data model already reserves
fields for it — but it is not live yet and must not be positioned as a current differentiator until
it ships.

## Operating Context

- Single-user, mobile-only (iOS/Android via Expo), no account/login UI — anonymous Supabase
  session persisted per install; no cross-device sync or account-recovery flow exists.
- Capture happens via distinct mechanisms (`screenshot`, `url`, `manual`, `image`, `text`) that are
  modeled separately from the item's semantic `type` — the same movie recommendation can arrive as
  a screenshot or be typed by hand and is still `type: 'movie'` either way.
- Day-to-day flows: quick-add via type-preset shortcuts ("Petal Quick Add") from the Library home
  screen, full add/edit forms, item detail view, search and type-filter chips on the Library list,
  pinning, and a Settings area for managing custom types and customizing which types appear in
  quick add.
- Backed by Supabase (Postgres + Auth + Row Level Security); RLS is the actual security boundary
  for the publishable key embedded in the app, not key secrecy.

## Capabilities and Constraints

- `type` (what a saved thing semantically is — a closed union of 14 built-in values plus `other` +
  free-text `customTypeLabel`) is strictly separate from `captureType` (how it entered the app) and
  from `category` (open-ended free-text topic). These three must never be conflated.
- `Tag` is a first-class domain object (`id` + `name`), not a raw string, because tags are intended
  to eventually function as nodes in a memory/knowledge graph — though no graph edges exist yet.
- Explicitly not yet built: AI processing of saved items (summary/relevantInfo/entities fields exist
  on the model and are reserved, but nothing currently populates them and the add/edit form doesn't
  expose them), tag-to-tag or item-to-item graph relationships, semantic search/embeddings,
  similarity/confidence scoring, and user-defined collections/folders. Do not design around any of
  these as if they exist.
- `src/data/mockItems.ts` holds 5 sample items in the app's real `Item` shape but is not imported
  by any app code — a reference for manual seeding only, not live sample data.

## Brand Commitments

- Name: **Commonplace**.
- A finalized visual identity was established in this session: a warm cream/paper background with
  a plum + burnt orange + ochre core palette, Bowlby One reserved exclusively for the brand
  wordmark, Instrument Sans for all other UI/body text, and a three-stroke asymmetric brand mark
  (sourced as an SVG, rendered via reusable `BrandMark`/`BrandLockup` components). This is binding;
  future visual work should run `/impeccable document` to capture it fully in DESIGN.md rather than
  re-deriving it.

## Evidence on Hand

No real user content, testimonials, case studies, or press exist yet. Future work must not
fabricate any of these. The only sample content in the repo (`src/data/mockItems.ts`) is
deliberately unused by the running app and must not be presented as real evidence.

## Product Principles

1. One `Item` model spans every kind of saved thing — never fork into per-type single-purpose
   surfaces the way competing apps do.
2. Retrieval matters as much as capture — type/category/tag structure exists to be searched and
   filtered later, not just archived write-only.
3. Item type (what it is), capture type (how it arrived), and category (open topic) stay strictly
   separate fields — never let one leak into another.
4. Keep the AI-enrichment surface reserved but visibly inert until that functionality is real —
   never fake or hint at AI features that don't exist yet.
5. Single anonymous user per install by design — no login, no collaboration/sharing; product
   decisions can assume one local account with no cross-device continuity today.
