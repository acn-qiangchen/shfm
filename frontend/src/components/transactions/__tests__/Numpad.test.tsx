import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { Numpad } from '../Numpad';

describe('Numpad', () => {
  const mockOnInput = vi.fn();
  const mockOnClear = vi.fn();
  const defaultProps = {
    onInput: mockOnInput,
    onClear: mockOnClear,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all number buttons', () => {
    render(<Numpad {...defaultProps} />);

    for (let i = 0; i <= 9; i++) {
      expect(screen.getByRole('button', { name: i.toString() })).toBeInTheDocument();
    }
  });

  it('renders clear button', () => {
    render(<Numpad {...defaultProps} />);
    expect(screen.getByRole('button', { name: 'クリア' })).toBeInTheDocument();
  });

  it('calls onInput when number button is clicked', () => {
    render(<Numpad {...defaultProps} />);

    fireEvent.click(screen.getByRole('button', { name: '1' }));
    expect(mockOnInput).toHaveBeenCalledWith('1');

    fireEvent.click(screen.getByRole('button', { name: '5' }));
    expect(mockOnInput).toHaveBeenCalledWith('5');
  });

  it('calls onClear when clear button is clicked', () => {
    render(<Numpad {...defaultProps} />);

    fireEvent.click(screen.getByRole('button', { name: 'クリア' }));
    expect(mockOnClear).toHaveBeenCalled();
  });

  it('has proper layout with grid', () => {
    render(<Numpad {...defaultProps} />);
    const numpad = screen.getByTestId('numpad');
    
    expect(numpad).toHaveClass('grid', 'grid-cols-3', 'gap-2');
  });
}); 