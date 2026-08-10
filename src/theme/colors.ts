// Core UI identity: warm paper / ink / plum / rust, with blue and olive as
// quiet secondary accents. This is the app's chrome palette — backgrounds,
// text, borders, navigation, buttons. It is deliberately separate from the
// type/tag color-coding system in `./typeColors`, which stays frozen so it
// never drifts when this palette changes. See the semantic tokens at the
// bottom of this file — components should reach for those (`background`,
// `textPrimary`, `accent`, ...) rather than the raw hexes above them.

// Brand
const plum = '#4C2A32';
const plumStrong = '#361E24';

// Feature / action accent
const rust = '#C23B1E';
const rustStrong = '#9E2F17';

// Paper & ink neutrals
const paper = '#F7F1E2';
const paperSunken = '#F0E8D4';
const border = '#D9D0BF';
// Not part of the finalized 11-color list — derived as a darker step off
// `border` for elements that need more definition (input/button outlines),
// mirroring the old two-tier hairline/hairlineStrong system.
const borderStrong = '#C7B79E';
const ink70 = '#5A4F45';
const ink = '#2A211B';
// Derived: a step lighter than ink70, for captions and placeholder text.
const inkFaint = '#8C7E6A';

// Secondary accents
const blue = '#A9C4C9';
const blueStrong = '#7BA0A7';
const olive = '#8B7A44';
const oliveStrong = '#6E6039';

// Fixed neutrals
const cream = '#FFFDF8';
const white = '#FFFFFF';

export const colors = {
  // Raw palette (prefer the semantic tokens below in components)
  plum,
  plumStrong,
  rust,
  rustStrong,
  paper,
  paperSunken,
  border,
  borderStrong,
  ink70,
  ink,
  inkFaint,
  blue,
  blueStrong,
  olive,
  oliveStrong,
  cream,
  white,

  // Semantic tokens — chrome only, never used for type/tag coding
  background: paper,
  surface: cream,
  surfaceSunken: paperSunken,
  textPrimary: ink,
  textSecondary: ink70,
  textFaint: inkFaint,
  primary: plum,
  primaryPressed: plumStrong,
  accent: rust,
  accentPressed: rustStrong,
  // No separate error hue in the finalized palette — rust already reads as
  // an alarm color, so destructive actions reuse the accent tokens.
  danger: rust,
  dangerPressed: rustStrong,
} as const;
