import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { TransactionList } from '../TransactionList';
import { Transaction } from '../../../types';

const mockTransactions: Transaction[] = [
  {
    id: '1',
    userId: 'user1',
    type: 'expense',
    amount: 1000,
    description: 'テスト支出1',
    date: '2024-03-20',
    tagIds: [],
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: '2',
    userId: 'user1',
    type: 'income',
    amount: 5000,
    description: 'テスト収入1',
    date: '2024-03-19',
    tagIds: [],
    createdAt: '2024-03-19T10:00:00Z',
    updatedAt: '2024-03-19T10:00:00Z',
  },
];

describe('TransactionList', () => {
  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();
  const defaultProps = {
    transactions: mockTransactions,
    onEdit: mockOnEdit,
    onDelete: mockOnDelete,
    isLoading: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders transactions in card format', () => {
    render(<TransactionList {...defaultProps} />);

    mockTransactions.forEach(transaction => {
      expect(screen.getByText(transaction.description)).toBeInTheDocument();
      expect(screen.getByText(new RegExp(transaction.amount.toString()))).toBeInTheDocument();
    });
  });

  it('shows loading state', () => {
    render(<TransactionList {...defaultProps} isLoading={true} />);
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('shows empty state when no transactions', () => {
    render(<TransactionList {...defaultProps} transactions={[]} />);
    expect(screen.getByText(/取引がありません/i)).toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', () => {
    render(<TransactionList {...defaultProps} />);
    
    const editButton = screen.getAllByRole('button', { name: /編集/i })[0];
    fireEvent.click(editButton);

    expect(mockOnEdit).toHaveBeenCalledWith(mockTransactions[0]);
  });

  it('calls onDelete when delete button is clicked and confirmed', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    render(<TransactionList {...defaultProps} />);
    
    const deleteButton = screen.getAllByRole('button', { name: /削除/i })[0];
    fireEvent.click(deleteButton);

    expect(mockOnDelete).toHaveBeenCalledWith(mockTransactions[0].id);
  });

  it('does not call onDelete when delete is not confirmed', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    render(<TransactionList {...defaultProps} />);
    
    const deleteButton = screen.getAllByRole('button', { name: /削除/i })[0];
    fireEvent.click(deleteButton);

    expect(mockOnDelete).not.toHaveBeenCalled();
  });

  it('formats date correctly', () => {
    render(<TransactionList {...defaultProps} />);
    expect(screen.getByText('2024年3月20日')).toBeInTheDocument();
  });

  it('shows different styles for income and expense', () => {
    render(<TransactionList {...defaultProps} />);
    
    const expenseAmount = screen.getByText(/-1,000円/);
    const incomeAmount = screen.getByText(/\+5,000円/);

    expect(expenseAmount).toHaveClass('text-red-600');
    expect(incomeAmount).toHaveClass('text-green-600');
  });
}); 