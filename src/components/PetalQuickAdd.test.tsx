import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { BackHandler } from 'react-native';
import { useQuickAddPreferences } from '../state/QuickAddPreferencesContext';
import PetalQuickAdd from './PetalQuickAdd';

jest.mock('../state/QuickAddPreferencesContext', () => ({
  useQuickAddPreferences: jest.fn(),
}));

const mockedUseQuickAddPreferences = useQuickAddPreferences as jest.Mock;

// Petal presses are gated behind `petalsInteractive`, which only flips true
// once the open `withTiming` animation's completion callback fires — under
// real (unmocked) Reanimated running in Jest, that's driven by a timer, per
// Reanimated's own jestUtils guidance. Fake timers + advancing past the
// open duration lets tests exercise the settled, tappable state, matching
// how a real device behaves once the bloom finishes opening.
function renderPetalQuickAdd(isOpen = false) {
  const onOpenChange = jest.fn();
  const onSelect = jest.fn();
  const view = render(
    <PetalQuickAdd
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      onSelect={onSelect}
    />
  );
  if (isOpen) {
    act(() => {
      jest.advanceTimersByTime(500);
    });
  }
  return { ...view, onOpenChange, onSelect };
}

beforeEach(() => {
  jest.useFakeTimers();

  mockedUseQuickAddPreferences.mockReset();
  mockedUseQuickAddPreferences.mockReturnValue({
    options: [
      { kind: 'builtin', value: 'idea' },
      { kind: 'builtin', value: 'book' },
      { kind: 'custom', label: 'Research Paper' },
    ],
    isLoading: false,
    setOptions: jest.fn(),
  });
});

afterEach(() => {
  jest.useRealTimers();
});

describe('PetalQuickAdd', () => {
  it('renders the closed-state FAB by default', () => {
    renderPetalQuickAdd(false);
    expect(screen.getByLabelText('Add')).toBeTruthy();
  });

  it('opens when the FAB is pressed', () => {
    const { onOpenChange } = renderPetalQuickAdd(false);
    fireEvent.press(screen.getByTestId('petal-fab'));
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it('closes when the FAB is pressed again while open', () => {
    const { onOpenChange } = renderPetalQuickAdd(true);
    fireEvent.press(screen.getByTestId('petal-fab'));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('shows the open-state label and expanded accessibility state', () => {
    renderPetalQuickAdd(true);
    const fab = screen.getByTestId('petal-fab');
    expect(screen.getByLabelText('Close quick add')).toBeTruthy();
    expect(fab.props.accessibilityState).toEqual({ expanded: true });
  });

  it('renders one petal per quick-add option, plus a final "All types" petal', () => {
    renderPetalQuickAdd(true);
    expect(screen.getByLabelText('Add Idea')).toBeTruthy();
    expect(screen.getByLabelText('Add Book')).toBeTruthy();
    expect(screen.getByLabelText('Add Research Paper')).toBeTruthy();
    expect(screen.getByLabelText('All types')).toBeTruthy();
  });

  it('reflects the live quick-add preference count without duplicating state', () => {
    mockedUseQuickAddPreferences.mockReturnValue({
      options: [
        { kind: 'builtin', value: 'idea' },
        { kind: 'builtin', value: 'book' },
        { kind: 'builtin', value: 'movie' },
        { kind: 'builtin', value: 'podcast' },
        { kind: 'builtin', value: 'recipe' },
      ],
      isLoading: false,
      setOptions: jest.fn(),
    });
    renderPetalQuickAdd(true);
    expect(screen.getByLabelText('Add Idea')).toBeTruthy();
    expect(screen.getByLabelText('Add Recipe')).toBeTruthy();
    expect(screen.getByLabelText('All types')).toBeTruthy();
  });

  it('selects a built-in type petal with the correct preset type and closes', () => {
    const { onOpenChange, onSelect } = renderPetalQuickAdd(true);
    fireEvent.press(screen.getByLabelText('Add Book'));
    expect(onSelect).toHaveBeenCalledWith({ kind: 'builtin', value: 'book' });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('selects a custom type petal with the correct preset type', () => {
    const { onSelect } = renderPetalQuickAdd(true);
    fireEvent.press(screen.getByLabelText('Add Research Paper'));
    expect(onSelect).toHaveBeenCalledWith({
      kind: 'custom',
      label: 'Research Paper',
    });
  });

  it('selects the "All types" petal with no preset type', () => {
    const { onOpenChange, onSelect } = renderPetalQuickAdd(true);
    fireEvent.press(screen.getByLabelText('All types'));
    expect(onSelect).toHaveBeenCalledWith(undefined);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('closes when the tap-outside catcher is pressed', () => {
    const { onOpenChange } = renderPetalQuickAdd(true);
    fireEvent.press(screen.getByLabelText('Close quick add options'));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('registers a hardware back handler only while open, and it closes the bloom', () => {
    const addSpy = jest.spyOn(BackHandler, 'addEventListener');
    const onOpenChange = jest.fn();
    const { rerender } = render(
      <PetalQuickAdd
        isOpen={false}
        onOpenChange={onOpenChange}
        onSelect={jest.fn()}
      />
    );
    expect(addSpy).not.toHaveBeenCalled();

    rerender(
      <PetalQuickAdd
        isOpen={true}
        onOpenChange={onOpenChange}
        onSelect={jest.fn()}
      />
    );
    expect(addSpy).toHaveBeenCalledWith(
      'hardwareBackPress',
      expect.any(Function)
    );

    const handler = addSpy.mock.calls[0][1] as () => boolean;
    expect(handler()).toBe(true);
    expect(onOpenChange).toHaveBeenCalledWith(false);

    addSpy.mockRestore();
  });
});
