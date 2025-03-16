import React, { useState, useEffect } from 'react';
import { API } from 'aws-amplify';
import { Tag } from '../types';
import { TagList } from '../components/tags/TagList';
import { TagForm } from '../components/tags/TagForm';
import { useAuth } from '../components/auth/AuthProvider';

export const TagsPage: React.FC = () => {
  const { user } = useAuth();
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [showForm, setShowForm] = useState(false);

  const fetchTags = async () => {
    try {
      setIsLoading(true);
      const response = await API.get('api', '/tags', {});
      setTags(response.tags);
    } catch (error) {
      console.error('Failed to fetch tags:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchTags();
    }
  }, [user]);

  const handleCreateTag = async (data: { name: string; color: string }) => {
    try {
      setIsSubmitting(true);
      await API.post('api', '/tags', {
        body: data,
      });
      await fetchTags();
      setShowForm(false);
    } catch (error) {
      console.error('Failed to create tag:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateTag = async (data: { name: string; color: string }) => {
    if (!editingTag) return;

    try {
      setIsSubmitting(true);
      await API.put('api', `/tags/${editingTag.id}`, {
        body: data,
      });
      await fetchTags();
      setEditingTag(null);
    } catch (error) {
      console.error('Failed to update tag:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTag = async (tagId: string) => {
    if (!window.confirm('このタグを削除してもよろしいですか？')) {
      return;
    }

    try {
      await API.del('api', `/tags/${tagId}`, {});
      await fetchTags();
    } catch (error) {
      console.error('Failed to delete tag:', error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">タグ管理</h1>
        {!showForm && !editingTag && (
          <button
            onClick={() => setShowForm(true)}
            className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            タグを追加
          </button>
        )}
      </div>

      {(showForm || editingTag) && (
        <div className="mb-8 bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-900 mb-6">
            {editingTag ? 'タグを編集' : 'タグを追加'}
          </h2>
          <TagForm
            tag={editingTag || undefined}
            onSubmit={editingTag ? handleUpdateTag : handleCreateTag}
            isLoading={isSubmitting}
          />
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => {
                setShowForm(false);
                setEditingTag(null);
              }}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              キャンセル
            </button>
          </div>
        </div>
      )}

      <TagList
        tags={tags}
        isLoading={isLoading}
        onEdit={setEditingTag}
        onDelete={handleDeleteTag}
      />
    </div>
  );
}; 