import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { TagList } from '../TagList';
import { Tag } from '../../../types';

describe('TagList', () => {
  const mockTags: Tag[] = [
    {
      id: '1',
      userId: 'user1',
      name: 'タグ1',
      color: '#FF0000',
      createdAt: '2024-03-15T00:00:00Z',
      updatedAt: '2024-03-15T00:00:00Z',
    },
    {
      id: '2',
      userId: 'user1',
      name: 'タグ2',
      color: '#00FF00',
      createdAt: '2024-03-15T00:00:00Z',
      updatedAt: '2024-03-15T00:00:00Z',
    },
  ];

  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();

  beforeEach(() => {
    mockOnEdit.mockClear();
    mockOnDelete.mockClear();
  });

  it('タグ一覧が正しくレンダリングされること', () => {
    render(
      <TagList
        tags={mockTags}
        isLoading={false}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('タグ1')).toBeInTheDocument();
    expect(screen.getByText('タグ2')).toBeInTheDocument();
    expect(screen.getAllByTestId('tag-color')).toHaveLength(2);
  });

  it('ローディング中の表示が正しく表示されること', () => {
    render(
      <TagList
        tags={[]}
        isLoading={true}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('タグが空の場合のメッセージが表示されること', () => {
    render(
      <TagList
        tags={[]}
        isLoading={false}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('タグが登録されていません')).toBeInTheDocument();
  });

  it('編集ボタンをクリックすると編集ハンドラーが呼ばれること', () => {
    render(
      <TagList
        tags={mockTags}
        isLoading={false}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const editButtons = screen.getAllByLabelText('タグを編集');
    fireEvent.click(editButtons[0]);

    expect(mockOnEdit).toHaveBeenCalledWith(mockTags[0]);
  });

  it('削除ボタンをクリックすると削除ハンドラーが呼ばれること', () => {
    render(
      <TagList
        tags={mockTags}
        isLoading={false}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const deleteButtons = screen.getAllByLabelText('タグを削除');
    fireEvent.click(deleteButtons[1]);

    expect(mockOnDelete).toHaveBeenCalledWith(mockTags[1].id);
  });
}); 