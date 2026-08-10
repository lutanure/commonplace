import { View } from 'react-native';
import { colors } from '../theme';

// A restrained "editorial control" glyph: three horizontal bars of
// decreasing width. Deliberately not a hamburger (three *equal*-width
// bars, which reads as navigation) — this reads as settings/filter
// controls, matching what it actually opens.
export default function SettingsIcon({
  size = 18,
  color = colors.accent,
}: {
  size?: number;
  color?: string;
}) {
  const barHeight = Math.max(2, Math.round(size / 8));
  const gap = Math.max(2, Math.round(size / 6));

  return (
    <View style={{ width: size, gap }} testID="settings-icon">
      <View
        testID="settings-icon-bar-1"
        style={{
          width: size,
          height: barHeight,
          borderRadius: barHeight,
          backgroundColor: color,
        }}
      />
      <View
        testID="settings-icon-bar-2"
        style={{
          width: size * 0.68,
          height: barHeight,
          borderRadius: barHeight,
          backgroundColor: color,
        }}
      />
      <View
        testID="settings-icon-bar-3"
        style={{
          width: size * 0.38,
          height: barHeight,
          borderRadius: barHeight,
          backgroundColor: color,
        }}
      />
    </View>
  );
}
