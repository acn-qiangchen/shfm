import { z } from 'zod';

export const TransactionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  date: z.string(),
  type: z.enum(['income', 'expense']),
  amount: z.number().positive(),
  description: z.string(),
  tagIds: z.array(z.string()),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Transaction = z.infer<typeof TransactionSchema>;

export const CreateTransactionSchema = TransactionSchema.omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

export type CreateTransaction = z.infer<typeof CreateTransactionSchema>;

export const UpdateTransactionSchema = CreateTransactionSchema.partial();

export type UpdateTransaction = z.infer<typeof UpdateTransactionSchema>; 