import Svg, { Path } from 'react-native-svg';

// Path data is copied verbatim from the identity SVG (logo-gold-on-top.svg):
// three bent, round-capped/joined strokes through the center of a 512x512
// viewBox, six rays total. Colors are the literal hexes from that source
// file, not the `brandOrange`/`brandPlum`/`brandOchre` chrome tokens in
// `theme/colors.ts` — those are close but not identical, and this mark
// stays pinned to the exact identity asset rather than drifting with the
// chrome palette (same reasoning as `theme/typeColors.ts` staying separate
// from `theme/colors.ts`).
const STROKE_WIDTH = 90;

export default function BrandMark({ size = 28 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512" testID="brand-mark">
      <Path
        d="M 343.5,104.45 L 256,256 L 430.3,240.7"
        stroke="#A34B32"
        strokeWidth={STROKE_WIDTH}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Path
        d="M 343.5,407.55 L 256,256 L 182.04,414.6"
        stroke="#331920"
        strokeWidth={STROKE_WIDTH}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Path
        d="M 81,256 L 256,256 L 155.6,112.6"
        stroke="#C99A3D"
        strokeWidth={STROKE_WIDTH}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}
