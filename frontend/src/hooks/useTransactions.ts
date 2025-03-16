import useSWR from 'swr';
import { useCallback } from 'react';
import { API } from 'aws-amplify';
import { Transaction, CreateTransaction, UpdateTransaction } from '../types';

const API_NAME = 'api';

export const useTransactions = () => {
  const fetcher = useCallback(async (path: string) => {
    const response = await API.get(API_NAME, path, {});
    return response.items as Transaction[];
  }, []);

  const { data, error, isLoading, mutate } = useSWR(
    '/transactions',
    fetcher
  );

  const createTransaction = useCallback(async (transaction: CreateTransaction) => {
    const newTransaction = await API.post(API_NAME, '/transactions', {
      body: transaction,
    });

    mutate((currentData) => 
      currentData ? [newTransaction, ...currentData] : [newTransaction]
    );

    return newTransaction;
  }, [mutate]);

  const updateTransaction = useCallback(async (transaction: UpdateTransaction) => {
    const updatedTransaction = await API.put(API_NAME, `/transactions/${transaction.id}`, {
      body: transaction,
    });

    mutate((currentData) => 
      currentData?.map((item) => 
        item.id === transaction.id ? updatedTransaction : item
      )
    );

    return updatedTransaction;
  }, [mutate]);

  const deleteTransaction = useCallback(async (id: string) => {
    await API.del(API_NAME, `/transactions/${id}`, {});

    mutate((currentData) => 
      currentData?.filter((item) => item.id !== id)
    );
  }, [mutate]);

  return {
    transactions: data,
    isLoading,
    error,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    mutate,
  };
}; 