export interface Transaction {
  id: string;
  userId: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  date: string;
  tagIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateTransaction {
  type: 'income' | 'expense';
  amount: number;
  description: string;
  date: string;
  tagIds: string[];
}

export interface Tag {
  id: string;
  userId: string;
  name: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
} 