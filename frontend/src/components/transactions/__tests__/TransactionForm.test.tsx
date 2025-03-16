import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { TransactionForm } from '../TransactionForm';
import { useTags } from '../../../hooks/useTags';

// useTags hookのモック
vi.mock('../../../hooks/useTags', () => ({
  useTags: vi.fn(),
}));

describe('TransactionForm', () => {
  const mockTags = [
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

  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useTags as jest.Mock).mockReturnValue({
      data: mockTags,
      isLoading: false,
    });
  });

  it('フォームが正しくレンダリングされること', () => {
    render(<TransactionForm onSubmit={mockOnSubmit} />);

    expect(screen.getByLabelText(/種類/)).toBeInTheDocument();
    expect(screen.getByLabelText(/金額/)).toBeInTheDocument();
    expect(screen.getByLabelText(/説明/)).toBeInTheDocument();
    expect(screen.getByLabelText(/日付/)).toBeInTheDocument();
    expect(screen.getByLabelText(/タグ/)).toBeInTheDocument();
  });

  it('初期値が正しく設定されること', () => {
    const initialData = {
      type: 'EXPENSE' as const,
      amount: 1000,
      description: 'テスト支出',
      date: '2024-03-15',
      tagIds: ['1'],
    };

    render(<TransactionForm onSubmit={mockOnSubmit} initialData={initialData} />);

    expect(screen.getByDisplayValue('1000')).toBeInTheDocument();
    expect(screen.getByDisplayValue('テスト支出')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2024-03-15')).toBeInTheDocument();
  });

  it('必須フィールドが空の場合にエラーが表示されること', async () => {
    render(<TransactionForm onSubmit={mockOnSubmit} />);

    const submitButton = screen.getByText('保存');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('金額を入力してください')).toBeInTheDocument();
      expect(screen.getByText('説明を入力してください')).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('有効なデータが送信されること', async () => {
    render(<TransactionForm onSubmit={mockOnSubmit} />);

    // 金額を入力
    const amountInput = screen.getByLabelText(/金額/);
    fireEvent.change(amountInput, { target: { value: '1000' } });

    // 説明を入力
    const descriptionInput = screen.getByLabelText(/説明/);
    fireEvent.change(descriptionInput, { target: { value: 'テスト支出' } });

    // 日付を入力
    const dateInput = screen.getByLabelText(/日付/);
    fireEvent.change(dateInput, { target: { value: '2024-03-15' } });

    // タグを選択
    const tag1Button = screen.getByText('タグ1');
    fireEvent.click(tag1Button);

    // フォームを送信
    const submitButton = screen.getByText('保存');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        type: 'EXPENSE',
        amount: 1000,
        description: 'テスト支出',
        date: '2024-03-15',
        tagIds: ['1'],
      });
    });
  });

  it('送信中は保存ボタンが無効化されること', () => {
    render(<TransactionForm onSubmit={mockOnSubmit} isSubmitting={true} />);

    const submitButton = screen.getByText('保存中...');
    expect(submitButton).toBeDisabled();
  });

  it('数字パッドが表示・非表示を切り替えられること', () => {
    render(<TransactionForm onSubmit={mockOnSubmit} />);

    const amountInput = screen.getByLabelText(/金額/);
    
    // 初期状態では数字パッドは非表示
    expect(screen.queryByRole('button', { name: '1' })).not.toBeInTheDocument();

    // 金額入力フィールドをクリックすると数字パッドが表示される
    fireEvent.click(amountInput);
    expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument();

    // もう一度クリックすると数字パッドが非表示になる
    fireEvent.click(amountInput);
    expect(screen.queryByRole('button', { name: '1' })).not.toBeInTheDocument();
  });

  it('タグの読み込み中は適切に表示されること', () => {
    (useTags as jest.Mock).mockReturnValue({
      data: null,
      isLoading: true,
    });

    render(<TransactionForm onSubmit={mockOnSubmit} />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
}); 