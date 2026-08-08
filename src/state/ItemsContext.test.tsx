import { act, renderHook } from '@testing-library/react-native';
import type { Item } from '../models';
import { ItemsProvider, useItems } from './ItemsContext';

// Distinct from the seeded mockItems ids ('item-1'..'item-5') so these
// tests can't accidentally collide with real seed data.
function makeItem(overrides: Partial<Item> = {}): Item {
  return {
    id: 'test-item',
    title: 'Test item',
    type: 'idea',
    createdAt: '2020-01-01T00:00:00.000Z',
    updatedAt: '2020-01-01T00:00:00.000Z',
    captureType: 'manual',
    tags: [],
    ...overrides,
  };
}

function renderItemsHook() {
  return renderHook(() => useItems(), { wrapper: ItemsProvider });
}

describe('ItemsContext', () => {
  it('starts seeded with the existing mock items', () => {
    const { result } = renderItemsHook();
    expect(result.current.items.length).toBeGreaterThan(0);
  });

  it('addItem prepends the new item to the collection', () => {
    const { result } = renderItemsHook();
    const before = result.current.items.length;
    const newItem = makeItem({ id: 'test-add', title: 'New item' });

    act(() => {
      result.current.addItem(newItem);
    });

    expect(result.current.items).toHaveLength(before + 1);
    expect(result.current.items[0]).toEqual(newItem);
  });

  it('updateItem merges only the given fields, preserving id/createdAt and refreshing updatedAt', () => {
    const { result } = renderItemsHook();
    const original = makeItem({
      id: 'test-update',
      title: 'Original title',
      category: 'ideas',
    });

    act(() => {
      result.current.addItem(original);
    });
    act(() => {
      result.current.updateItem('test-update', { title: 'Updated title' });
    });

    const updated = result.current.getItemById('test-update');
    expect(updated?.title).toBe('Updated title');
    expect(updated?.category).toBe('ideas');
    expect(updated?.id).toBe('test-update');
    expect(updated?.createdAt).toBe('2020-01-01T00:00:00.000Z');
    expect(updated?.updatedAt).not.toBe('2020-01-01T00:00:00.000Z');
  });

  it('updateItem on an unknown id is a no-op', () => {
    const { result } = renderItemsHook();
    const before = result.current.items;

    act(() => {
      result.current.updateItem('does-not-exist', { title: 'x' });
    });

    expect(result.current.items).toEqual(before);
  });

  it('deleteItem removes the matching item', () => {
    const { result } = renderItemsHook();

    act(() => {
      result.current.addItem(makeItem({ id: 'test-delete' }));
    });
    expect(result.current.getItemById('test-delete')).toBeDefined();

    act(() => {
      result.current.deleteItem('test-delete');
    });

    expect(result.current.getItemById('test-delete')).toBeUndefined();
  });

  it('deleteItem on an unknown id is a no-op', () => {
    const { result } = renderItemsHook();
    const before = result.current.items;

    act(() => {
      result.current.deleteItem('does-not-exist');
    });

    expect(result.current.items).toEqual(before);
  });
});
