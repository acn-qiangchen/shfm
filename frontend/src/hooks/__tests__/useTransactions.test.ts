import { renderHook, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { useTransactions } from '../useTransactions';

// fetchのモック
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('useTransactions', () => {
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

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockTransactions),
      })
    );
  });

  it('トランザクションの取得が成功すること', async () => {
    const { result } = renderHook(() => useTransactions());

    // 初期状態ではローディング中
    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();

    // データが取得できたことを確認
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.data).toEqual(mockTransactions);
    });

    // APIが正しく呼び出されたことを確認
    expect(mockFetch).toHaveBeenCalledWith('/api/transactions');
  });

  it('エラー時に適切に処理されること', async () => {
    mockFetch.mockImplementation(() =>
      Promise.resolve({
        ok: false,
        status: 500,
      })
    );

    const { result } = renderHook(() => useTransactions());

    await waitFor(() => {
      expect(result.current.isError).toBeTruthy();
      expect(result.current.data).toBeUndefined();
    });
  });

  it('mutateが正しく動作すること', async () => {
    const { result } = renderHook(() => useTransactions());

    await waitFor(() => {
      expect(result.current.data).toEqual(mockTransactions);
    });

    // mutateを呼び出し
    await result.current.mutate();

    // 2回目のフェッチが行われたことを確認
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });
}); 