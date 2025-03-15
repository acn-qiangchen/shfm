import React from 'react';
import { Tag } from '../../types';

interface TagListProps {
  tags: Tag[];
  onEdit: (tag: Tag) => void;
  onDelete: (id: string) => void;
  isLoading: boolean;
}

export const TagList: React.FC<TagListProps> = ({
  tags,
  onEdit,
  onDelete,
  isLoading,
}) => {
  const handleDelete = (tag: Tag) => {
    if (window.confirm('このタグを削除してもよろしいですか？')) {
      onDelete(tag.id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32" data-testid="loading-spinner">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (tags.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        タグがありません
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {tags.map((tag) => (
        <div
          key={tag.id}
          className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-6 h-6 rounded-full border border-gray-300"
              style={{ backgroundColor: tag.color }}
              data-testid={`color-preview-${tag.id}`}
            />
            <h3 className="font-medium">{tag.name}</h3>
          </div>
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => onEdit(tag)}
              className="text-sm px-3 py-1 text-blue-600 hover:bg-blue-50 rounded"
            >
              編集
            </button>
            <button
              onClick={() => handleDelete(tag)}
              className="text-sm px-3 py-1 text-red-600 hover:bg-red-50 rounded"
            >
              削除
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}; 