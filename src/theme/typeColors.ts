// The color-coding system for item types/tags — deliberately separate from
// `./colors` (the core chrome palette). These hexes are frozen: the user
// relies on them to tell types apart at a glance today, so they must not
// drift when the core UI palette (paper/ink/plum/rust/blue/olive) changes.
// Only `itemTypeColors.ts` should import from here.
export const typeColors = {
  tomato: '#BE4B2E',
  tomatoDark: '#9E3D24',
  olive: '#57633A',
  mustard: '#C68A2E',
  teal: '#3E6763',
  plum: '#6B3B52',
  navy: '#22242E',
  clay: '#8A7C5E',
  // Text-on-dark / text-on-warm pair used across every type pill.
  cream: '#FFFDF8',
  ink: '#22242E',
} as const;
