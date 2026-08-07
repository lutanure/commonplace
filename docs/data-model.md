# Data model (v1)

This document describes the core domain models under `src/models/`. These are v1 models: simple
enough to build against now, without locking in decisions (database schema, embeddings, graph
edges) that should wait until we've used the app on real content.

## Why `src/models/`

Domain entities live in their own directory, separate from UI components and any future
persistence layer (Supabase tables, API clients, etc.). The models describe *what a saved thing
is*, independent of how it's displayed or stored. This keeps the domain model reusable if the
storage or UI layer changes later, and gives AI-processing code a stable shape to read and write.

## `Item`

An `Item` is the single representation for everything a user saves — an article, a note, a
product, a movie recommendation, a place, and so on. Rather than modeling each kind of saved thing
as its own type, `Item` has one shape with a `type` and a flexible `category`, plus optional fields
that are populated differently depending on what was saved and how far AI processing has gone.

Fields are grouped by where the data comes from:

### Identity — always present, defines what the item fundamentally is
- `id`, `title`, `type`, `customTypeLabel?`, `category`, `createdAt`, `updatedAt`

**`type` is what the knowledge *is*, not how it arrived.** It's a fixed union of built-in semantic
types — `idea`, `note`, `article`, `book`, `movie`, `tv_show`, `song`, `podcast`, `product`,
`place`, `recipe`, `quote`, `image`, `other` — describing the semantic identity of the saved
information. A movie recommendation is `type: 'movie'` whether it was captured as a screenshot, a
pasted text message, or typed in by hand; the capture mechanism never leaks into `type`. This is
deliberately kept separate from `captureType` (below) — see "Item type vs capture type" for why
that split matters.

`type` stays a closed union on purpose, even though the list of things people want to save is
open-ended (a research paper, a wine, a workout, an interior-design reference...). A closed set is
what makes `type` useful for search, filtering, AI prompting, and analytics later — "show me all my
movies" or "how many books did I save this year" only works if `movie`/`book` are stable, countable
values rather than arbitrary free text. `'other'` is the deliberate escape hatch: when none of the
built-in types fit, `type: 'other'` plus a `customTypeLabel` (e.g. `'Research Paper'`) lets the user
name the thing without forcing a fixed vocabulary to grow unboundedly or forcing category (which
already is free text — see below) to carry two jobs at once. `customTypeLabel` is only meaningful
when `type === 'other'`; it's ignored/absent for every built-in type.

This is different from `category`, which is *always* free text regardless of `type` — `category` is
the open-ended subject/topic classification (`entertainment`, `shopping`, ...), while `type` and
`customTypeLabel` together are the semantic-identity classification. A `movie` can be `category:
'entertainment'`; an `other` + `customTypeLabel: 'Wine'` item can be `category: 'gifts'`. They don't
compete with each other. `category` remains a plain `string`, not an enum, since it may eventually
be AI-generated or user-defined and shouldn't be constrained to a fixed vocabulary the way `type`
deliberately is.

### Source / original content — comes from the original saved thing
- `captureType`, `sourceName?`, `sourceUrl?`, `mediaUri?`, `originalText?`

**`captureType` is how the item entered Commonplace, not what it's about.** It's a fixed union —
`screenshot`, `url`, `manual`, `image`, `text` — recording the raw mechanism: a screenshot from the
camera roll, a shared link, something typed directly with no external source, and so on.
`sourceUrl`/`mediaUri`/`originalText` are populated depending on which capture mechanism applies;
none are required because a manually-typed idea has none of them.

#### Item type vs capture type

These two fields answer different questions and were previously conflated into a single `type`
field that mixed both. Splitting them matters because the same knowledge can arrive through
different capture mechanisms, and the same capture mechanism can carry very different kinds of
knowledge:

- **Item type = what the knowledge is** (a movie, a product, an idea, a place, an article...)
- **Capture type = how it entered Commonplace** (a screenshot, a shared URL, typed manually...)

For example, a movie recommendation captured as a photo of a text thread and a movie recommendation
typed in by hand are both `type: 'movie'` — they only differ in `captureType` (`screenshot` vs.
`manual`). Keeping these independent means `type` stays a stable classification for search/AI
purposes regardless of how a given item happened to be saved.

### AI / interpreted information — populated by AI analysis, may lag behind creation
- `summary?`, `relevantInfo?`, `tags`, `entities?`

These fields are meant to be filled in (or refined) after AI processes an item, so they're all
optional except `tags` (an item can be saved with zero AI-derived tags, represented as an empty
array, so the field itself doesn't need to be optional). `relevantInfo` is modeled as an array of
`{ label, value }` facts (`RelevantFact`) rather than a single paragraph, because saved content
often has several distinct useful facts (a price, a neighborhood, a streaming platform) that are
more useful kept separate and re-orderable than flattened into prose.

`tags` and `entities` cover different jobs: `tags` are user/AI-assigned concepts or descriptors
(`to-watch`, `read-later`) and are first-class domain objects (see `Tag` below) because they're
expected to become graph nodes. `entities` are identifiable things mentioned in the content —
people, companies, products, books, movies, places — kept as plain `string[]` for v1. A `topics`
field previously sat between these two but was removed: the distinction between "topic" and "tag"
wasn't meaningful enough yet, and having three overlapping label concepts (`tags`, `topics`,
`entities`) risked organizational drift before we'd used the model on real content. `entities` may
be promoted to a first-class domain object later if the graph or search architecture needs it to
have its own identity, the way `Tag` already does.

### Personal context — added by the user, not inferred
- `userNote?`, `whySaved?`

Freeform fields for the user's own reason for saving something or an ad-hoc note, kept distinct
from AI-derived `summary` so the two never get overwritten or confused with each other.

## `Tag`

```ts
interface Tag {
  id: string;
  name: string;
}
```

Tags are modeled as their own domain object instead of raw strings because we expect tags to
eventually function as nodes in a memory/knowledge graph — connecting items that share a tag, and
possibly connecting to other tags. That only works if a tag has a stable identity (`id`) that
multiple items can reference, the same way a foreign key works. If tags were just strings on each
item, "the `movies` tag" wouldn't be a single addressable thing — it'd just be a repeated string
that happens to match, with no way to rename it consistently or attach anything to it later.

The model is intentionally minimal (`id` + `name`) — no color, no hierarchy, no counts. Those can
be added if and when they're needed.

## What's deliberately postponed

- **Graph edges / relationships** — no `relatedItems`, no tag-to-tag links, no "connects to"
  concept yet. `Tag` is shaped so it *can* become a graph node later, but no edges exist yet.
- **Embeddings** — no vector field on `Item`. Semantic search will need this eventually, but it's
  an implementation detail of search, not part of the item's own identity.
- **Similarity / confidence scores** — no AI-confidence or relevance-scoring fields. These belong
  to a future ranking/analysis layer, not the stored item itself.
- **Collections** — no user-defined folders/collections referencing items. Tags plus category may
  turn out to cover this use case; adding collections now would be guessing at a need we haven't
  confirmed.

These are left out so the v1 model stays easy to reason about and cheap to change; adding a field
later is easy, removing/migrating a wrong one after real content exists is not.
