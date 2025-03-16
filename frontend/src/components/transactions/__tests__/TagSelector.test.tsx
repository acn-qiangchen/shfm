import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { TagSelector } from '../TagSelector';
import { Tag } from '../../../types';

describe('TagSelector', () => {
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

  const mockOnChange = vi.fn();
  const defaultProps = {
    tags: mockTags,
    selectedTagIds: [],
    onChange: mockOnChange,
    isLoading: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('タグ一覧が正しくレンダリングされること', () => {
    render(<TagSelector {...defaultProps} />);

    expect(screen.getByText('タグ1')).toBeInTheDocument();
    expect(screen.getByText('タグ2')).toBeInTheDocument();
  });

  it('ローディング中の表示が正しく表示されること', () => {
    render(<TagSelector {...defaultProps} isLoading={true} />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('タグが空の場合のメッセージが表示されること', () => {
    render(<TagSelector {...defaultProps} tags={[]} />);
    expect(screen.getByText('タグが登録されていません')).toBeInTheDocument();
  });

  it('タグをクリックすると選択状態が切り替わること', () => {
    render(<TagSelector {...defaultProps} />);

    const tag1Button = screen.getByText('タグ1');
    fireEvent.click(tag1Button);

    expect(mockOnChange).toHaveBeenCalledWith(['1']);

    // 選択済みのタグをクリックすると選択解除される
    render(<TagSelector {...defaultProps} selectedTagIds={['1']} />);
    fireEvent.click(tag1Button);

    expect(mockOnChange).toHaveBeenCalledWith([]);
  });

  it('複数のタグを選択できること', () => {
    render(<TagSelector {...defaultProps} selectedTagIds={['1']} />);

    const tag2Button = screen.getByText('タグ2');
    fireEvent.click(tag2Button);

    expect(mockOnChange).toHaveBeenCalledWith(['1', '2']);
  });

  it('選択されたタグが視覚的に区別されること', () => {
    render(<TagSelector {...defaultProps} selectedTagIds={['1']} />);

    const tag1Button = screen.getByText('タグ1');
    const tag2Button = screen.getByText('タグ2');

    expect(tag1Button).toHaveAttribute('aria-pressed', 'true');
    expect(tag2Button).toHaveAttribute('aria-pressed', 'false');
  });

  it('タグの背景色に応じて文字色が適切に設定されること', () => {
    const tagsWithDifferentColors: Tag[] = [
      {
        id: '1',
        userId: 'user1',
        name: '明るいタグ',
        color: '#FFFFFF', // 白背景
        createdAt: '2024-03-15T00:00:00Z',
        updatedAt: '2024-03-15T00:00:00Z',
      },
      {
        id: '2',
        userId: 'user1',
        name: '暗いタグ',
        color: '#000000', // 黒背景
        createdAt: '2024-03-15T00:00:00Z',
        updatedAt: '2024-03-15T00:00:00Z',
      },
    ];

    render(
      <TagSelector {...defaultProps} tags={tagsWithDifferentColors} />
    );

    const lightTag = screen.getByText('明るいタグ');
    const darkTag = screen.getByText('暗いタグ');

    expect(lightTag).toHaveStyle({ color: '#000000' }); // 白背景には黒文字
    expect(darkTag).toHaveStyle({ color: '#FFFFFF' }); // 黒背景には白文字
  });
}); 