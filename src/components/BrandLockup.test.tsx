import { render, screen } from '@testing-library/react-native';
import { colors } from '../theme';
import BrandLockup from './BrandLockup';

describe('BrandLockup', () => {
  it('renders the brand mark and the wordmark', () => {
    render(<BrandLockup />);

    expect(screen.getByTestId('brand-mark')).toBeTruthy();
    expect(screen.getByTestId('brand-lockup-wordmark')).toBeTruthy();
  });

  it('colors "Common" plum and "place" burnt orange', () => {
    render(<BrandLockup />);

    expect(screen.getByTestId('brand-lockup-wordmark').props.style.color).toBe(
      colors.brandPlum
    );
    expect(screen.getByTestId('brand-lockup-place').props.style.color).toBe(
      colors.brandOrange
    );
  });

  it('renders the trailing dot as a graphic ochre circle, not text', () => {
    render(<BrandLockup />);
    const dot = screen.getByTestId('brand-lockup-dot');

    expect(dot.props.style.backgroundColor).toBe(colors.brandOchre);
    expect(dot.props.style.borderRadius).toBe(dot.props.style.width / 2);
  });
});
