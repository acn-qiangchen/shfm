import React, { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Transaction } from '../../types';

interface PeriodSummaryProps {
  transactions: Transaction[];
  isLoading: boolean;
}

interface ChartData {
  date: string;
  income: number;
  expense: number;
  balance: number;
}

export const PeriodSummary: React.FC<PeriodSummaryProps> = ({
  transactions,
  isLoading,
}) => {
  const today = new Date();
  const [startDate, setStartDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
      .toISOString()
      .split('T')[0]
  );
  const [endDate, setEndDate] = useState(
    new Date(today.getFullYear(), today.getMonth() + 1, 0)
      .toISOString()
      .split('T')[0]
  );

  const chartData = useMemo(() => {
    const filteredTransactions = transactions.filter(
      (t) => t.date >= startDate && t.date <= endDate
    );

    if (filteredTransactions.length === 0) {
      return [];
    }

    // 日付ごとの集計データを作成
    const dailyData = new Map<string, ChartData>();
    let currentDate = new Date(startDate);
    const end = new Date(endDate);

    while (currentDate <= end) {
      const dateStr = currentDate.toISOString().split('T')[0];
      dailyData.set(dateStr, {
        date: dateStr,
        income: 0,
        expense: 0,
        balance: 0,
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // トランザクションデータを集計
    filteredTransactions.forEach((transaction) => {
      const data = dailyData.get(transaction.date);
      if (data) {
        if (transaction.type === 'income') {
          data.income += transaction.amount;
        } else {
          data.expense += transaction.amount;
        }
        data.balance = data.income - data.expense;
      }
    });

    // 累計を計算
    let runningBalance = 0;
    return Array.from(dailyData.values()).map((data) => {
      runningBalance += data.balance;
      return {
        ...data,
        balance: runningBalance,
      };
    });
  }, [transactions, startDate, endDate]);

  const formatAmount = (amount: number) => {
    return `¥${amount.toLocaleString()}`;
  };

  const handlePresetPeriod = (months: number) => {
    const end = new Date();
    const start = new Date();
    if (months === 1) {
      // 今月
      start.setDate(1);
    } else if (months === -1) {
      // 先月
      start.setMonth(start.getMonth() - 1, 1);
      end.setDate(0);
    } else {
      // 過去X月
      start.setMonth(start.getMonth() - months + 1, 1);
    }
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32" data-testid="loading-spinner">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => handlePresetPeriod(1)}
          className="px-3 py-1 text-sm rounded-lg bg-gray-100 hover:bg-gray-200"
        >
          今月
        </button>
        <button
          onClick={() => handlePresetPeriod(-1)}
          className="px-3 py-1 text-sm rounded-lg bg-gray-100 hover:bg-gray-200"
        >
          先月
        </button>
        <button
          onClick={() => handlePresetPeriod(3)}
          className="px-3 py-1 text-sm rounded-lg bg-gray-100 hover:bg-gray-200"
        >
          過去3ヶ月
        </button>
        <button
          onClick={() => handlePresetPeriod(6)}
          className="px-3 py-1 text-sm rounded-lg bg-gray-100 hover:bg-gray-200"
        >
          過去6ヶ月
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            開始日
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            終了日
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {chartData.length > 0 ? (
        <div>
          <h3 className="text-lg font-medium mb-4">収支推移</h3>
          <div className="h-64" data-testid="line-chart">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis tickFormatter={formatAmount} />
                <Tooltip formatter={formatAmount} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="income"
                  name="収入"
                  stroke="#10B981"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="expense"
                  name="支出"
                  stroke="#EF4444"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="balance"
                  name="収支バランス"
                  stroke="#3B82F6"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          選択期間のデータがありません
        </div>
      )}
    </div>
  );
}; 