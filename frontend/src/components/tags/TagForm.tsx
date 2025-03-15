import React, { useState, useEffect } from 'react';
import { Tag } from '../../types';

interface CreateTagData {
  name: string;
  color: string;
}

interface TagFormProps {
  tag?: Tag;
  onSubmit: (data: CreateTagData) => void;
  isSubmitting: boolean;
}

export const TagForm: React.FC<TagFormProps> = ({
  tag,
  onSubmit,
  isSubmitting,
}) => {
  const [name, setName] = useState(tag?.name ?? '');
  const [color, setColor] = useState(tag?.color ?? '#FF0000');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (tag) {
      setName(tag.name);
      setColor(tag.color);
    }
  }, [tag]);

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    if (!name.trim()) {
      newErrors.name = 'タグ名を入力してください';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    onSubmit({
      name: name.trim(),
      color,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          タグ名
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={`
            w-full px-4 py-2 rounded-lg border
            ${errors.name ? 'border-red-500' : 'border-gray-300'}
            focus:outline-none focus:ring-2 focus:ring-blue-500
          `}
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          色
        </label>
        <div className="flex items-center gap-4">
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="h-10 w-20"
          />
          <div
            className="w-10 h-10 rounded-lg border border-gray-300"
            style={{ backgroundColor: color }}
            data-testid="color-preview"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className={`
          w-full py-3 px-4 rounded-lg font-medium text-white
          ${isSubmitting
            ? 'bg-blue-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'
          }
        `}
      >
        {isSubmitting ? '登録中...' : '登録'}
      </button>
    </form>
  );
}; 