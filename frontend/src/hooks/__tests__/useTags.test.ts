import { renderHook, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { useTags } from '../useTags';

// fetchのモック
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('useTags', () => {
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

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockTags),
      })
    );
  });

  it('タグの取得が成功すること', async () => {
    const { result } = renderHook(() => useTags());

    // 初期状態ではローディング中
    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();

    // データが取得できたことを確認
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.data).toEqual(mockTags);
    });

    // APIが正しく呼び出されたことを確認
    expect(mockFetch).toHaveBeenCalledWith('/api/tags');
  });

  it('エラー時に適切に処理されること', async () => {
    mockFetch.mockImplementation(() =>
      Promise.resolve({
        ok: false,
        status: 500,
      })
    );

    const { result } = renderHook(() => useTags());

    await waitFor(() => {
      expect(result.current.isError).toBeTruthy();
      expect(result.current.data).toBeUndefined();
    });
  });

  it('mutateが正しく動作すること', async () => {
    const { result } = renderHook(() => useTags());

    await waitFor(() => {
      expect(result.current.data).toEqual(mockTags);
    });

    // mutateを呼び出し
    await result.current.mutate();

    // 2回目のフェッチが行われたことを確認
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });
}); 