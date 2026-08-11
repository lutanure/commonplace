---
name: Commonplace
description: A warm, editorial personal reference library — one considered home for everything worth remembering.
colors:
  bound-plum: '#4C2A32'
  bound-plum-deep: '#361E24'
  sealing-wax-rust: '#C23B1E'
  sealing-wax-rust-deep: '#9E2F17'
  aged-gold-ochre: '#C68A2E'
  warm-vellum: '#F7F1E2'
  warm-vellum-sunken: '#F0E8D4'
  bright-vellum: '#FFFDF8'
  deep-ink: '#2A211B'
  faded-ink: '#5A4F45'
  ghost-ink: '#8C7E6A'
  parchment-border: '#D9D0BF'
  parchment-border-deep: '#C7B79E'
  moss-olive: '#8B7A44'
  type-tomato: '#BE4B2E'
  type-olive: '#57633A'
  type-teal: '#3E6763'
  type-plum-muted: '#6B3B52'
  type-navy: '#22242E'
  type-clay: '#8A7C5E'
typography:
  display:
    fontFamily: 'BowlbyOne_400Regular, Georgia, serif'
    fontSize: '28px'
    fontWeight: 400
    letterSpacing: '-0.5px'
  headline:
    fontFamily: 'InstrumentSans_700Bold, system-ui, sans-serif'
    fontSize: '24px'
    fontWeight: 700
    lineHeight: '30px'
  title:
    fontFamily: 'InstrumentSans_700Bold, system-ui, sans-serif'
    fontSize: '17px'
    fontWeight: 700
    lineHeight: '22px'
    letterSpacing: '-0.2px'
  titleSmall:
    fontFamily: 'InstrumentSans_600SemiBold, system-ui, sans-serif'
    fontSize: '16px'
    fontWeight: 600
    lineHeight: '21px'
  body:
    fontFamily: 'InstrumentSans_400Regular, system-ui, sans-serif'
    fontSize: '15px'
    fontWeight: 400
    lineHeight: '21px'
  bodyMuted:
    fontFamily: 'InstrumentSans_400Regular, system-ui, sans-serif'
    fontSize: '14px'
    fontWeight: 400
    lineHeight: '20px'
  label:
    fontFamily: 'InstrumentSans_700Bold, system-ui, sans-serif'
    fontSize: '11px'
    fontWeight: 700
    letterSpacing: '0.8px'
    textTransform: 'uppercase'
  caption:
    fontFamily: 'InstrumentSans_400Regular, system-ui, sans-serif'
    fontSize: '12px'
    fontWeight: 400
  button:
    fontFamily: 'InstrumentSans_700Bold, system-ui, sans-serif'
    fontSize: '15px'
    fontWeight: 700
rounded:
  sm: '6px'
  md: '10px'
  lg: '14px'
  pill: '999px'
spacing:
  xs: '4px'
  sm: '8px'
  md: '12px'
  lg: '16px'
  xl: '24px'
  xxl: '32px'
  xxxl: '40px'
components:
  button-primary:
    backgroundColor: '{colors.sealing-wax-rust}'
    textColor: '{colors.bright-vellum}'
    typography: '{typography.button}'
    rounded: '{rounded.md}'
    padding: '14px 24px'
  button-primary-pressed:
    backgroundColor: '{colors.sealing-wax-rust-deep}'
    textColor: '{colors.bright-vellum}'
  button-neutral:
    backgroundColor: '{colors.bright-vellum}'
    textColor: '{colors.deep-ink}'
    typography: '{typography.button}'
    rounded: '{rounded.md}'
    padding: '14px 24px'
  button-destructive:
    backgroundColor: 'transparent'
    textColor: '{colors.sealing-wax-rust}'
    typography: '{typography.button}'
    rounded: '{rounded.md}'
    padding: '14px 24px'
  chip-active:
    backgroundColor: '{colors.sealing-wax-rust}'
    textColor: '{colors.bright-vellum}'
    typography: '{typography.label}'
    rounded: '{rounded.pill}'
    padding: '6px 12px'
  chip-inactive:
    backgroundColor: '{colors.bright-vellum}'
    textColor: '{colors.faded-ink}'
    typography: '{typography.label}'
    rounded: '{rounded.pill}'
    padding: '6px 12px'
  card-item:
    backgroundColor: '{colors.warm-vellum}'
    rounded: '{rounded.sm}'
    padding: '16px'
  input-field:
    backgroundColor: '{colors.bright-vellum}'
    textColor: '{colors.deep-ink}'
    typography: '{typography.body}'
    rounded: '{rounded.sm}'
    padding: '12px 16px'
  fab-quick-add:
    backgroundColor: '{colors.sealing-wax-rust}'
    rounded: '{rounded.pill}'
    width: '56px'
    height: '56px'
---

# Design System: Commonplace

## Overview

**Creative North Star: "The Commonplace Book"**

Commonplace is named for, and looks like, the historic practice it digitizes: the personal notebook readers have kept for centuries to copy down quotes, recipes, observations, and things worth remembering. The visual system reads as a well-kept bound book, not a productivity app — warm vellum paper, deep ink, and accents that recall sealing wax and gilt page-edges, rather than screen-native blues and grays. Every surface is flat and matte; nothing glows, floats, or animates for its own sake. Structure comes from a thin warm-neutral rule (a hairline border) the way a real page has a printed margin, not from drop shadows.

The system is **considered and unhurried**: flat, generously rounded, and visually calm. Paper and cream surfaces dominate; thin warm borders create structure; ochre is used selectively to give specific important surfaces character (the item card border, the wordmark's closing dot) rather than being spread everywhere. Sealing-wax rust is reserved for the one primary action or active state per screen — its rarity is what makes it legible as "the thing to do here." Nothing in the system is glossy, gradient-filled, or "tech-modern"; the target is the opposite of a SaaS dashboard.

**Key Characteristics:**

- Warm paper background, never stark white
- Bowlby One reserved exclusively for the "Commonplace" wordmark — every other heading is bold Instrument Sans
- Flat everywhere — zero shadows in the entire system; depth comes from background-color steps and hairline borders
- One rust accent per screen for the primary action; ochre used sparingly as a considered accent, not a second primary
- Generously rounded corners and pill-shaped chips/badges/buttons-as-tags
- Item type is always color-coded through a closed, separately-maintained palette — never improvised per screen

## Colors

The palette reads as book materials — paper, ink, and two accent inks (a rust sealing-wax red and a gold-leaf ochre) — kept deliberately warm and desaturated rather than screen-bright.

### Primary

- **Sealing-Wax Rust** (#C23B1E): The single primary-action color. Fills primary buttons, the quick-add FAB, active filter chips, back-control links, and destructive-action text. Never used decoratively — its presence always means "this is actionable" or "this is currently selected."
- **Aged-Gold Ochre** (#C68A2E): A considered secondary accent, used sparingly for specific surfaces that deserve character — the item card border and the wordmark's closing dot — not as a general-purpose second accent. (This is the same hex as the idea/note item-type color; both trace back to one "ochre" value in the original identity spec.)

### Secondary

- **Bound Plum** (#4C2A32): The brand's ink-adjacent identity color. Used in the wordmark ("Common") and as the semantic `primary`/pressed-state color where a darker, more literary tone than pure ink is wanted.

### Neutral

- **Warm Vellum** (#F7F1E2): The app's background on every screen — the "page" itself. Never pure white.
- **Bright Vellum** (#FFFDF8): Raised/interactive surfaces — inputs, inactive chips, settings row groups, the search bar — one step brighter than the page behind them.
- **Warm Vellum, Sunken** (#F0E8D4): Pressed/recessed states (a pressed settings button, a pressed card) and placeholder media boxes — one step _darker_ than the page, reading as a shallow indentation.
- **Deep Ink** (#2A211B): Primary text.
- **Faded Ink** (#5A4F45): Secondary/muted body text.
- **Ghost Ink** (#8C7E6A): Tertiary text — captions, metadata, dates, placeholder text.
- **Parchment Border** (#D9D0BF): The standard 1px hairline border/divider color used everywhere except item cards.
- **Parchment Border, Deep** (#C7B79E): A stronger border for elements needing more definition — input/selector outlines, the FAB's neutral "All types" petal.
- **Moss Olive** (#8B7A44): A quiet reserved accent, currently used only for the "Pinned" label on item cards.

### Item Type Coding (separate system — see Named Rule below)

- **Tomato** (#BE4B2E) — Movie / TV Show
- **Type-Olive** (#57633A) — Book / Quote
- **Type-Teal** (#3E6763) — Place / Recipe
- **Type-Plum, Muted** (#6B3B52) — Song / Podcast
- **Type-Navy** (#22242E) — Article / Product / Image
- **Type-Clay** (#8A7C5E) — Other / unclassified custom types
- Idea/Note reuses **Aged-Gold Ochre** above. Badge text is Bright Vellum on dark backgrounds (tomato, olive, teal, plum, navy, clay) and Type-Navy's own hex as dark text on the one light background (ochre).

### Named Rules

**The One Accent Rule.** Sealing-Wax Rust appears at most once per screen as a _fill_ — the single primary action or the single active/selected state. Everywhere else, action is expressed as rust _text_ (links, destructive labels) or the surface simply stays neutral.

**The Two Palettes Rule.** The chrome palette (this section) and the Item Type Coding palette are maintained as two independent systems on purpose. A restyle of the app's chrome (buttons, borders, backgrounds) must never silently change what color a "movie" or "book" badge renders as, and vice versa.

**The Ochre Card Rule.** Item cards alone carry a solid Aged-Gold Ochre border instead of the neutral Parchment Border every other bordered surface uses (chips, inputs, settings groups, modals) — a deliberate accent marking the library's core content unit as visually distinct from its chrome.

## Typography

**Display Font:** Bowlby One (with Georgia/serif fallback)
**Body Font:** Instrument Sans — Regular, Medium, SemiBold, and Bold each loaded as a distinct font file (with system-ui/sans-serif fallback)

**Character:** A single bold display face used exactly once (the wordmark) paired with a clean, modern grotesque that carries every other weight of hierarchy — the display face supplies the book's "cover," Instrument Sans supplies everything printed on its pages.

### Hierarchy

- **Display** (400, 28px, letter-spacing -0.5px): The "Commonplace" wordmark only. Never used for a heading, item title, or any arbitrary-length user content.
- **Headline** (700, 24px, line-height 30px): Page-level titles (e.g. "Settings", "Manage Types") — Instrument Sans Bold, not the display face.
- **Title** (700, 17px, line-height 22px, letter-spacing -0.2px): Item card titles — prominent but scans fast across a list, unlike an editorial headline.
- **Title, Small** (600, 16px, line-height 21px): Shorter prominent UI text — a modal title, the selected-type preview in the add-item form.
- **Body** (400, 15px, line-height 21px): Default body/paragraph text.
- **Body, Muted** (400, 14px, line-height 20px, Faded Ink): Secondary descriptive text, e.g. settings row descriptions.
- **Label** (700, 11px, letter-spacing 0.8px, uppercase, Faded Ink): Section headers, chip/badge text, form field labels.
- **Caption** (400, 12px, Ghost Ink): Dates, metadata, the least prominent text on a screen.
- **Button** (700, 15px): All button and pill-button labels.

### Named Rules

**The One Display Face Rule.** Bowlby One renders in exactly one place in the entire app: the brand wordmark. Every heading, however large or bold, stays on Instrument Sans — this keeps the display face a genuine brand moment instead of a generic "big font."

## Layout

Single-column mobile layout throughout (no responsive breakpoints — this is a phone app, not a web app that reflows). Screen content sits inside a consistent horizontal margin of 24px (`spacing.xl`), respecting the device safe area (`SafeAreaView`) so nothing sits under the notch, Dynamic Island, or home indicator. Vertical rhythm is built entirely from the spacing scale (4/8/12/16/24/32/40px) rather than ad hoc values.

Sub-tasks that don't need a full screen (the type picker in the add/edit form) present as a bottom sheet: a `Modal` with a dimmed scrim, sliding up to a rounded-top sheet capped at 75% of screen height, keyboard-avoiding on iOS. Everything else is a full-screen push via the navigation stack — there is no tab bar; the Library is the single top-level home screen.

## Elevation & Depth

The system is **flat by design — zero shadows anywhere** in the entire app (no `shadow*`/`elevation` style props exist in the theme or any screen). Depth is conveyed entirely through two other mechanisms: a three-step background ladder (Warm Vellum Sunken → Warm Vellum → Bright Vellum, dark to light) for recessed/base/raised surfaces, and 1px hairline borders for structure. This is the single biggest thing that keeps the app reading as "paper," not "app" — a shadow anywhere in this system would immediately break the metaphor.

### Named Rules

**The No-Shadow Rule.** Never add `shadow*`/`elevation` styling. If a surface needs to read as "raised," step its background one shade brighter (toward Bright Vellum) and/or add a hairline border — never a shadow.

## Shapes

Corner radius is a strict four-step scale: 6px (cards, inputs, the standard "content surface" radius), 10px (buttons, settings-group containers), 14px (the bottom sheet's top corners — the one place a slightly larger radius reads intentionally as "opening upward"), and 999px/pill (chips, tags, badges, the FAB, avatar-like dots). Borders are 1px solid in Parchment Border or Parchton Border, Deep almost everywhere; a couple of divider lines use the platform hairline width instead of a fixed 1px. Item cards are the one deliberate exception, using a solid Aged-Gold Ochre border instead of the neutral one (see The Ochre Card Rule). Two input variants exist: solid border (default) and dashed border (optional/freeform fields — tags, source, source URL) as a quiet visual cue that the field is optional.

## Components

Buttons, chips, and cards all share one register: **considered and unhurried** — flat, generously rounded, visually calm. Paper/cream surfaces dominate; thin warm borders create structure; ochre appears selectively on specific surfaces that earn it. Rust is reserved for primary actions and active states, never used to decorate.

### Buttons

- **Shape:** 10px radius (`rounded.md`), 1px border on every variant, 14px vertical padding (horizontal padding is set per call site, not baked into the component).
- **Primary:** Solid Sealing-Wax Rust fill, Bright Vellum text. Pressed state deepens to Sealing-Wax Rust Deep.
- **Neutral:** Bright Vellum fill, Parchment Border Deep outline, Deep Ink text. Pressed state steps to Warm Vellum Sunken.
- **Destructive:** Transparent fill, Sealing-Wax Rust outline and text (no separate error hue exists — rust already reads as an alarm color). Pressed state fills to Warm Vellum Sunken.

### Chips / Badges

Two related but distinct chip patterns share the same pill shape and label typography:

- **Filter chips** (Library search/type filters): Inactive = Bright Vellum fill, Parchment Border outline, Faded Ink text. Active (a specific type) = that type's coding color; active ("All") = Sealing-Wax Rust fill with Bright Vellum text.
- **Type badges** (on item cards, item detail, and the add/edit type selector): Always filled solid with the item's type-coding color (see Colors → Item Type Coding), light or dark text chosen for contrast per background.

### Cards / Containers

- **Corner Style:** 6px radius (`rounded.sm`).
- **Background:** Warm Vellum (same as the page — cards sit _on_ the page, not visually elevated off it).
- **Shadow Strategy:** None — see Elevation & Depth.
- **Border:** 1px solid Aged-Gold Ochre (item cards only — see The Ochre Card Rule); every other card-shaped container (Settings row groups, Manage Types groups) uses the neutral 1px Parchment Border instead.
- **Internal Padding:** 16px (`spacing.lg`).

### Inputs / Fields

- **Style:** Bright Vellum fill, 6px radius, 1px Parchment Border Deep outline, 15px body text. Optional/freeform fields (tags, source, source URL) use a dashed Ghost Ink border instead of solid, as a quiet "this one's optional" signal.
- **Focus:** No custom focus treatment beyond the platform default — kept deliberately plain.
- **Multiline:** A 110px minimum height, otherwise identical styling to single-line inputs.

### Navigation

No tab bar and no title-bar chrome on the Library (the home screen is edge-to-edge, header built from the brand lockup + a settings button). Every other screen uses a plain `‹ Back` text control in Sealing-Wax Rust (bold, 15px), top-left, rather than a system back-arrow icon — consistent across every push screen (Settings, Manage Types, Item Detail, Edit Item).

### Petal Quick Add (signature component)

A fan-shaped quick-add control anchored bottom-right: a 56px circular rust FAB (a plus icon that rotates 45° into an "×" when open) blooms into per-type pill "petals," each colored with that type's coding color, plus one neutral "All types" petal (Bright Vellum fill, Parchment Border Deep outline). Petals unfurl along an asymmetric polar fan (angle and radius both increase per petal on different easing curves, with a small alternating rotation) rather than a mechanical arc or straight list — this is the app's one moment of playful motion, everywhere else stays static.

### Brand Lockup (signature component)

The compact mark-and-wordmark treatment used in the Library header and the app's loading screen: a small three-stroke asymmetric SVG mark (rust, ochre, and dark-plum strokes radiating from a center point) immediately left of "Common" (Bound Plum) + "place" (Sealing-Wax Rust) in the display face, closed by a small solid Aged-Gold Ochre circle — a graphic dot, never a typed character.

## Do's and Don'ts

### Do:

- **Do** keep Sealing-Wax Rust to at most one filled instance per screen — the primary action or the active state (The One Accent Rule).
- **Do** route every color through the `colors` / `typeColors` theme tokens. The codebase currently has zero hardcoded hex values inside any screen or component — keep it that way.
- **Do** use Bowlby One only for the literal "Commonplace" wordmark (The One Display Face Rule).
- **Do** keep chrome colors (`colors.ts`) and item-type-coding colors (`typeColors.ts`) as two independent systems (The Two Palettes Rule) — never derive one from the other.
- **Do** use light (Bright Vellum) text on dark type-coding badges and dark text on the one light (ochre) badge, matching the existing `getItemDisplayColor` contrast pairing.
- **Do** use a dashed border to mark an input field as optional/freeform, solid for required fields.

### Don't:

- **Don't** add drop shadows, glows, gradients, glassmorphism, or any other "modern tech" surface treatment — the system is flat and matte everywhere (The No-Shadow Rule).
- **Don't** introduce a second display/brand typeface. Instrument Sans (in its four weights) carries every heading and UI role outside the wordmark.
- **Don't** give the ochre accent border to any bordered surface other than item cards — chips, inputs, settings groups, and modals all keep the neutral Parchment Border (The Ochre Card Rule).
- **Don't** scatter the brand mark decoratively across ordinary UI. It belongs only in the Library header lockup and loading/splash moments.
- **Don't** design UI for AI-derived fields (summaries, extracted entities, confidence scores) as if they're live — that surface is reserved but currently inert (see PRODUCT.md).
