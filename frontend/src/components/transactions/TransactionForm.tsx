import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Tag, Transaction, TransactionType } from '../../types';
import { TagSelector } from './TagSelector';
import { Numpad } from './Numpad';
import { useTags } from '../../hooks/useTags';

const transactionFormSchema = z.object({
  type: z.enum(['INCOME', 'EXPENSE']),
  amount: z.number().min(1, '金額を入力してください'),
  description: z.string().min(1, '説明を入力してください'),
  date: z.string(),
  tagIds: z.array(z.string()),
});

type TransactionFormData = z.infer<typeof transactionFormSchema>;

interface TransactionFormProps {
  onSubmit: (data: TransactionFormData) => void;
  initialData?: Partial<Transaction>;
  isSubmitting?: boolean;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({
  onSubmit,
  initialData,
  isSubmitting = false,
}) => {
  const [isNumpadVisible, setIsNumpadVisible] = useState(false);
  const { data: tags, isLoading: isLoadingTags } = useTags();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      type: initialData?.type || 'EXPENSE',
      amount: initialData?.amount || 0,
      description: initialData?.description || '',
      date: initialData?.date || new Date().toISOString().split('T')[0],
      tagIds: initialData?.tagIds || [],
    },
  });

  const handleNumpadInput = (value: string) => {
    if (value === 'clear') {
      setValue('amount', 0);
    } else {
      const currentAmount = watch('amount') || 0;
      const newAmount = Number(`${currentAmount}${value}`);
      setValue('amount', newAmount);
    }
  };

  const handleFormSubmit = (data: TransactionFormData) => {
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="flex flex-col space-y-2">
        <label className="text-sm font-medium text-gray-700">種類</label>
        <div className="flex space-x-4">
          <label className="flex items-center">
            <input
              type="radio"
              value="EXPENSE"
              {...register('type')}
              className="mr-2"
            />
            支出
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="INCOME"
              {...register('type')}
              className="mr-2"
            />
            収入
          </label>
        </div>
        {errors.type && (
          <p className="text-sm text-red-600">{errors.type.message}</p>
        )}
      </div>

      <div className="flex flex-col space-y-2">
        <label className="text-sm font-medium text-gray-700">金額</label>
        <div
          className="relative"
          onClick={() => setIsNumpadVisible(!isNumpadVisible)}
        >
          <input
            type="number"
            {...register('amount', { valueAsNumber: true })}
            className="w-full p-2 border rounded-md"
            readOnly
          />
          {isNumpadVisible && (
            <div className="absolute z-10 mt-1 w-full">
              <Numpad onInput={handleNumpadInput} />
            </div>
          )}
        </div>
        {errors.amount && (
          <p className="text-sm text-red-600">{errors.amount.message}</p>
        )}
      </div>

      <div className="flex flex-col space-y-2">
        <label className="text-sm font-medium text-gray-700">説明</label>
        <input
          type="text"
          {...register('description')}
          className="p-2 border rounded-md"
        />
        {errors.description && (
          <p className="text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>

      <div className="flex flex-col space-y-2">
        <label className="text-sm font-medium text-gray-700">日付</label>
        <input
          type="date"
          {...register('date')}
          className="p-2 border rounded-md"
        />
        {errors.date && (
          <p className="text-sm text-red-600">{errors.date.message}</p>
        )}
      </div>

      <div className="flex flex-col space-y-2">
        <label className="text-sm font-medium text-gray-700">タグ</label>
        <Controller
          name="tagIds"
          control={control}
          render={({ field }) => (
            <TagSelector
              tags={tags || []}
              selectedTagIds={field.value}
              onChange={field.onChange}
              isLoading={isLoadingTags}
            />
          )}
        />
        {errors.tagIds && (
          <p className="text-sm text-red-600">{errors.tagIds.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full p-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
      >
        {isSubmitting ? '保存中...' : '保存'}
      </button>
    </form>
  );
}; 