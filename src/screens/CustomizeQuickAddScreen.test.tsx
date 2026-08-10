import { render, screen } from '@testing-library/react-native';
import { useBuiltInTypePreferences } from '../state/BuiltInTypePreferencesContext';
import { useItems } from '../state/ItemsContext';
import { useQuickAddPreferences } from '../state/QuickAddPreferencesContext';
import CustomizeQuickAddScreen from './CustomizeQuickAddScreen';

jest.mock('../state/ItemsContext', () => ({ useItems: jest.fn() }));
jest.mock('../state/BuiltInTypePreferencesContext', () => ({
  useBuiltInTypePreferences: jest.fn(),
}));
jest.mock('../state/QuickAddPreferencesContext', () => ({
  useQuickAddPreferences: jest.fn(),
}));

const mockedUseItems = useItems as jest.Mock;
const mockedUseBuiltInTypePreferences = useBuiltInTypePreferences as jest.Mock;
const mockedUseQuickAddPreferences = useQuickAddPreferences as jest.Mock;

function renderScreen() {
  const navigation = { goBack: jest.fn() };
  const route = {
    key: 'CustomizeQuickAdd',
    name: 'CustomizeQuickAdd' as const,
  };
  render(
    <CustomizeQuickAddScreen
      navigation={navigation as never}
      route={route as never}
    />
  );
}

beforeEach(() => {
  mockedUseItems.mockReset();
  mockedUseItems.mockReturnValue({ items: [] });

  mockedUseBuiltInTypePreferences.mockReset();
  mockedUseBuiltInTypePreferences.mockReturnValue({
    disabledTypes: [],
    isLoading: false,
    isTypeEnabled: () => true,
    setTypeEnabled: jest.fn(),
  });

  mockedUseQuickAddPreferences.mockReset();
  mockedUseQuickAddPreferences.mockReturnValue({
    options: [{ kind: 'builtin', value: 'idea' }],
    isLoading: false,
    setOptions: jest.fn().mockResolvedValue(undefined),
  });
});

describe('CustomizeQuickAddScreen — disabled built-in types', () => {
  it('excludes a disabled built-in type from the "All types" candidate list', () => {
    mockedUseBuiltInTypePreferences.mockReturnValue({
      disabledTypes: ['article'],
      isLoading: false,
      isTypeEnabled: (type: string) => type !== 'article',
      setTypeEnabled: jest.fn(),
    });
    renderScreen();

    expect(screen.queryByText('Article')).toBeNull();
  });

  it('still offers an enabled built-in type', () => {
    renderScreen();
    expect(screen.getByText('Article')).toBeTruthy();
  });

  it('still shows the label of an already-selected type even if since disabled', () => {
    mockedUseQuickAddPreferences.mockReturnValue({
      options: [{ kind: 'builtin', value: 'article' }],
      isLoading: false,
      setOptions: jest.fn().mockResolvedValue(undefined),
    });
    mockedUseBuiltInTypePreferences.mockReturnValue({
      disabledTypes: ['article'],
      isLoading: false,
      isTypeEnabled: (type: string) => type !== 'article',
      setTypeEnabled: jest.fn(),
    });
    renderScreen();

    // "Article" appears once — in the Selected section — even though it's
    // no longer offered in the "All types" list below.
    expect(screen.getAllByText('Article')).toHaveLength(1);
  });
});
