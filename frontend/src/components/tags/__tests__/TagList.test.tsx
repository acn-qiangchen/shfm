import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { TagList } from '../TagList';
import { Tag } from '../../../types';

const mockTags: Tag[] = [
  {
    id: '1',
    userId: 'user1',
    name: 'タグ1',
    color: '#FF0000',
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: '2',
    userId: 'user1',
    name: 'タグ2',
    color: '#00FF00',
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
];

describe('TagList', () => {
  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();
  const defaultProps = {
    tags: mockTags,
    onEdit: mockOnEdit,
    onDelete: mockOnDelete,
    isLoading: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders tags correctly', () => {
    render(<TagList {...defaultProps} />);

    mockTags.forEach(tag => {
      expect(screen.getByText(tag.name)).toBeInTheDocument();
      const colorPreview = screen.getByTestId(`color-preview-${tag.id}`);
      expect(colorPreview).toHaveStyle({ backgroundColor: tag.color });
    });
  });

  it('shows loading state', () => {
    render(<TagList {...defaultProps} isLoading={true} />);
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('shows empty state when no tags', () => {
    render(<TagList {...defaultProps} tags={[]} />);
    expect(screen.getByText(/タグがありません/i)).toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', () => {
    render(<TagList {...defaultProps} />);
    
    const editButton = screen.getAllByRole('button', { name: /編集/i })[0];
    fireEvent.click(editButton);

    expect(mockOnEdit).toHaveBeenCalledWith(mockTags[0]);
  });

  it('calls onDelete when delete button is clicked and confirmed', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    render(<TagList {...defaultProps} />);
    
    const deleteButton = screen.getAllByRole('button', { name: /削除/i })[0];
    fireEvent.click(deleteButton);

    expect(mockOnDelete).toHaveBeenCalledWith(mockTags[0].id);
  });

  it('does not call onDelete when delete is not confirmed', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    render(<TagList {...defaultProps} />);
    
    const deleteButton = screen.getAllByRole('button', { name: /削除/i })[0];
    fireEvent.click(deleteButton);

    expect(mockOnDelete).not.toHaveBeenCalled();
  });
}); 