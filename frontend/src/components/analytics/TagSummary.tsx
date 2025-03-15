import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Transaction, Tag } from '../../types';

interface TagSummaryProps {
  transactions: Transaction[];
  tags: Tag[];
  isLoading: boolean;
}

interface TagData {
  id: string;
  name: string;
  color: string;
  amount: number;
  percentage: number;
}

export const TagSummary: React.FC<TagSummaryProps> = ({
  transactions,
  tags,
  isLoading,
}) => {
  const tagData = useMemo(() => {
    const tagMap = new Map(tags.map(tag => [tag.id, tag]));
    const tagSums = new Map<string, number>();

    // タグごとの合計金額を計算
    transactions
      .filter(t => t.type === 'expense')
      .forEach(transaction => {
        transaction.tagIds.forEach(tagId => {
          const currentSum = tagSums.get(tagId) || 0;
          tagSums.set(tagId, currentSum + transaction.amount);
        });
      });

    // 総支出を計算
    const totalExpense = Array.from(tagSums.values()).reduce((sum, amount) => sum + amount, 0);

    // タグデータを作成
    const data: TagData[] = Array.from(tagSums.entries())
      .map(([tagId, amount]) => {
        const tag = tagMap.get(tagId);
        if (!tag) return null;

        return {
          id: tag.id,
          name: tag.name,
          color: tag.color,
          amount,
          percentage: totalExpense > 0 ? (amount / totalExpense) * 100 : 0,
        };
      })
      .filter((item): item is TagData => item !== null)
      .sort((a, b) => b.amount - a.amount);

    return data;
  }, [transactions, tags]);

  const formatAmount = (amount: number) => {
    return `¥${amount.toLocaleString()}`;
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
        タグが設定されていません
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        データがありません
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-medium mb-4">タグ別支出</h3>
      <div className="h-64" data-testid="pie-chart">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={tagData}
              dataKey="amount"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label={({ name, percentage }) => `${name} ${percentage.toFixed(1)}%`}
            >
              {tagData.map((entry) => (
                <Cell key={entry.id} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => formatAmount(value)}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 space-y-2">
        {tagData.map(tag => (
          <div key={tag.id} className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: tag.color }}
              />
              <span>{tag.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-500">{tag.percentage.toFixed(1)}%</span>
              <span className="font-medium">{formatAmount(tag.amount)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 