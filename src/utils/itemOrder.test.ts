import type { Item } from '../models';
import { sortItemsForLibrary } from './itemOrder';

function makeItem(overrides: Partial<Item> = {}): Item {
  return {
    id: 'item',
    title: 'Untitled',
    type: 'note',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    captureType: 'manual',
    tags: [],
    isPinned: false,
    ...overrides,
  };
}

describe('sortItemsForLibrary', () => {
  it('puts pinned items ahead of unpinned ones regardless of recency', () => {
    const oldPinned = makeItem({
      id: 'old-pinned',
      isPinned: true,
      pinnedAt: '2026-01-01T00:00:00.000Z',
      createdAt: '2020-01-01T00:00:00.000Z',
    });
    const newUnpinned = makeItem({
      id: 'new-unpinned',
      isPinned: false,
      createdAt: '2026-06-01T00:00:00.000Z',
    });

    const sorted = sortItemsForLibrary([newUnpinned, oldPinned]);

    expect(sorted.map((item) => item.id)).toEqual([
      'old-pinned',
      'new-unpinned',
    ]);
  });

  it('orders multiple pinned items by most-recently-pinned first', () => {
    const pinnedEarlier = makeItem({
      id: 'pinned-earlier',
      isPinned: true,
      pinnedAt: '2026-01-01T00:00:00.000Z',
    });
    const pinnedLater = makeItem({
      id: 'pinned-later',
      isPinned: true,
      pinnedAt: '2026-02-01T00:00:00.000Z',
    });

    const sorted = sortItemsForLibrary([pinnedEarlier, pinnedLater]);

    expect(sorted.map((item) => item.id)).toEqual([
      'pinned-later',
      'pinned-earlier',
    ]);
  });

  it('orders unpinned items by recency (newest first), same as before pinning existed', () => {
    const older = makeItem({
      id: 'older',
      createdAt: '2026-01-01T00:00:00.000Z',
    });
    const newer = makeItem({
      id: 'newer',
      createdAt: '2026-02-01T00:00:00.000Z',
    });

    const sorted = sortItemsForLibrary([older, newer]);

    expect(sorted.map((item) => item.id)).toEqual(['newer', 'older']);
  });

  it('does not mutate the input array', () => {
    const items = [
      makeItem({ id: 'a', createdAt: '2026-01-01T00:00:00.000Z' }),
      makeItem({ id: 'b', createdAt: '2026-02-01T00:00:00.000Z' }),
    ];
    const original = [...items];

    sortItemsForLibrary(items);

    expect(items).toEqual(original);
  });
});
