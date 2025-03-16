import { z } from 'zod';

export const TransactionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  type: z.enum(['INCOME', 'EXPENSE']),
  amount: z.number().min(1),
  description: z.string().min(1),
  date: z.string(),
  tagIds: z.array(z.string()),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const CreateTransactionSchema = TransactionSchema.omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateTransactionSchema = TransactionSchema.omit({
  userId: true,
  createdAt: true,
  updatedAt: true,
});

export type Transaction = z.infer<typeof TransactionSchema>;
export type CreateTransaction = z.infer<typeof CreateTransactionSchema>;
export type UpdateTransaction = z.infer<typeof UpdateTransactionSchema>; 