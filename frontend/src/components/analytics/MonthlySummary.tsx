import React from 'react';
import { Transaction } from '../../types';

interface MonthlySummaryProps {
  transactions: Transaction[];
  isLoading: boolean;
}

export const MonthlySummary: React.FC<MonthlySummaryProps> = ({
  transactions,
  isLoading,
}) => {
  const calculateSummary = () => {
    const summary = transactions.reduce(
      (acc, transaction) => {
        if (transaction.type === 'income') {
          acc.income += transaction.amount;
        } else {
          acc.expense += transaction.amount;
        }
        return acc;
      },
      { income: 0, expense: 0 }
    );

    return {
      ...summary,
      balance: summary.income - summary.expense,
    };
  };

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

  const summary = calculateSummary();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-sm font-medium text-gray-500 mb-1">総収入</h3>
        <p className="text-2xl font-bold text-green-600">
          {formatAmount(summary.income)}
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-sm font-medium text-gray-500 mb-1">総支出</h3>
        <p className="text-2xl font-bold text-red-600">
          {formatAmount(summary.expense)}
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-sm font-medium text-gray-500 mb-1">収支バランス</h3>
        <p
          className={`text-2xl font-bold ${
            summary.balance >= 0 ? 'text-green-600' : 'text-red-600'
          }`}
          data-testid="balance-amount"
        >
          {formatAmount(summary.balance)}
        </p>
      </div>
    </div>
  );
}; 