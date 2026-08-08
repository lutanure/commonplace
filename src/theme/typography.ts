import { Platform } from 'react-native';
import { colors } from './colors';

// "Strong display typography" for major titles, achieved with a built-in
// platform serif (Georgia on iOS, the generic "serif" family on Android)
// rather than a bundled font file — keeps the editorial feel without any
// extra asset weight or load-time cost. Reserved for the brand wordmark,
// major screen titles, and occasional editorial emphasis (e.g. the type
// selector's preview text) — NOT for scannable list content. Body/
// interface text, and now card titles too, stay on the platform's
// default system sans-serif for clean modern readability and faster
// scanning.
const displayFontFamily = Platform.select({ ios: 'Georgia', android: 'serif' });

export const typography = {
  displayXL: {
    fontFamily: displayFontFamily,
    fontSize: 34,
    fontWeight: '700' as const,
    color: colors.ink,
    letterSpacing: -0.5,
  },
  displayLG: {
    fontFamily: displayFontFamily,
    fontSize: 26,
    fontWeight: '700' as const,
    color: colors.ink,
    lineHeight: 32,
  },
  // Smaller serif display, for occasional editorial emphasis rather than
  // scannable lists (e.g. the type picker's selected-type preview text).
  // Card titles deliberately do NOT use this — see `cardTitle` below.
  displayMD: {
    fontFamily: displayFontFamily,
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.ink,
    lineHeight: 23,
  },
  // Library card titles: still prominent (bold, sizeable), but on the
  // system sans-serif rather than the display serif, so a list of cards
  // reads and scans faster than a list of editorial headlines would.
  cardTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: colors.ink,
    lineHeight: 22,
    letterSpacing: -0.2,
  },
  body: {
    fontSize: 15,
    color: colors.ink,
    lineHeight: 21,
  },
  bodyMuted: {
    fontSize: 14,
    color: colors.inkMuted,
    lineHeight: 20,
  },
  label: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: colors.inkMuted,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.8,
  },
  caption: {
    fontSize: 12,
    color: colors.inkFaint,
  },
  button: {
    fontSize: 15,
    fontWeight: '700' as const,
  },
} as const;
