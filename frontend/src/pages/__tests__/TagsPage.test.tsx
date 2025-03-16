import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { API } from 'aws-amplify';
import { TagsPage } from '../TagsPage';
import { useAuth } from '../../components/auth/AuthProvider';
import { Tag } from '../../types';

vi.mock('aws-amplify');
vi.mock('../../components/auth/AuthProvider');

describe('TagsPage', () => {
  const mockUser = {
    id: 'user1',
    email: 'test@example.com',
  };

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

  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({ user: mockUser });
    (API.get as jest.Mock).mockResolvedValue({ tags: mockTags });
  });

  it('タグ一覧を取得して表示すること', async () => {
    render(<TagsPage />);

    expect(screen.getByRole('status')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('タグ1')).toBeInTheDocument();
      expect(screen.getByText('タグ2')).toBeInTheDocument();
    });
  });

  it('新規タグを作成できること', async () => {
    const newTag = {
      name: '新しいタグ',
      color: '#0000FF',
    };

    (API.post as jest.Mock).mockResolvedValueOnce({});
    (API.get as jest.Mock).mockResolvedValueOnce({
      tags: [...mockTags, { ...newTag, id: '3', userId: 'user1' }],
    });

    render(<TagsPage />);

    await waitFor(() => {
      expect(screen.getByText('タグを追加')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('タグを追加'));
    fireEvent.change(screen.getByLabelText('タグ名'), {
      target: { value: newTag.name },
    });
    fireEvent.change(screen.getByLabelText('色'), {
      target: { value: newTag.color },
    });
    fireEvent.click(screen.getByRole('button', { name: '作成' }));

    await waitFor(() => {
      expect(API.post).toHaveBeenCalledWith('api', '/tags', {
        body: newTag,
      });
    });
  });

  it('タグを編集できること', async () => {
    const updatedTag = {
      name: '更新されたタグ',
      color: '#0000FF',
    };

    (API.put as jest.Mock).mockResolvedValueOnce({});
    (API.get as jest.Mock)
      .mockResolvedValueOnce({ tags: mockTags })
      .mockResolvedValueOnce({
        tags: [
          { ...mockTags[0], ...updatedTag },
          mockTags[1],
        ],
      });

    render(<TagsPage />);

    await waitFor(() => {
      expect(screen.getAllByLabelText('タグを編集')).toHaveLength(2);
    });

    fireEvent.click(screen.getAllByLabelText('タグを編集')[0]);
    fireEvent.change(screen.getByLabelText('タグ名'), {
      target: { value: updatedTag.name },
    });
    fireEvent.change(screen.getByLabelText('色'), {
      target: { value: updatedTag.color },
    });
    fireEvent.click(screen.getByRole('button', { name: '更新' }));

    await waitFor(() => {
      expect(API.put).toHaveBeenCalledWith(`api/tags/${mockTags[0].id}`, {
        body: updatedTag,
      });
    });
  });

  it('タグを削除できること', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    (API.del as jest.Mock).mockResolvedValueOnce({});
    (API.get as jest.Mock)
      .mockResolvedValueOnce({ tags: mockTags })
      .mockResolvedValueOnce({
        tags: [mockTags[1]],
      });

    render(<TagsPage />);

    await waitFor(() => {
      expect(screen.getAllByLabelText('タグを削除')).toHaveLength(2);
    });

    fireEvent.click(screen.getAllByLabelText('タグを削除')[0]);

    await waitFor(() => {
      expect(API.del).toHaveBeenCalledWith(`api/tags/${mockTags[0].id}`, {});
    });
  });

  it('タグ一覧の取得に失敗した場合にエラーをログ出力すること', async () => {
    const error = new Error('Failed to fetch tags');
    (API.get as jest.Mock).mockRejectedValue(error);
    const consoleSpy = vi.spyOn(console, 'error');

    render(<TagsPage />);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Failed to fetch tags:', error);
    });
  });
}); 