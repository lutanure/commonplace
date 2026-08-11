import { render, screen } from '@testing-library/react-native';
import { Path } from 'react-native-svg';
import BrandMark from './BrandMark';

describe('BrandMark', () => {
  it('defaults to a 28x28 svg', () => {
    render(<BrandMark />);
    const svg = screen.getByTestId('brand-mark');

    expect(svg.props.width).toBe(28);
    expect(svg.props.height).toBe(28);
  });

  it('sizes the svg to the given size prop', () => {
    render(<BrandMark size={48} />);
    const svg = screen.getByTestId('brand-mark');

    expect(svg.props.width).toBe(48);
    expect(svg.props.height).toBe(48);
  });

  it('renders the three identity strokes with their source colors', () => {
    const { UNSAFE_getAllByType } = render(<BrandMark />);
    const strokes = UNSAFE_getAllByType(Path).map((path) => path.props.stroke);

    expect(strokes).toEqual(['#A34B32', '#331920', '#C99A3D']);
  });
});
