import { fireEvent, render, screen } from '@testing-library/react-native';
import type { Item } from '../models';
import { useItems } from '../state/ItemsContext';
import { useQuickAddPreferences } from '../state/QuickAddPreferencesContext';
import HomeScreen from './HomeScreen';

jest.mock('../state/ItemsContext', () => ({
  useItems: jest.fn(),
}));
jest.mock('../state/QuickAddPreferencesContext', () => ({
  useQuickAddPreferences: jest.fn(),
}));

const mockedUseItems = useItems as jest.Mock;
const mockedUseQuickAddPreferences = useQuickAddPreferences as jest.Mock;

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

function renderHomeScreen() {
  const navigation = { navigate: jest.fn() };
  const route = { key: 'Library', name: 'Library' as const };
  render(
    <HomeScreen navigation={navigation as never} route={route as never} />
  );
  return { navigation };
}

function mockItemsState(overrides: Partial<ReturnType<typeof useItems>> = {}) {
  mockedUseItems.mockReturnValue({
    items: [],
    isLoading: false,
    error: null,
    refresh: jest.fn(),
    addItem: jest.fn(),
    updateItem: jest.fn(),
    deleteItem: jest.fn(),
    getItemById: jest.fn(),
    ...overrides,
  });
}

beforeEach(() => {
  mockedUseItems.mockReset();

  mockedUseQuickAddPreferences.mockReset();
  mockedUseQuickAddPreferences.mockReturnValue({
    options: [
      { kind: 'builtin', value: 'idea' },
      { kind: 'builtin', value: 'note' },
      { kind: 'builtin', value: 'book' },
    ],
    isLoading: false,
    setOptions: jest.fn(),
  });
});

describe('HomeScreen', () => {
  it('renders the Petal Quick Add FAB with one petal per quick-add option', () => {
    mockItemsState({ items: [] });
    renderHomeScreen();

    expect(screen.getByTestId('petal-fab')).toBeTruthy();
    expect(screen.getByLabelText('Add Idea')).toBeTruthy();
    expect(screen.getByLabelText('Add Note')).toBeTruthy();
    expect(screen.getByLabelText('Add Book')).toBeTruthy();
    expect(screen.getByLabelText('All types')).toBeTruthy();
  });

  it('shows a loading indicator while items are loading', () => {
    mockItemsState({ isLoading: true, items: [] });
    renderHomeScreen();
    expect(screen.getByText('Recently saved')).toBeTruthy();
  });

  it('shows an error state with a working retry button', () => {
    const refresh = jest.fn();
    mockItemsState({ error: 'network down', refresh });
    renderHomeScreen();

    expect(screen.getByText('Could not load your library.')).toBeTruthy();
    fireEvent.press(screen.getByText('Retry'));
    expect(refresh).toHaveBeenCalled();
  });

  it('shows the empty-library state when there are no items at all', () => {
    mockItemsState({ items: [] });
    renderHomeScreen();
    expect(screen.getByText('Nothing saved yet.')).toBeTruthy();
  });

  it('renders every item and no filter chips are shown by default beyond the item count', () => {
    mockItemsState({
      items: [
        makeItem({ id: 'dune', title: 'Dune', type: 'movie' }),
        makeItem({ id: 'foundation', title: 'Foundation', type: 'book' }),
      ],
    });
    renderHomeScreen();

    expect(screen.getByText('Dune')).toBeTruthy();
    expect(screen.getByText('Foundation')).toBeTruthy();
    expect(screen.getByText('Recently saved — 2 items')).toBeTruthy();
  });

  it('narrows the list as the user types in the search box', () => {
    mockItemsState({
      items: [
        makeItem({ id: 'dune', title: 'Dune', type: 'movie' }),
        makeItem({ id: 'foundation', title: 'Foundation', type: 'book' }),
      ],
    });
    renderHomeScreen();

    fireEvent.changeText(
      screen.getByPlaceholderText('Search your memory'),
      'dune'
    );

    expect(screen.getByText('Dune')).toBeTruthy();
    expect(screen.queryByText('Foundation')).toBeNull();
    expect(screen.getByText('1 result')).toBeTruthy();
  });

  it('narrows the list by tapping a type filter chip', () => {
    mockItemsState({
      items: [
        makeItem({ id: 'dune', title: 'Dune', type: 'movie' }),
        makeItem({ id: 'foundation', title: 'Foundation', type: 'book' }),
      ],
    });
    renderHomeScreen();

    fireEvent.press(screen.getByTestId('filter-chip-builtin:book'));

    expect(screen.getByText('Foundation')).toBeTruthy();
    expect(screen.queryByText('Dune')).toBeNull();
  });

  it('shows a no-results state when filters exclude everything, with a working clear action', () => {
    mockItemsState({
      items: [makeItem({ id: 'dune', title: 'Dune', type: 'movie' })],
    });
    renderHomeScreen();

    fireEvent.changeText(
      screen.getByPlaceholderText('Search your memory'),
      'nonexistent'
    );

    expect(screen.getByText('No matches for “nonexistent”.')).toBeTruthy();

    fireEvent.press(screen.getByText('Clear filters'));

    expect(screen.getByText('Dune')).toBeTruthy();
  });
});
