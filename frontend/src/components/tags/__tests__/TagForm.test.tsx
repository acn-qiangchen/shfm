import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import '@testing-library/jest-dom';
import { TagForm } from '../TagForm';
import { Tag } from '../../../types';

describe('TagForm', () => {
  const mockTag: Tag = {
    id: '1',
    userId: 'user1',
    name: 'テストタグ',
    color: '#FF0000',
    createdAt: '2024-03-15T00:00:00Z',
    updatedAt: '2024-03-15T00:00:00Z',
  };

  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  it('新規作成モードで正しくレンダリングされること', () => {
    render(<TagForm onSubmit={mockOnSubmit} />);

    expect(screen.getByLabelText('タグ名')).toBeInTheDocument();
    expect(screen.getByLabelText('色')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '作成' })).toBeInTheDocument();
  });

  it('編集モードで正しくレンダリングされること', () => {
    render(<TagForm tag={mockTag} onSubmit={mockOnSubmit} />);

    const nameInput = screen.getByLabelText('タグ名') as HTMLInputElement;
    const colorInput = screen.getByLabelText('色') as HTMLInputElement;
    const submitButton = screen.getByRole('button', { name: '更新' });

    expect(nameInput.value).toBe(mockTag.name);
    expect(colorInput.value).toBe(mockTag.color);
    expect(submitButton).toBeInTheDocument();
  });

  it('タグ名が空の場合にエラーメッセージを表示すること', async () => {
    render(<TagForm onSubmit={mockOnSubmit} />);

    const submitButton = screen.getByRole('button', { name: '作成' });
    fireEvent.click(submitButton);

    expect(await screen.findByText('タグ名を入力してください')).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('フォームが正しく送信されること', () => {
    render(<TagForm onSubmit={mockOnSubmit} />);

    const nameInput = screen.getByLabelText('タグ名');
    const colorInput = screen.getByLabelText('色');
    const submitButton = screen.getByRole('button', { name: '作成' });

    fireEvent.change(nameInput, { target: { value: 'テストタグ' } });
    fireEvent.change(colorInput, { target: { value: '#00FF00' } });
    fireEvent.click(submitButton);

    expect(mockOnSubmit).toHaveBeenCalledWith({
      name: 'テストタグ',
      color: '#00FF00',
    });
  });

  it('ローディング中は入力とボタンが無効化されること', () => {
    render(<TagForm onSubmit={mockOnSubmit} isLoading={true} />);

    const nameInput = screen.getByLabelText('タグ名');
    const colorInput = screen.getByLabelText('色');
    const submitButton = screen.getByRole('button', { name: '保存中...' });

    expect(nameInput).toBeDisabled();
    expect(colorInput).toBeDisabled();
    expect(submitButton).toBeDisabled();
  });

  it('shows color preview', () => {
    render(<TagForm onSubmit={mockOnSubmit} />);

    const colorInput = screen.getByLabelText(/色/i);
    fireEvent.change(colorInput, { target: { value: '#FF0000' } });

    const preview = screen.getByTestId('color-preview');
    expect(preview).toHaveStyle({ backgroundColor: '#FF0000' });
  });
}); 