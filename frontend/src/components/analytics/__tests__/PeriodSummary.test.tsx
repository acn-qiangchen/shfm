import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { PeriodSummary } from '../PeriodSummary';
import { Transaction } from '../../../types';

const mockTransactions: Transaction[] = [
  {
    id: '1',
    userId: 'user1',
    type: 'expense',
    amount: 1000,
    description: '支出1',
    date: '2024-01-15',
    tagIds: [],
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    userId: 'user1',
    type: 'income',
    amount: 5000,
    description: '収入1',
    date: '2024-02-20',
    tagIds: [],
    createdAt: '2024-02-20T10:00:00Z',
    updatedAt: '2024-02-20T10:00:00Z',
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

describe('PeriodSummary', () => {
  const defaultProps = {
    transactions: mockTransactions,
    isLoading: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders date range inputs', () => {
    render(<PeriodSummary {...defaultProps} />);

    expect(screen.getByLabelText(/開始日/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/終了日/i)).toBeInTheDocument();
  });

  it('shows line chart with correct data', () => {
    render(<PeriodSummary {...defaultProps} />);

    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    expect(screen.getByText('収支推移')).toBeInTheDocument();
  });

  it('updates chart when date range changes', () => {
    render(<PeriodSummary {...defaultProps} />);

    const startDateInput = screen.getByLabelText(/開始日/i);
    const endDateInput = screen.getByLabelText(/終了日/i);

    fireEvent.change(startDateInput, { target: { value: '2024-02-01' } });
    fireEvent.change(endDateInput, { target: { value: '2024-02-28' } });

    // 2月のデータのみが表示されることを確認
    expect(screen.getByText('¥5,000')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    render(<PeriodSummary {...defaultProps} isLoading={true} />);
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('shows message when no transactions in selected period', () => {
    render(<PeriodSummary {...defaultProps} />);

    const startDateInput = screen.getByLabelText(/開始日/i);
    const endDateInput = screen.getByLabelText(/終了日/i);

    fireEvent.change(startDateInput, { target: { value: '2024-04-01' } });
    fireEvent.change(endDateInput, { target: { value: '2024-04-30' } });

    expect(screen.getByText(/選択期間のデータがありません/i)).toBeInTheDocument();
  });

  it('shows preset period buttons', () => {
    render(<PeriodSummary {...defaultProps} />);

    expect(screen.getByText('今月')).toBeInTheDocument();
    expect(screen.getByText('先月')).toBeInTheDocument();
    expect(screen.getByText('過去3ヶ月')).toBeInTheDocument();
    expect(screen.getByText('過去6ヶ月')).toBeInTheDocument();
  });

  it('updates date range when preset button is clicked', () => {
    render(<PeriodSummary {...defaultProps} />);

    fireEvent.click(screen.getByText('先月'));

    const startDateInput = screen.getByLabelText(/開始日/i);
    const endDateInput = screen.getByLabelText(/終了日/i);

    const today = new Date();
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);

    expect(startDateInput).toHaveValue(lastMonth.toISOString().split('T')[0]);
    expect(endDateInput).toHaveValue(lastMonthEnd.toISOString().split('T')[0]);
  });
}); 