import React from 'react';
import { Tag } from '../../types';

interface TagSelectorProps {
  tags: Tag[];
  selectedTagIds: string[];
  onChange: (tagIds: string[]) => void;
  isLoading?: boolean;
}

export const TagSelector: React.FC<TagSelectorProps> = ({
  tags,
  selectedTagIds,
  onChange,
  isLoading = false,
}) => {
  const handleTagClick = (tagId: string) => {
    const newSelectedTagIds = selectedTagIds.includes(tagId)
      ? selectedTagIds.filter(id => id !== tagId)
      : [...selectedTagIds, tagId];
    onChange(newSelectedTagIds);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-8">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (tags.length === 0) {
    return (
      <div className="text-sm text-gray-500">
        タグが登録されていません
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2" data-testid="tag-selector">
      {tags.map((tag) => (
        <button
          key={tag.id}
          onClick={() => handleTagClick(tag.id)}
          className={`
            inline-flex items-center px-3 py-1 rounded-full text-sm
            ${
              selectedTagIds.includes(tag.id)
                ? 'ring-2 ring-offset-2 ring-primary-500'
                : ''
            }
          `}
          style={{
            backgroundColor: tag.color,
            color: getContrastColor(tag.color),
          }}
          aria-pressed={selectedTagIds.includes(tag.id)}
        >
          {tag.name}
        </button>
      ))}
    </div>
  );
};

// タグの背景色に応じて文字色を白か黒か決定する関数
function getContrastColor(hexColor: string): string {
  // カラーコードをRGBに変換
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  
  // 輝度を計算（YIQ式）
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  
  return yiq >= 128 ? '#000000' : '#FFFFFF';
} 