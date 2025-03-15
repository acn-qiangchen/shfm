import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { TagForm } from '../TagForm';
import { Tag } from '../../../types';

describe('TagForm', () => {
  const mockOnSubmit = vi.fn();
  const defaultProps = {
    onSubmit: mockOnSubmit,
    isSubmitting: false,
  };

  const mockTag: Tag = {
    id: '1',
    userId: 'user1',
    name: 'テストタグ',
    color: '#FF0000',
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders form fields correctly', () => {
    render(<TagForm {...defaultProps} />);

    expect(screen.getByLabelText(/タグ名/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/色/i)).toBeInTheDocument();
  });

  it('submits form with valid data', () => {
    render(<TagForm {...defaultProps} />);

    fireEvent.change(screen.getByLabelText(/タグ名/i), {
      target: { value: 'テストタグ' },
    });
    fireEvent.change(screen.getByLabelText(/色/i), {
      target: { value: '#FF0000' },
    });
    fireEvent.click(screen.getByRole('button', { name: /登録/i }));

    expect(mockOnSubmit).toHaveBeenCalledWith({
      name: 'テストタグ',
      color: '#FF0000',
    });
  });

  it('shows validation error for empty name', () => {
    render(<TagForm {...defaultProps} />);

    fireEvent.click(screen.getByRole('button', { name: /登録/i }));

    expect(screen.getByText(/タグ名を入力してください/i)).toBeInTheDocument();
  });

  it('disables submit button while submitting', () => {
    render(<TagForm {...defaultProps} isSubmitting={true} />);

    expect(screen.getByRole('button', { name: /登録中/i })).toBeDisabled();
  });

  it('pre-fills form when editing existing tag', () => {
    render(<TagForm {...defaultProps} tag={mockTag} />);

    expect(screen.getByLabelText(/タグ名/i)).toHaveValue(mockTag.name);
    expect(screen.getByLabelText(/色/i)).toHaveValue(mockTag.color);
  });

  it('shows color preview', () => {
    render(<TagForm {...defaultProps} />);

    const colorInput = screen.getByLabelText(/色/i);
    fireEvent.change(colorInput, { target: { value: '#FF0000' } });

    const preview = screen.getByTestId('color-preview');
    expect(preview).toHaveStyle({ backgroundColor: '#FF0000' });
  });
}); 