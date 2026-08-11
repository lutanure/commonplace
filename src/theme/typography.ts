import { colors } from './colors';
import { fontFamily } from './fonts';

// Bowlby One is a single-weight display face, reserved for the brand
// wordmark and other major, *intentional* brand moments — never body copy,
// long headings, or anything that can hold arbitrary-length user content
// (e.g. an item's title). `displayXL` is the only token that uses it, and
// it's used in exactly one place: the "Commonplace" wordmark. Everything
// else, including the other "display" sizes below, stays on Instrument
// Sans (bold) — still prominent, just not the brand face. Each Instrument
// Sans weight is its own font file (loaded in App.tsx), so styles below
// pair a specific `fontFamily` with `fontWeight: '400'` rather than relying
// on fontWeight to synthesize bold — that synthesis is unreliable for
// custom fonts, especially on Android.
export const typography = {
  displayXL: {
    fontFamily: fontFamily.display,
    fontSize: 28,
    fontWeight: '400' as const,
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  // A large bold heading (e.g. the Item Detail title) — arbitrary-length
  // user content, so deliberately on Instrument Sans, not the display face.
  displayLG: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 24,
    fontWeight: '400' as const,
    color: colors.textPrimary,
    lineHeight: 30,
  },
  // A smaller bold heading for prominent-but-short UI text (e.g. the type
  // picker's selected-type preview, a modal title). Card titles
  // deliberately do NOT use this — see `cardTitle` below.
  displayMD: {
    fontFamily: fontFamily.bodySemiBold,
    fontSize: 16,
    fontWeight: '400' as const,
    color: colors.textPrimary,
    lineHeight: 21,
  },
  // Library card titles: still prominent (bold, sizeable), but on the UI
  // typeface rather than the display face, so a list of cards reads and
  // scans faster than a list of editorial headlines would.
  cardTitle: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 17,
    fontWeight: '400' as const,
    color: colors.textPrimary,
    lineHeight: 22,
    letterSpacing: -0.2,
  },
  body: {
    fontFamily: fontFamily.body,
    fontSize: 15,
    fontWeight: '400' as const,
    color: colors.textPrimary,
    lineHeight: 21,
  },
  bodyMuted: {
    fontFamily: fontFamily.body,
    fontSize: 14,
    fontWeight: '400' as const,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  label: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 11,
    fontWeight: '400' as const,
    color: colors.textSecondary,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.8,
  },
  caption: {
    fontFamily: fontFamily.body,
    fontSize: 12,
    fontWeight: '400' as const,
    color: colors.textFaint,
  },
  button: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 15,
    fontWeight: '400' as const,
  },
} as const;
