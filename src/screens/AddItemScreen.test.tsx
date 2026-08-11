import { render, screen } from '@testing-library/react-native';
import { useItems } from '../state/ItemsContext';
import AddItemScreen from './AddItemScreen';

jest.mock('../state/ItemsContext', () => ({
  useItems: jest.fn(),
}));
jest.mock('../state/BuiltInTypePreferencesContext', () => ({
  useBuiltInTypePreferences: jest.fn(() => ({
    disabledTypes: [],
    isLoading: false,
    isTypeEnabled: () => true,
    setTypeEnabled: jest.fn(),
  })),
}));

// react-native-keyboard-controller isn't linked in the Jest environment
// (native module) — swap its scroll view for the plain RN one, matching
// ItemForm.test.tsx's own setup.
jest.mock('react-native-keyboard-controller', () => {
  const { ScrollView } = jest.requireActual('react-native');
  return { KeyboardAwareScrollView: ScrollView };
});

const mockedUseItems = useItems as jest.Mock;

function renderAddItemScreen(presetType?: {
  kind: string;
  value?: string;
  label?: string;
}) {
  const navigation = { navigate: jest.fn(), goBack: jest.fn() };
  const route = {
    key: 'AddItem',
    name: 'AddItem' as const,
    params: presetType ? { presetType } : undefined,
  };
  render(
    <AddItemScreen navigation={navigation as never} route={route as never} />
  );
  return { navigation };
}

beforeEach(() => {
  mockedUseItems.mockReset();
  mockedUseItems.mockReturnValue({ items: [], addItem: jest.fn() });
});

describe('AddItemScreen — preset type', () => {
  it('defaults to Idea when no route param is given', () => {
    renderAddItemScreen();
    expect(screen.getAllByText('Idea').length).toBeGreaterThan(0);
  });

  it('preselects a built-in preset type from the route param', () => {
    renderAddItemScreen({ kind: 'builtin', value: 'book' });
    expect(screen.getAllByText('Book').length).toBeGreaterThan(0);
  });

  it('preselects a custom preset type from the route param', () => {
    renderAddItemScreen({ kind: 'custom', label: 'Research Paper' });
    expect(screen.getAllByText('Research Paper').length).toBeGreaterThan(0);
  });
});
