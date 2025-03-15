import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { MonthlySummary } from '../MonthlySummary';
import { Transaction } from '../../../types';

const mockTransactions: Transaction[] = [
  {
    id: '1',
    userId: 'user1',
    type: 'expense',
    amount: 1000,
    description: '支出1',
    date: '2024-03-15',
    tagIds: [],
    createdAt: '2024-03-15T10:00:00Z',
    updatedAt: '2024-03-15T10:00:00Z',
  },
  {
    id: '2',
    userId: 'user1',
    type: 'income',
    amount: 5000,
    description: '収入1',
    date: '2024-03-20',
    tagIds: [],
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: '3',
    userId: 'user1',
    type: 'expense',
    amount: 2000,
    description: '支出2',
    date: '2024-03-25',
    tagIds: [],
    createdAt: '2024-03-25T10:00:00Z',
    updatedAt: '2024-03-25T10:00:00Z',
  },
];

describe('MonthlySummary', () => {
  const defaultProps = {
    transactions: mockTransactions,
    isLoading: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders summary cards with correct amounts', () => {
    render(<MonthlySummary {...defaultProps} />);

    expect(screen.getByText('総収入')).toBeInTheDocument();
    expect(screen.getByText('¥5,000')).toBeInTheDocument();

    expect(screen.getByText('総支出')).toBeInTheDocument();
    expect(screen.getByText('¥3,000')).toBeInTheDocument();

    expect(screen.getByText('収支バランス')).toBeInTheDocument();
    expect(screen.getByText('¥2,000')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    render(<MonthlySummary {...defaultProps} isLoading={true} />);
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('shows zero amounts when no transactions', () => {
    render(<MonthlySummary {...defaultProps} transactions={[]} />);

    expect(screen.getByText('¥0')).toBeInTheDocument();
  });

  it('applies correct color to balance amount', () => {
    render(<MonthlySummary {...defaultProps} />);

    const balanceAmount = screen.getByTestId('balance-amount');
    expect(balanceAmount).toHaveClass('text-green-600');

    // 支出が収入を上回る場合の確認
    const negativeTransactions: Transaction[] = [
      {
        id: '1',
        userId: 'user1',
        type: 'income',
        amount: 1000,
        description: '収入1',
        date: '2024-03-15',
        tagIds: [],
        createdAt: '2024-03-15T10:00:00Z',
        updatedAt: '2024-03-15T10:00:00Z',
      },
      {
        id: '2',
        userId: 'user1',
        type: 'expense',
        amount: 2000,
        description: '支出1',
        date: '2024-03-20',
        tagIds: [],
        createdAt: '2024-03-20T10:00:00Z',
        updatedAt: '2024-03-20T10:00:00Z',
      },
    ];

    render(<MonthlySummary transactions={negativeTransactions} isLoading={false} />);
    const negativeBalanceAmount = screen.getByTestId('balance-amount');
    expect(negativeBalanceAmount).toHaveClass('text-red-600');
  });
}); 