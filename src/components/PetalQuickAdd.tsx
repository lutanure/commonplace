import { useEffect, useState } from 'react';
import { BackHandler, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { useQuickAddPreferences } from '../state/QuickAddPreferencesContext';
import { colors, radii, spacing, typography } from '../theme';
import { getCustomTypeColor, getItemTypeColor } from '../theme/itemTypeColors';
import { ITEM_TYPE_OPTIONS } from '../utils/itemTypeLabel';
import { normalizeTypeKey, type TypeFilter } from '../utils/typeTaxonomy';

const FAB_DIAMETER = 56;
const FAB_MARGIN_RIGHT = spacing.xl; // 24 — horizontal distance from the safe-area corner
const FAB_MARGIN_BOTTOM = spacing.xl + spacing.lg; // 40 — raised a bit off the bottom edge
const FAB_RADIUS = FAB_DIAMETER / 2;
const FAB_ORIGIN_X = FAB_MARGIN_RIGHT + FAB_RADIUS; // 52 — FAB center from the right corner
const FAB_ORIGIN_Y = FAB_MARGIN_BOTTOM + FAB_RADIUS; // 68 — FAB center from the bottom
const PETAL_HEIGHT = 44;

// Polar fan: both angle and radius grow per petal, on different easing
// curves, so later petals swing out further as well as higher — an
// asymmetric "unfurl" rather than a mechanical arc. Positions are computed
// per petal count (not a fixed slot table) so 3/4/5 quick-add options each
// get their own well-proportioned fan. RADIUS_START is tuned against the
// densest case (5 options + "All types" = 6 petals); nudge it up further if
// the two petals nearest the FAB read as crowded on a small device.
const ANGLE_START = 8;
const ANGLE_END = 90;
const RADIUS_START = 108;
const RADIUS_END = 245;

const OPEN_DURATION = 220;
const CLOSE_DURATION = 160;
// Per-petal stagger, expressed as a remap of the single openProgress value —
// no per-petal timers. Each petal's own reveal spans LOCAL_SPAN of progress,
// starting STAGGER later than the previous petal.
const STAGGER = 0.08;
const LOCAL_SPAN = 0.6;

const ALL_TYPES_LABEL = 'All types';

const BUILT_IN_LABELS = new Map(
  ITEM_TYPE_OPTIONS.map((option) => [option.value, option.label])
);

interface PetalOffset {
  dx: number;
  dy: number;
  rotation: number;
}

// t=0 is the petal nearest the FAB (index 0), t=1 is the furthest ("All
// types", always last). Angle grows faster early (t^0.85 front-loads the
// swing), radius grows faster late (t^1.15 back-loads the reach) — together
// these keep the fan irregular rather than a mechanical semicircle.
function computePetalOffset(index: number, total: number): PetalOffset {
  const t = total > 1 ? index / (total - 1) : 1;
  const angleDeg = ANGLE_START + (ANGLE_END - ANGLE_START) * Math.pow(t, 0.85);
  const radius = RADIUS_START + (RADIUS_END - RADIUS_START) * Math.pow(t, 1.15);
  const angleRad = (angleDeg * Math.PI) / 180;
  return {
    dx: radius * Math.cos(angleRad),
    dy: radius * Math.sin(angleRad),
    rotation: index % 2 === 0 ? -5 : 5,
  };
}

interface PetalSpec {
  key: string;
  label: string;
  accessibilityLabel: string;
  accessibilityHint?: string;
  presetType?: TypeFilter;
  color: { background: string; text: string } | null; // null = neutral ("All types")
}

function getPetalColor(filter: TypeFilter): {
  background: string;
  text: string;
} {
  return filter.kind === 'builtin'
    ? getItemTypeColor(filter.value)
    : getCustomTypeColor(filter.label);
}

function getPetalLabel(filter: TypeFilter): string {
  return filter.kind === 'builtin'
    ? (BUILT_IN_LABELS.get(filter.value) ?? filter.value)
    : filter.label;
}

function typeFilterKey(filter: TypeFilter): string {
  return filter.kind === 'builtin'
    ? `builtin:${filter.value}`
    : `custom:${normalizeTypeKey(filter.label)}`;
}

function Petal({
  index,
  total,
  spec,
  openProgress,
  onPress,
}: {
  index: number;
  total: number;
  spec: PetalSpec;
  openProgress: SharedValue<number>;
  onPress: () => void;
}) {
  const { dx, dy, rotation } = computePetalOffset(index, total);
  const localStart = index * STAGGER;
  const localEnd = localStart + LOCAL_SPAN;

  const animatedStyle = useAnimatedStyle(() => {
    const localProgress = interpolate(
      openProgress.value,
      [localStart, localEnd],
      [0, 1],
      Extrapolation.CLAMP
    );
    return {
      opacity: localProgress,
      transform: [
        // Mirrored for the FAB's bottom-right position: the petal still
        // grows outward from the FAB, but the resting spot is `dx` to the
        // *left* of the FAB (via the `right`-anchored style below), so the
        // animation approaches from +dx instead of -dx.
        { translateX: interpolate(localProgress, [0, 1], [dx, 0]) },
        { translateY: interpolate(localProgress, [0, 1], [dy, 0]) },
        { scale: interpolate(localProgress, [0, 1], [0.3, 1]) },
        { rotate: `${rotation}deg` },
      ],
    };
  });

  const isNeutral = spec.color === null;

  return (
    <Animated.View
      style={[
        styles.petalWrapper,
        { right: FAB_ORIGIN_X + dx, bottom: FAB_ORIGIN_Y + dy },
        animatedStyle,
      ]}
    >
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={spec.accessibilityLabel}
        accessibilityHint={spec.accessibilityHint}
        hitSlop={4}
        style={({ pressed }) => [
          styles.petal,
          isNeutral
            ? styles.petalNeutral
            : { backgroundColor: spec.color!.background },
          pressed && styles.petalPressed,
        ]}
      >
        <Text
          style={[
            styles.petalLabel,
            { color: isNeutral ? colors.textPrimary : spec.color!.text },
          ]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {spec.label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

export default function PetalQuickAdd({
  isOpen,
  onOpenChange,
  onSelect,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (presetType?: TypeFilter) => void;
}) {
  const { options } = useQuickAddPreferences();
  const reducedMotion = useReducedMotion();
  const openProgress = useSharedValue(0);
  // Purely a JS-thread tap-safety gate (drives the `pointerEvents` prop,
  // which isn't an animatable style) — not read from any worklet, so a
  // plain useState is correct here, not a Reanimated shared value.
  const [petalsInteractive, setPetalsInteractive] = useState(false);

  // Drives the animation off the controlled `isOpen` prop — HomeScreen owns
  // this state (needed for hiding Library from screen readers the instant
  // the bloom opens), PetalQuickAdd only reacts to it.
  useEffect(() => {
    if (isOpen) {
      setPetalsInteractive(false); // disabled the instant opening begins
      openProgress.value = withTiming(
        1,
        {
          duration: reducedMotion ? 0 : OPEN_DURATION,
          easing: Easing.out(Easing.cubic),
        },
        (finished) => {
          // Only a *completed* open enables taps — an interrupted
          // (retargeted) animation reports finished:false, so a reversed
          // close can never land here and re-enable interaction in the
          // wrong position.
          if (finished) {
            runOnJS(setPetalsInteractive)(true);
          }
        }
      );
    } else {
      setPetalsInteractive(false); // disabled the instant closing begins
      openProgress.value = withTiming(0, {
        duration: reducedMotion ? 0 : CLOSE_DURATION,
        easing: Easing.in(Easing.cubic),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, reducedMotion]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        onOpenChange(false);
        return true;
      }
    );
    return () => subscription.remove();
  }, [isOpen, onOpenChange]);

  const fabIconStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${interpolate(openProgress.value, [0, 1], [0, 45])}deg` },
    ],
  }));

  function handleSelect(presetType: TypeFilter | undefined) {
    // Closing on selection is instant, not animated — the screen is
    // departing, so there's nothing to see, and this guarantees the bloom
    // is never still visually open if the user navigates back.
    setPetalsInteractive(false);
    openProgress.value = 0;
    onOpenChange(false);
    onSelect(presetType);
  }

  const petals: PetalSpec[] = [
    ...options.map((filter) => {
      const label = getPetalLabel(filter);
      return {
        key: typeFilterKey(filter),
        label,
        accessibilityLabel: `Add ${label}`,
        presetType: filter,
        color: getPetalColor(filter),
      };
    }),
    {
      key: 'all-types',
      label: ALL_TYPES_LABEL,
      accessibilityLabel: ALL_TYPES_LABEL,
      accessibilityHint: 'Opens the full Add form with all types',
      presetType: undefined,
      color: null,
    },
  ];

  return (
    <View style={styles.root} pointerEvents="box-none">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Close quick add options"
        style={styles.tapCatcher}
        pointerEvents={isOpen ? 'auto' : 'none'}
        onPress={() => onOpenChange(false)}
      />

      <View
        style={styles.petalGroup}
        pointerEvents={petalsInteractive ? 'auto' : 'none'}
      >
        {petals.map((spec, index) => (
          <Petal
            key={spec.key}
            index={index}
            total={petals.length}
            spec={spec}
            openProgress={openProgress}
            onPress={() => handleSelect(spec.presetType)}
          />
        ))}
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={isOpen ? 'Close quick add' : 'Add'}
        accessibilityState={{ expanded: isOpen }}
        hitSlop={8}
        testID="petal-fab"
        onPress={() => onOpenChange(!isOpen)}
        style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
      >
        <Animated.View style={fabIconStyle}>
          <View style={styles.fabIconBarVertical} />
          <View style={styles.fabIconBarHorizontal} />
        </Animated.View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  tapCatcher: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  petalGroup: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  petalWrapper: {
    position: 'absolute',
  },
  petal: {
    height: PETAL_HEIGHT,
    minWidth: 64,
    maxWidth: 128,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  petalNeutral: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
  },
  petalPressed: {
    opacity: 0.85,
  },
  petalLabel: {
    ...typography.button,
  },
  fab: {
    position: 'absolute',
    right: FAB_MARGIN_RIGHT,
    bottom: FAB_MARGIN_BOTTOM,
    width: FAB_DIAMETER,
    height: FAB_DIAMETER,
    borderRadius: radii.pill,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabPressed: {
    backgroundColor: colors.accentPressed,
  },
  fabIconBarVertical: {
    position: 'absolute',
    width: 2.5,
    height: 18,
    left: -1.25,
    top: -9,
    borderRadius: 2,
    backgroundColor: colors.cream,
  },
  fabIconBarHorizontal: {
    position: 'absolute',
    width: 18,
    height: 2.5,
    left: -9,
    top: -1.25,
    borderRadius: 2,
    backgroundColor: colors.cream,
  },
});
