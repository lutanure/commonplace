import { fireEvent, render, screen } from '@testing-library/react-native';
import { Alert } from 'react-native';
import type { Item } from '../models';
import { useItems } from '../state/ItemsContext';
import ItemCard from './ItemCard';

jest.mock('../state/ItemsContext', () => ({
  useItems: jest.fn(),
}));

const mockedUseItems = useItems as jest.Mock;

function makeItem(overrides: Partial<Item> = {}): Item {
  return {
    id: 'item-1',
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

function mockItemsState(overrides: Partial<ReturnType<typeof useItems>> = {}) {
  const state = {
    items: [],
    isLoading: false,
    error: null,
    refresh: jest.fn(),
    addItem: jest.fn(),
    updateItem: jest.fn().mockResolvedValue(undefined),
    deleteItem: jest.fn().mockResolvedValue(undefined),
    getItemById: jest.fn(),
    ...overrides,
  };
  mockedUseItems.mockReturnValue(state);
  return state;
}

beforeEach(() => {
  mockedUseItems.mockReset();
});

describe('ItemCard snippet priority', () => {
  it('prefers the personal note over summary/relevantInfo/originalText', () => {
    mockItemsState();
    render(
      <ItemCard
        item={makeItem({
          userNote: 'My own note',
          summary: 'AI summary',
          originalText: 'Original captured text',
        })}
      />
    );
    expect(screen.getByText('My own note')).toBeTruthy();
    expect(screen.queryByText('AI summary')).toBeNull();
  });

  it('falls back to summary when there is no personal note', () => {
    mockItemsState();
    render(
      <ItemCard
        item={makeItem({ summary: 'AI summary', originalText: 'Original' })}
      />
    );
    expect(screen.getByText('AI summary')).toBeTruthy();
  });

  it('falls back to originalText when there is neither a note nor a summary', () => {
    mockItemsState();
    render(<ItemCard item={makeItem({ originalText: 'Original text' })} />);
    expect(screen.getByText('Original text')).toBeTruthy();
  });
});

describe('ItemCard pinning', () => {
  it('shows a pinned indicator when the item is pinned', () => {
    mockItemsState();
    render(<ItemCard item={makeItem({ isPinned: true })} />);
    expect(screen.getByText('Pinned')).toBeTruthy();
  });

  it('does not show a pinned indicator otherwise', () => {
    mockItemsState();
    render(<ItemCard item={makeItem({ isPinned: false })} />);
    expect(screen.queryByText('Pinned')).toBeNull();
  });

  it('pressing the reveal-left Pin action pins an unpinned item', () => {
    const state = mockItemsState();
    render(<ItemCard item={makeItem({ id: 'item-1', isPinned: false })} />);

    fireEvent.press(screen.getByLabelText('Pin item'));

    expect(state.updateItem).toHaveBeenCalledWith('item-1', {
      isPinned: true,
    });
  });

  it('pressing the reveal-left action unpins a pinned item', () => {
    const state = mockItemsState();
    render(<ItemCard item={makeItem({ id: 'item-1', isPinned: true })} />);

    fireEvent.press(screen.getByLabelText('Unpin item'));

    expect(state.updateItem).toHaveBeenCalledWith('item-1', {
      isPinned: false,
    });
  });
});

describe('ItemCard deletion', () => {
  it('asks for confirmation before deleting, and does not delete on cancel', () => {
    const state = mockItemsState();
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    render(<ItemCard item={makeItem({ id: 'item-1' })} />);

    fireEvent.press(screen.getByLabelText('Delete item'));

    expect(alertSpy).toHaveBeenCalledWith(
      'Delete this item?',
      'This action cannot be undone.',
      expect.any(Array)
    );
    expect(state.deleteItem).not.toHaveBeenCalled();
  });

  it('deletes only once the destructive confirmation option is chosen', () => {
    const state = mockItemsState();
    jest.spyOn(Alert, 'alert').mockImplementation((_title, _msg, buttons) => {
      const confirm = buttons?.find((button) => button.text === 'Delete');
      confirm?.onPress?.();
    });
    render(<ItemCard item={makeItem({ id: 'item-1' })} />);

    fireEvent.press(screen.getByLabelText('Delete item'));

    expect(state.deleteItem).toHaveBeenCalledWith('item-1');
  });
});

describe('ItemCard navigation', () => {
  it('calls onPress when the card content is tapped', () => {
    mockItemsState();
    const onPress = jest.fn();
    render(<ItemCard item={makeItem({ title: 'Tap me' })} onPress={onPress} />);

    fireEvent.press(screen.getByText('Tap me'));

    expect(onPress).toHaveBeenCalled();
  });
});
