import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { useItems } from '../state/ItemsContext';
import ItemForm from './ItemForm';

jest.mock('../state/ItemsContext', () => ({
  useItems: jest.fn(),
}));

// react-native-keyboard-controller isn't linked in the Jest environment
// (native module) — swap its scroll view for the plain RN one, which is
// all ItemForm actually needs to render for these tests.
jest.mock('react-native-keyboard-controller', () => {
  const { ScrollView } = jest.requireActual('react-native');
  return { KeyboardAwareScrollView: ScrollView };
});

const mockedUseItems = useItems as jest.Mock;

beforeEach(() => {
  mockedUseItems.mockReset();
  mockedUseItems.mockReturnValue({ items: [] });
});

// Deferred promise so the test controls exactly when onSubmit resolves,
// to simulate the real-world save latency that causes a double tap.
function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

function fillValidForm() {
  fireEvent.changeText(screen.getByPlaceholderText('https://…'), 'example.com');
}

describe('ItemForm double-submit protection', () => {
  it('only calls onSubmit once when Save is tapped twice before the request resolves', async () => {
    const { promise, resolve } = deferred<void>();
    const onSubmit = jest.fn().mockReturnValue(promise);
    render(<ItemForm onSubmit={onSubmit} />);
    fillValidForm();

    fireEvent.press(screen.getByText('Save to Library'));
    fireEvent.press(screen.getByText('Saving…'));
    fireEvent.press(screen.getByText('Saving…'));

    expect(onSubmit).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolve();
      await promise;
    });
  });

  it('disables the button and shows a saving state while the request is in flight', async () => {
    const { promise, resolve } = deferred<void>();
    const onSubmit = jest.fn().mockReturnValue(promise);
    render(<ItemForm onSubmit={onSubmit} />);
    fillValidForm();

    fireEvent.press(screen.getByText('Save to Library'));

    expect(screen.getByText('Saving…')).toBeTruthy();
    expect(screen.queryByText('Save to Library')).toBeNull();

    // A tap while "Saving…" must not fire a second submission — this is
    // the actual disable behavior that matters, not just the button's
    // internal prop wiring.
    fireEvent.press(screen.getByText('Saving…'));
    expect(onSubmit).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolve();
      await promise;
    });
  });

  it('restores the button so the user can retry after a failed submission', async () => {
    const { promise, reject } = deferred<void>();
    const onSubmit = jest.fn().mockReturnValue(promise);
    render(<ItemForm onSubmit={onSubmit} />);
    fillValidForm();

    fireEvent.press(screen.getByText('Save to Library'));
    expect(screen.getByText('Saving…')).toBeTruthy();

    await act(async () => {
      reject(new Error('network down'));
      await promise.catch(() => {});
      // Flush the extra microtask hop ItemForm's own try/catch/finally
      // chain takes to reach its setIsSubmitting(false).
      await Promise.resolve();
    });

    expect(screen.getByText('Save to Library')).toBeTruthy();

    fireEvent.press(screen.getByText('Save to Library'));
    expect(onSubmit).toHaveBeenCalledTimes(2);
  });
});
