import useSWR from 'swr';
import { Tag } from '../types';

const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('タグの取得に失敗しました');
  }
  return response.json();
};

export const useTags = () => {
  const { data, error, mutate } = useSWR<Tag[]>('/api/tags', fetcher);

  return {
    data,
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
}; 