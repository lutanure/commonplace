import { act, renderHook, waitFor } from '@testing-library/react-native';
import * as typeVisibilityRepository from '../data/typeVisibilityRepository';
import {
  BuiltInTypePreferencesProvider,
  useBuiltInTypePreferences,
} from './BuiltInTypePreferencesContext';

jest.mock('../data/typeVisibilityRepository', () => ({
  loadDisabledBuiltInTypes: jest.fn(),
  saveDisabledBuiltInTypes: jest.fn(),
}));

const mockedLoad =
  typeVisibilityRepository.loadDisabledBuiltInTypes as jest.Mock;
const mockedSave =
  typeVisibilityRepository.saveDisabledBuiltInTypes as jest.Mock;

function renderPrefsHook() {
  return renderHook(() => useBuiltInTypePreferences(), {
    wrapper: BuiltInTypePreferencesProvider,
  });
}

beforeEach(() => {
  mockedLoad.mockReset();
  mockedSave.mockReset();
  mockedSave.mockResolvedValue(undefined);
});

describe('BuiltInTypePreferencesContext', () => {
  it('defaults to everything enabled when nothing is stored', async () => {
    mockedLoad.mockResolvedValue(null);
    const { result } = renderPrefsHook();

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.disabledTypes).toEqual([]);
    expect(result.current.isTypeEnabled('article')).toBe(true);
  });

  it('loads and sanitizes a previously persisted disabled list', async () => {
    mockedLoad.mockResolvedValue(['article', 'not-a-real-type']);
    const { result } = renderPrefsHook();

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.disabledTypes).toEqual(['article']);
    expect(result.current.isTypeEnabled('article')).toBe(false);
    expect(result.current.isTypeEnabled('movie')).toBe(true);
  });

  it('setTypeEnabled(type, false) disables a type and persists it', async () => {
    mockedLoad.mockResolvedValue(null);
    const { result } = renderPrefsHook();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.setTypeEnabled('article', false);
    });

    expect(result.current.isTypeEnabled('article')).toBe(false);
    expect(mockedSave).toHaveBeenCalledWith(['article']);
  });

  it('setTypeEnabled(type, true) re-enables a previously disabled type', async () => {
    mockedLoad.mockResolvedValue(['article', 'movie']);
    const { result } = renderPrefsHook();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.setTypeEnabled('article', true);
    });

    expect(result.current.isTypeEnabled('article')).toBe(true);
    expect(result.current.isTypeEnabled('movie')).toBe(false);
    expect(mockedSave).toHaveBeenCalledWith(['movie']);
  });
});
