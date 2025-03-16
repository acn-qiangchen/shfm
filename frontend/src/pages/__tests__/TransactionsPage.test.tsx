import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { TransactionsPage } from '../TransactionsPage';
import { useTransactions } from '../../hooks/useTransactions';

// useTransactions hookのモック
vi.mock('../../hooks/useTransactions', () => ({
  useTransactions: vi.fn(),
}));

// fetchのモック
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('TransactionsPage', () => {
  const mockTransactions = [
    {
      id: '1',
      userId: 'user1',
      type: 'EXPENSE',
      amount: 1000,
      description: 'テスト支出1',
      date: '2024-03-15',
      tagIds: ['1'],
      createdAt: '2024-03-15T00:00:00Z',
      updatedAt: '2024-03-15T00:00:00Z',
    },
    {
      id: '2',
      userId: 'user1',
      type: 'INCOME',
      amount: 2000,
      description: 'テスト収入1',
      date: '2024-03-15',
      tagIds: ['2'],
      createdAt: '2024-03-15T00:00:00Z',
      updatedAt: '2024-03-15T00:00:00Z',
    },
  ];

  const mockMutate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useTransactions as jest.Mock).mockReturnValue({
      data: mockTransactions,
      isLoading: false,
      mutate: mockMutate,
    });
    mockFetch.mockImplementation(() => Promise.resolve({ ok: true }));
  });

  it('トランザクション一覧が正しくレンダリングされること', () => {
    render(<TransactionsPage />);

    expect(screen.getByText('トランザクション一覧')).toBeInTheDocument();
    expect(screen.getByText('テスト支出1')).toBeInTheDocument();
    expect(screen.getByText('テスト収入1')).toBeInTheDocument();
  });

  it('ローディング中の表示が正しく表示されること', () => {
    (useTransactions as jest.Mock).mockReturnValue({
      data: null,
      isLoading: true,
      mutate: mockMutate,
    });

    render(<TransactionsPage />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('新規作成ボタンをクリックするとフォームが表示されること', () => {
    render(<TransactionsPage />);

    fireEvent.click(screen.getByText('新規作成'));
    expect(screen.getByText('新規トランザクション')).toBeInTheDocument();
  });

  it('編集ボタンをクリックするとフォームが表示されること', () => {
    render(<TransactionsPage />);

    fireEvent.click(screen.getByTestId(`edit-transaction-${mockTransactions[0].id}`));
    expect(screen.getByText('トランザクションの編集')).toBeInTheDocument();
  });

  it('削除ボタンをクリックすると確認ダイアログが表示されること', () => {
    const confirmSpy = vi.spyOn(window, 'confirm');
    confirmSpy.mockImplementation(() => true);

    render(<TransactionsPage />);

    fireEvent.click(screen.getByTestId(`delete-transaction-${mockTransactions[0].id}`));
    expect(confirmSpy).toHaveBeenCalledWith('このトランザクションを削除してもよろしいですか？');
  });

  it('トランザクションの作成が成功すること', async () => {
    render(<TransactionsPage />);

    // フォームを開く
    fireEvent.click(screen.getByText('新規作成'));

    // フォームに入力
    fireEvent.change(screen.getByLabelText(/金額/), { target: { value: '1000' } });
    fireEvent.change(screen.getByLabelText(/説明/), { target: { value: 'テスト支出' } });
    fireEvent.change(screen.getByLabelText(/日付/), { target: { value: '2024-03-15' } });

    // フォームを送信
    fireEvent.click(screen.getByText('保存'));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: expect.any(String),
      });
      expect(mockMutate).toHaveBeenCalled();
    });
  });

  it('トランザクションの更新が成功すること', async () => {
    render(<TransactionsPage />);

    // 編集フォームを開く
    fireEvent.click(screen.getByTestId(`edit-transaction-${mockTransactions[0].id}`));

    // フォームを更新
    fireEvent.change(screen.getByLabelText(/説明/), { target: { value: '更新後の説明' } });

    // フォームを送信
    fireEvent.click(screen.getByText('保存'));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(`/api/transactions/${mockTransactions[0].id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: expect.any(String),
      });
      expect(mockMutate).toHaveBeenCalled();
    });
  });

  it('トランザクションの削除が成功すること', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm');
    confirmSpy.mockImplementation(() => true);

    render(<TransactionsPage />);

    // 削除ボタンをクリック
    fireEvent.click(screen.getByTestId(`delete-transaction-${mockTransactions[0].id}`));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(`/api/transactions/${mockTransactions[0].id}`, {
        method: 'DELETE',
      });
      expect(mockMutate).toHaveBeenCalled();
    });
  });

  it('エラー時にアラートが表示されること', async () => {
    const alertSpy = vi.spyOn(window, 'alert');
    mockFetch.mockImplementation(() => Promise.resolve({ ok: false }));

    render(<TransactionsPage />);

    // 新規作成フォームを開く
    fireEvent.click(screen.getByText('新規作成'));

    // フォームに入力して送信
    fireEvent.change(screen.getByLabelText(/金額/), { target: { value: '1000' } });
    fireEvent.change(screen.getByLabelText(/説明/), { target: { value: 'テスト支出' } });
    fireEvent.change(screen.getByLabelText(/日付/), { target: { value: '2024-03-15' } });
    fireEvent.click(screen.getByText('保存'));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('トランザクションの作成に失敗しました');
    });
  });
}); 