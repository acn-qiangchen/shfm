import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { TransactionForm } from '../TransactionForm';
import { CreateTransaction } from '../../../types';

describe('TransactionForm', () => {
  const mockOnSubmit = vi.fn();
  const defaultProps = {
    onSubmit: mockOnSubmit,
    isSubmitting: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all form fields', () => {
    render(<TransactionForm {...defaultProps} />);

    expect(screen.getByLabelText(/金額/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/日付/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/説明/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /収入/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /支出/i })).toBeInTheDocument();
  });

  it('shows numpad when amount field is focused', () => {
    render(<TransactionForm {...defaultProps} />);
    
    const amountInput = screen.getByLabelText(/金額/i);
    fireEvent.focus(amountInput);

    expect(screen.getByTestId('numpad')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '0' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'クリア' })).toBeInTheDocument();
  });

  it('updates amount when numpad is used', () => {
    render(<TransactionForm {...defaultProps} />);
    
    const amountInput = screen.getByLabelText(/金額/i);
    fireEvent.focus(amountInput);

    fireEvent.click(screen.getByRole('button', { name: '1' }));
    fireEvent.click(screen.getByRole('button', { name: '2' }));
    fireEvent.click(screen.getByRole('button', { name: '3' }));

    expect(amountInput).toHaveValue('123');
  });

  it('submits form with valid data', async () => {
    render(<TransactionForm {...defaultProps} />);

    const expectedData: CreateTransaction = {
      amount: 1000,
      date: new Date().toISOString().split('T')[0],
      type: 'expense',
      description: 'テスト支出',
      tagIds: [],
    };

    fireEvent.focus(screen.getByLabelText(/金額/i));
    fireEvent.click(screen.getByRole('button', { name: '1' }));
    fireEvent.click(screen.getByRole('button', { name: '0' }));
    fireEvent.click(screen.getByRole('button', { name: '0' }));
    fireEvent.click(screen.getByRole('button', { name: '0' }));

    fireEvent.change(screen.getByLabelText(/説明/i), {
      target: { value: expectedData.description },
    });

    fireEvent.click(screen.getByRole('button', { name: /登録/i }));

    expect(mockOnSubmit).toHaveBeenCalledWith(expectedData);
  });

  it('shows validation errors for invalid data', async () => {
    render(<TransactionForm {...defaultProps} />);

    // 金額を入力せずに送信
    fireEvent.click(screen.getByRole('button', { name: /登録/i }));

    expect(screen.getByText(/金額を入力してください/i)).toBeInTheDocument();
  });

  it('disables submit button while submitting', () => {
    render(<TransactionForm {...defaultProps} isSubmitting={true} />);

    expect(screen.getByRole('button', { name: /登録/i })).toBeDisabled();
  });
}); 