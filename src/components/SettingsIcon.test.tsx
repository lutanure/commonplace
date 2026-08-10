import { render, screen } from '@testing-library/react-native';
import SettingsIcon from './SettingsIcon';

describe('SettingsIcon', () => {
  it('renders three bars of strictly decreasing width (not a hamburger, which uses equal widths)', () => {
    render(<SettingsIcon size={18} color="#C23B1E" />);

    const widths = [1, 2, 3].map(
      (n) => screen.getByTestId(`settings-icon-bar-${n}`).props.style.width
    );

    expect(new Set(widths).size).toBe(3);
    expect(widths[0]).toBeGreaterThan(widths[1]);
    expect(widths[1]).toBeGreaterThan(widths[2]);
  });

  it('applies the given color to every bar', () => {
    render(<SettingsIcon size={18} color="#C23B1E" />);

    for (const n of [1, 2, 3]) {
      expect(
        screen.getByTestId(`settings-icon-bar-${n}`).props.style.backgroundColor
      ).toBe('#C23B1E');
    }
  });
});
