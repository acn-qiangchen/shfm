import React from 'react';
import { Transaction } from '../../types';

interface TransactionListProps {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
  isLoading: boolean;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  onEdit,
  onDelete,
  isLoading,
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric'
    }).format(date);
  };

  const formatAmount = (type: string, amount: number) => {
    const prefix = type === 'expense' ? '-' : '+';
    return `${prefix}${amount.toLocaleString()}円`;
  };

  const handleDelete = (transaction: Transaction) => {
    if (window.confirm('この取引を削除してもよろしいですか？')) {
      onDelete(transaction.id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32" data-testid="loading-spinner">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        取引がありません
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {transactions.map((transaction) => (
        <div
          key={transaction.id}
          className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="font-medium">{transaction.description}</h3>
              <p className="text-sm text-gray-500">{formatDate(transaction.date)}</p>
            </div>
            <span
              className={`font-medium ${
                transaction.type === 'expense' ? 'text-red-600' : 'text-green-600'
              }`}
            >
              {formatAmount(transaction.type, transaction.amount)}
            </span>
          </div>
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => onEdit(transaction)}
              className="text-sm px-3 py-1 text-blue-600 hover:bg-blue-50 rounded"
            >
              編集
            </button>
            <button
              onClick={() => handleDelete(transaction)}
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