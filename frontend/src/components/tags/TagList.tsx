import React from 'react';
import { Tag } from '../../types';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

interface TagListProps {
  tags: Tag[];
  isLoading: boolean;
  onEdit: (tag: Tag) => void;
  onDelete: (tagId: string) => void;
}

export const TagList: React.FC<TagListProps> = ({
  tags,
  isLoading,
  onEdit,
  onDelete,
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (tags.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        タグが登録されていません
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {tags.map((tag) => (
        <div
          key={tag.id}
          className="relative flex items-center justify-between p-4 bg-white rounded-lg shadow"
        >
          <div className="flex items-center space-x-3">
            <div
              className="w-6 h-6 rounded"
              style={{ backgroundColor: tag.color }}
              data-testid="tag-color"
            />
            <span className="text-gray-900 font-medium">{tag.name}</span>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => onEdit(tag)}
              className="p-1 text-gray-400 hover:text-gray-500"
              aria-label="タグを編集"
            >
              <PencilIcon className="h-5 w-5" />
            </button>
            <button
              onClick={() => onDelete(tag.id)}
              className="p-1 text-gray-400 hover:text-red-500"
              aria-label="タグを削除"
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}; 