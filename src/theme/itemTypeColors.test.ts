import { colors } from './colors';
import {
  getCustomTypeColor,
  getItemDisplayColor,
  getItemTypeColor,
} from './itemTypeColors';

describe('getCustomTypeColor', () => {
  it('always returns the same color for the same label', () => {
    const first = getCustomTypeColor('Research Paper');
    const second = getCustomTypeColor('Research Paper');
    expect(second).toEqual(first);
  });

  it('is case- and whitespace-insensitive, like the rest of the custom-type model', () => {
    expect(getCustomTypeColor('Research Paper')).toEqual(
      getCustomTypeColor('  research paper  ')
    );
  });

  it('does not use runtime randomness — repeated calls across labels are stable', () => {
    const labels = ['Recipe box', 'Wishlist', 'Research paper', 'Workout'];
    const first = labels.map(getCustomTypeColor);
    const second = labels.map(getCustomTypeColor);
    expect(second).toEqual(first);
  });

  it('spreads different labels across more than one palette color', () => {
    const labels = [
      'Recipe box',
      'Wishlist',
      'Research paper',
      'Workout',
      'Gift idea',
      'Travel plan',
      'Home project',
      'Reading list',
    ];
    const distinctColors = new Set(
      labels.map((label) => getCustomTypeColor(label).background)
    );
    expect(distinctColors.size).toBeGreaterThan(1);
  });

  it('falls back to the built-in "other" color for a blank label', () => {
    expect(getCustomTypeColor('   ')).toEqual(getItemTypeColor('other'));
  });
});

describe('getItemDisplayColor', () => {
  it('uses the deterministic custom-type color for a labeled custom type', () => {
    const item = { type: 'other' as const, customTypeLabel: 'Research paper' };
    expect(getItemDisplayColor(item)).toEqual(
      getCustomTypeColor('Research paper')
    );
  });

  it('falls back to the fixed "other" color when a custom type has no label', () => {
    const item = { type: 'other' as const, customTypeLabel: undefined };
    expect(getItemDisplayColor(item)).toEqual({
      background: colors.clay,
      text: colors.cream,
    });
  });

  it('uses the fixed built-in color for a non-custom type', () => {
    const item = { type: 'movie' as const, customTypeLabel: undefined };
    expect(getItemDisplayColor(item)).toEqual(getItemTypeColor('movie'));
  });
});
