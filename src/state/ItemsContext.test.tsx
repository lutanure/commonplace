import { act, renderHook, waitFor } from '@testing-library/react-native';
import * as itemsRepository from '../data/itemsRepository';
import type { Item } from '../models';
import { ItemsProvider, useItems } from './ItemsContext';

jest.mock('../data/itemsRepository', () => ({
  listItems: jest.fn(),
  createItem: jest.fn(),
  updateItem: jest.fn(),
  deleteItem: jest.fn(),
}));

const mockedListItems = itemsRepository.listItems as jest.Mock;
const mockedCreateItem = itemsRepository.createItem as jest.Mock;
const mockedUpdateItem = itemsRepository.updateItem as jest.Mock;
const mockedDeleteItem = itemsRepository.deleteItem as jest.Mock;

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

beforeEach(() => {
  mockedListItems.mockReset();
  mockedCreateItem.mockReset();
  mockedUpdateItem.mockReset();
  mockedDeleteItem.mockReset();
});

describe('ItemsContext', () => {
  it('starts loading, then loads items from the repository', async () => {
    mockedListItems.mockResolvedValue([makeItem({ id: 'item-1' })]);
    const { result } = renderItemsHook();

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.items).toEqual([makeItem({ id: 'item-1' })]);
    expect(result.current.error).toBeNull();
  });

  it('sets an error when the initial load fails', async () => {
    mockedListItems.mockRejectedValue(new Error('network down'));
    const { result } = renderItemsHook();

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBe('network down');
    expect(result.current.items).toEqual([]);
  });

  it('refresh() re-fetches and clears a previous error', async () => {
    mockedListItems.mockRejectedValueOnce(new Error('network down'));
    const { result } = renderItemsHook();
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error).toBe('network down');

    mockedListItems.mockResolvedValueOnce([makeItem({ id: 'item-1' })]);
    await act(async () => {
      await result.current.refresh();
    });

    expect(result.current.error).toBeNull();
    expect(result.current.items).toEqual([makeItem({ id: 'item-1' })]);
  });

  it('addItem prepends the repository-created item to the collection', async () => {
    mockedListItems.mockResolvedValue([makeItem({ id: 'existing' })]);
    const { result } = renderItemsHook();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const created = makeItem({ id: 'new-item', title: 'New item' });
    mockedCreateItem.mockResolvedValue(created);

    await act(async () => {
      await result.current.addItem({
        title: 'New item',
        type: 'idea',
        captureType: 'manual',
        tags: [],
      });
    });

    expect(mockedCreateItem).toHaveBeenCalledWith({
      title: 'New item',
      type: 'idea',
      captureType: 'manual',
      tags: [],
    });
    expect(result.current.items).toEqual([
      created,
      makeItem({ id: 'existing' }),
    ]);
  });

  it('updateItem replaces the matching item with the repository-returned row', async () => {
    mockedListItems.mockResolvedValue([makeItem({ id: 'item-1' })]);
    const { result } = renderItemsHook();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const updated = makeItem({ id: 'item-1', title: 'Updated title' });
    mockedUpdateItem.mockResolvedValue(updated);

    await act(async () => {
      await result.current.updateItem('item-1', { title: 'Updated title' });
    });

    expect(mockedUpdateItem).toHaveBeenCalledWith('item-1', {
      title: 'Updated title',
    });
    expect(result.current.getItemById('item-1')).toEqual(updated);
  });

  it('deleteItem removes the matching item after the repository call resolves', async () => {
    mockedListItems.mockResolvedValue([makeItem({ id: 'item-1' })]);
    const { result } = renderItemsHook();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    mockedDeleteItem.mockResolvedValue(undefined);

    await act(async () => {
      await result.current.deleteItem('item-1');
    });

    expect(mockedDeleteItem).toHaveBeenCalledWith('item-1');
    expect(result.current.getItemById('item-1')).toBeUndefined();
  });

  it('addItem/updateItem/deleteItem reject and leave state unchanged on repository failure', async () => {
    mockedListItems.mockResolvedValue([makeItem({ id: 'item-1' })]);
    const { result } = renderItemsHook();
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    const before = result.current.items;

    mockedCreateItem.mockRejectedValue(new Error('insert failed'));
    await expect(
      act(async () => {
        await result.current.addItem({
          title: 'x',
          type: 'idea',
          captureType: 'manual',
          tags: [],
        });
      })
    ).rejects.toThrow('insert failed');
    expect(result.current.items).toEqual(before);
  });
});
