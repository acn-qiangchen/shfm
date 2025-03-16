export type Tag = {
  id: string;
  userId: string;
  name: string;
  color: string;
  createdAt: string;
  updatedAt: string;
};

export type TransactionType = 'INCOME' | 'EXPENSE';

export type Transaction = {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  description: string;
  date: string;
  tagIds: string[];
  createdAt: string;
  updatedAt: string;
};

export type CreateTransaction = Omit<Transaction, 'id' | 'userId' | 'createdAt' | 'updatedAt'>;
export type UpdateTransaction = Omit<Transaction, 'userId' | 'createdAt' | 'updatedAt'>;

export interface User {
  id: string;
  email: string;
  name?: string;
} 