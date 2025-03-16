import React, { useState } from 'react';
import { useTransactions } from '../hooks/useTransactions';
import { TransactionForm } from '../components/transactions/TransactionForm';
import { TransactionList } from '../components/transactions/TransactionList';
import { Transaction } from '../types';

export const TransactionsPage: React.FC = () => {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const { data: transactions, isLoading, mutate } = useTransactions();

  const handleCreateTransaction = async (data: Omit<Transaction, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('トランザクションの作成に失敗しました');
      }

      await mutate();
      setIsFormVisible(false);
      setSelectedTransaction(null);
    } catch (error) {
      console.error('Error creating transaction:', error);
      alert('トランザクションの作成に失敗しました');
    }
  };

  const handleUpdateTransaction = async (data: Omit<Transaction, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!selectedTransaction) return;

    try {
      const response = await fetch(`/api/transactions/${selectedTransaction.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('トランザクションの更新に失敗しました');
      }

      await mutate();
      setIsFormVisible(false);
      setSelectedTransaction(null);
    } catch (error) {
      console.error('Error updating transaction:', error);
      alert('トランザクションの更新に失敗しました');
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!confirm('このトランザクションを削除してもよろしいですか？')) {
      return;
    }

    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('トランザクションの削除に失敗しました');
      }

      await mutate();
    } catch (error) {
      console.error('Error deleting transaction:', error);
      alert('トランザクションの削除に失敗しました');
    }
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsFormVisible(true);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">トランザクション一覧</h1>
        <button
          onClick={() => {
            setSelectedTransaction(null);
            setIsFormVisible(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          新規作成
        </button>
      </div>

      {isFormVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {selectedTransaction ? 'トランザクションの編集' : '新規トランザクション'}
              </h2>
              <button
                onClick={() => {
                  setIsFormVisible(false);
                  setSelectedTransaction(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <TransactionForm
              onSubmit={selectedTransaction ? handleUpdateTransaction : handleCreateTransaction}
              initialData={selectedTransaction}
              isSubmitting={false}
            />
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <TransactionList
          transactions={transactions || []}
          onEdit={handleEditTransaction}
          onDelete={handleDeleteTransaction}
        />
      )}
    </div>
  );
}; 