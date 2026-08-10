import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import { Alert } from 'react-native';
import type { Item } from '../models';
import { useBuiltInTypePreferences } from '../state/BuiltInTypePreferencesContext';
import { useItems } from '../state/ItemsContext';
import ManageTypesScreen from './ManageTypesScreen';

jest.mock('../state/ItemsContext', () => ({
  useItems: jest.fn(),
}));
jest.mock('../state/BuiltInTypePreferencesContext', () => ({
  useBuiltInTypePreferences: jest.fn(),
}));

const mockedUseItems = useItems as jest.Mock;
const mockedUseBuiltInTypePreferences = useBuiltInTypePreferences as jest.Mock;

function makeItem(overrides: Partial<Item> = {}): Item {
  return {
    id: 'item-1',
    title: 'Untitled',
    type: 'other',
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
    refresh: jest.fn().mockResolvedValue(undefined),
    addItem: jest.fn(),
    updateItem: jest.fn().mockResolvedValue(undefined),
    deleteItem: jest.fn(),
    getItemById: jest.fn(),
    ...overrides,
  };
  mockedUseItems.mockReturnValue(state);
  return state;
}

function mockBuiltInTypePreferences(
  overrides: Partial<ReturnType<typeof useBuiltInTypePreferences>> = {}
) {
  const state = {
    disabledTypes: [],
    isLoading: false,
    isTypeEnabled: jest.fn(() => true),
    setTypeEnabled: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  };
  mockedUseBuiltInTypePreferences.mockReturnValue(state);
  return state;
}

function renderScreen() {
  const navigation = { goBack: jest.fn() };
  const route = { key: 'ManageTypes', name: 'ManageTypes' as const };
  render(
    <ManageTypesScreen
      navigation={navigation as never}
      route={route as never}
    />
  );
  return { navigation };
}

beforeEach(() => {
  mockedUseItems.mockReset();
  mockedUseBuiltInTypePreferences.mockReset();
  mockBuiltInTypePreferences();
});

describe('ManageTypesScreen', () => {
  it('lists built-in types and shows an empty state when there are no custom types', () => {
    mockItemsState({ items: [] });
    renderScreen();

    expect(screen.getByText('Book')).toBeTruthy();
    expect(screen.getByText('Movie')).toBeTruthy();
    expect(
      screen.getByText("You haven't created any custom types yet.")
    ).toBeTruthy();
  });

  it('lists distinct custom types derived from items, each removable', () => {
    mockItemsState({
      items: [
        makeItem({ id: 'a', type: 'other', customTypeLabel: 'Research Paper' }),
        makeItem({ id: 'b', type: 'other', customTypeLabel: 'research paper' }),
      ],
    });
    renderScreen();

    expect(screen.getByText('Research Paper')).toBeTruthy();
    expect(screen.getByLabelText('Remove Research Paper')).toBeTruthy();
  });

  it('does not offer a remove control for built-in types', () => {
    mockItemsState({ items: [] });
    renderScreen();

    expect(screen.queryByLabelText('Remove Book')).toBeNull();
  });

  it('confirms before removing, stating how many items are affected and that they are not deleted', () => {
    mockItemsState({
      items: [
        makeItem({ id: 'a', type: 'other', customTypeLabel: 'Research Paper' }),
        makeItem({ id: 'b', type: 'other', customTypeLabel: 'Research Paper' }),
      ],
    });
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    renderScreen();

    fireEvent.press(screen.getByLabelText('Remove Research Paper'));

    expect(alertSpy).toHaveBeenCalledWith(
      'Remove "Research Paper"?',
      'This type is used by 2 items. The items will not be deleted, but their type will become "Other".',
      expect.any(Array)
    );
  });

  it('clears customTypeLabel on every affected item and refreshes, without deleting anything', async () => {
    const state = mockItemsState({
      items: [
        makeItem({ id: 'a', type: 'other', customTypeLabel: 'Research Paper' }),
        makeItem({ id: 'b', type: 'other', customTypeLabel: 'Research Paper' }),
      ],
    });
    jest.spyOn(Alert, 'alert').mockImplementation((_title, _msg, buttons) => {
      const confirm = buttons?.find((button) => button.text === 'Remove');
      confirm?.onPress?.();
    });
    renderScreen();

    fireEvent.press(screen.getByLabelText('Remove Research Paper'));

    await waitFor(() => expect(state.refresh).toHaveBeenCalled());

    expect(state.updateItem).toHaveBeenCalledWith('a', {
      customTypeLabel: undefined,
    });
    expect(state.updateItem).toHaveBeenCalledWith('b', {
      customTypeLabel: undefined,
    });
    expect(state.deleteItem).not.toHaveBeenCalled();
  });

  it('refreshes and reports honestly when only some affected items update successfully', async () => {
    const updateItem = jest
      .fn()
      .mockImplementationOnce(() => Promise.resolve())
      .mockImplementationOnce(() => Promise.reject(new Error('offline')));
    const state = mockItemsState({
      items: [
        makeItem({ id: 'a', type: 'other', customTypeLabel: 'Research Paper' }),
        makeItem({ id: 'b', type: 'other', customTypeLabel: 'Research Paper' }),
      ],
      updateItem,
    });
    const alertSpy = jest
      .spyOn(Alert, 'alert')
      .mockImplementation((_title, _msg, buttons) => {
        const confirm = buttons?.find((button) => button.text === 'Remove');
        confirm?.onPress?.();
      });
    renderScreen();

    fireEvent.press(screen.getByLabelText('Remove Research Paper'));

    await waitFor(() => expect(state.refresh).toHaveBeenCalled());

    expect(alertSpy).toHaveBeenCalledWith(
      "Couldn't fully remove this type",
      'Only 1 of 2 items were updated. Please try again.'
    );
  });

  it('does not confirm removal when the user cancels', () => {
    const state = mockItemsState({
      items: [
        makeItem({ id: 'a', type: 'other', customTypeLabel: 'Research Paper' }),
      ],
    });
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    renderScreen();

    fireEvent.press(screen.getByLabelText('Remove Research Paper'));

    expect(state.updateItem).not.toHaveBeenCalled();
    expect(state.refresh).not.toHaveBeenCalled();
  });
});

describe('ManageTypesScreen built-in type toggles', () => {
  it('renders a toggle for every built-in type, reflecting its enabled state', () => {
    mockItemsState({ items: [] });
    mockBuiltInTypePreferences({
      disabledTypes: ['article'],
      isTypeEnabled: jest.fn((type) => type !== 'article'),
    });
    renderScreen();

    expect(screen.getByLabelText('Idea type').props.value).toBe(true);
    expect(screen.getByLabelText('Article type').props.value).toBe(false);
  });

  it('toggling a built-in type off calls setTypeEnabled(type, false)', () => {
    mockItemsState({ items: [] });
    const state = mockBuiltInTypePreferences();
    renderScreen();

    fireEvent(screen.getByLabelText('Article type'), 'valueChange', false);

    expect(state.setTypeEnabled).toHaveBeenCalledWith('article', false);
  });

  it('toggling a disabled built-in type back on calls setTypeEnabled(type, true)', () => {
    mockItemsState({ items: [] });
    const state = mockBuiltInTypePreferences({
      disabledTypes: ['article'],
      isTypeEnabled: jest.fn((type) => type !== 'article'),
    });
    renderScreen();

    fireEvent(screen.getByLabelText('Article type'), 'valueChange', true);

    expect(state.setTypeEnabled).toHaveBeenCalledWith('article', true);
  });

  it('never offers a toggle for custom types — only Remove', () => {
    mockItemsState({
      items: [
        makeItem({ id: 'a', type: 'other', customTypeLabel: 'Research Paper' }),
      ],
    });
    mockBuiltInTypePreferences();
    renderScreen();

    expect(screen.queryByLabelText('Research Paper type')).toBeNull();
    expect(screen.getByLabelText('Remove Research Paper')).toBeTruthy();
  });
});
