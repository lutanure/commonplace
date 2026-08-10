// Centralized font-family names for the two typefaces loaded in App.tsx via
// expo-font/@expo-google-fonts. Components should reach for `typography`
// tokens (which already carry a fontFamily) rather than these names
// directly — this file exists so the family strings live in exactly one
// place, matching the keys passed to `useFonts`.
//
// Bowlby One is a display-only typeface (one weight) — brand wordmark and
// occasional strong headings, never body/UI copy. Instrument Sans is the
// primary UI typeface for everything else: body, nav, buttons, labels,
// inputs, metadata.
export const fontFamily = {
  display: 'BowlbyOne_400Regular',
  body: 'InstrumentSans_400Regular',
  bodyMedium: 'InstrumentSans_500Medium',
  bodySemiBold: 'InstrumentSans_600SemiBold',
  bodyBold: 'InstrumentSans_700Bold',
} as const;
