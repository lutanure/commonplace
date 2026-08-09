// Vintage-analogue / mid-century-editorial palette: warm cream paper
// surfaces, dark navy ink, and a small set of restrained accent colors
// (tomato / olive / mustard / teal / plum) used for type-coded pills.
// Deliberately a small, flat palette — no gradients, no per-component
// one-off colors — so the whole app reads as one considered system.
export const colors = {
  // Structural / ink
  navy: '#22242E',
  ink: '#22242E',
  inkMuted: '#6E664F',
  inkFaint: '#9C9478',

  // Paper surfaces
  paper: '#F1E8D6',
  paperElevated: '#F8F1E0',
  paperMuted: '#E4D9BF',

  // Lines
  hairline: '#D9CCA8',
  hairlineStrong: '#C9BA8F',

  // Accents (used for type-coding and primary actions)
  tomato: '#BE4B2E',
  tomatoDark: '#9E3D24',
  olive: '#57633A',
  mustard: '#C68A2E',
  teal: '#3E6763',
  plum: '#6B3B52',
  clay: '#8A7C5E',

  // Fixed
  cream: '#FFFDF8',
  white: '#FFFFFF',
  danger: '#BE4B2E',
} as const;
