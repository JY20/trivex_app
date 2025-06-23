'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

interface Transaction {
  id: string;
  type: 'payment' | 'deposit' | 'withdrawal' | 'transfer' | 'on-ramp' | 'off-ramp';
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  timestamp: string;
  createdAt?: string;
  fromUser?: string;
  toUser?: string;
  description?: string;
  userEmail?: string;
  metadata?: {
    originalAmount: number;
  };
}

interface RecentTransactionsWidgetProps {
  className?: string;
}

export default function RecentTransactionsWidget({ className = '' }: RecentTransactionsWidgetProps) {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchRecentTransactions();
    }
  }, [user]);

  const fetchRecentTransactions = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);

    try {
      console.log('Fetching transactions for user:', user.email);
      const res = await fetch('/api/transactions');
      if (res.ok) {
        const data = await res.json();
        console.log('Transactions API response:', data);
        // The API returns { transactions, stats }, so we need to access the transactions array
        const allTransactions = data.transactions || [];
        console.log('All transactions:', allTransactions);
        console.log('Number of transactions:', allTransactions.length);
        // Get the 5 most recent transactions (including failed ones)
        const recentTransactions = allTransactions.slice(0, 5);
        console.log('Recent transactions:', recentTransactions);
        setTransactions(recentTransactions);
      } else {
        console.error('Failed to fetch transactions, status:', res.status);
        setError('Failed to fetch transactions');
      }
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError('Failed to fetch transactions');
    } finally {
      setIsLoading(false);
    }
  };

  const getTransactionIcon = (type: string) => {
    if (type === 'payment') {
      return (
        <div className="w-6 h-6 lg:w-8 lg:h-8 bg-blue-100 rounded-full flex items-center justify-center">
          <svg className="w-3 h-3 lg:w-4 lg:h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </div>
      );
    }
    if (type === 'transfer') {
      return (
        <div className="w-6 h-6 lg:w-8 lg:h-8 bg-purple-100 rounded-full flex items-center justify-center">
          <svg className="w-3 h-3 lg:w-4 lg:h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        </div>
      );
    }
    if (type === 'deposit') {
      return (
        <div className="w-6 h-6 lg:w-8 lg:h-8 bg-green-100 rounded-full flex items-center justify-center">
          <svg className="w-3 h-3 lg:w-4 lg:h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      );
    }
    if (type === 'withdrawal') {
      return (
        <div className="w-6 h-6 lg:w-8 lg:h-8 bg-orange-100 rounded-full flex items-center justify-center">
          <svg className="w-3 h-3 lg:w-4 lg:h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
          </svg>
        </div>
      );
    }
    if (type === 'on-ramp') {
      return (
        <div className="w-6 h-6 lg:w-8 lg:h-8 bg-yellow-100 rounded-full flex items-center justify-center">
          <svg className="w-3 h-3 lg:w-4 lg:h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
          </svg>
        </div>
      );
    }
    if (type === 'off-ramp') {
      return (
        <div className="w-6 h-6 lg:w-8 lg:h-8 bg-red-100 rounded-full flex items-center justify-center">
          <svg className="w-3 h-3 lg:w-4 lg:h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
          </svg>
        </div>
      );
    }
    return (
      <div className="w-6 h-6 lg:w-8 lg:h-8 bg-gray-100 rounded-full flex items-center justify-center">
        <svg className="w-3 h-3 lg:w-4 lg:h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      </div>
    );
  };

  const getStatusColor = (status: string) => {
    if (status === 'completed') return 'text-green-600 bg-green-100';
    if (status === 'pending') return 'text-yellow-600 bg-yellow-100';
    if (status === 'failed') return 'text-red-600 bg-red-100';
    return 'text-gray-600 bg-gray-100';
  };

  const formatAmount = (amount: number, currency: string) => {
    return `${amount.toFixed(2)} ${currency}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const getTransactionDescription = (transaction: Transaction) => {
    if (transaction.type === 'payment') {
      return transaction.description || 'Payment';
    }
    if (transaction.type === 'transfer') {
      return transaction.description || 'Transfer';
    }
    if (transaction.type === 'deposit') {
      return `Deposit ${transaction.currency}`;
    }
    if (transaction.type === 'withdrawal') {
      return `Withdraw ${transaction.currency}`;
    }
    if (transaction.type === 'on-ramp') {
      return `On-Ramp ${transaction.currency}`;
    }
    if (transaction.type === 'off-ramp') {
      return `Off-Ramp ${transaction.currency}`;
    }
    return transaction.description || 'Transaction';
  };

  return (
    <div className={`p-4 lg:p-6 rounded-xl shadow-md bg-white ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl lg:text-2xl font-bold">Recent Transactions</h2>
        <button 
          onClick={fetchRecentTransactions}
          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          title="Refresh transactions"
        >
          <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-3 lg:space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3 animate-pulse">
              <div className="w-6 h-6 lg:w-8 lg:h-8 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-3 lg:h-4 bg-gray-200 rounded w-3/4 mb-1 lg:mb-2"></div>
                <div className="h-2 lg:h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="h-3 lg:h-4 bg-gray-200 rounded w-12 lg:w-16"></div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-6 lg:py-8">
          <p className="text-red-600 mb-2 text-sm lg:text-base">{error}</p>
          <button 
            onClick={fetchRecentTransactions}
            className="text-blue-600 hover:underline text-sm lg:text-base"
          >
            Try again
          </button>
        </div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-6 lg:py-8">
          <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 lg:mb-4">
            <svg className="w-6 h-6 lg:w-8 lg:h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-gray-500 text-sm lg:text-base">No transactions yet</p>
          <p className="text-xs lg:text-sm text-gray-400">Your recent transactions will appear here</p>
        </div>
      ) : (
        <div className="space-y-3 lg:space-y-4">
          {transactions.map((transaction) => (
            <div key={transaction.id} className="flex items-center space-x-2 lg:space-x-3 p-2 lg:p-3 hover:bg-gray-50 rounded-lg transition-colors">
              <div className="flex-shrink-0">
                {getTransactionIcon(transaction.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-xs lg:text-sm font-medium text-gray-900 truncate">
                    {getTransactionDescription(transaction)}
                  </p>
                  <span className={`px-1 lg:px-2 py-0.5 lg:py-1 text-xs font-medium rounded-full ${getStatusColor(transaction.status)}`}>
                    {transaction.status}
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  {formatDate(transaction.createdAt || transaction.timestamp)}
                </p>
              </div>
              
              <div className="text-right flex-shrink-0">
                <p className={`text-xs lg:text-sm font-semibold ${
                  transaction.type === 'withdrawal' || transaction.type === 'off-ramp' || transaction.type === 'payment' || transaction.type === 'transfer' ? 'text-red-600' : 'text-green-600'
                }`}>
                  {transaction.type === 'withdrawal' || transaction.type === 'off-ramp' || transaction.type === 'payment' || transaction.type === 'transfer' ? '-' : '+'}
                  {formatAmount(transaction.metadata?.originalAmount !== undefined ? transaction.metadata.originalAmount : transaction.amount, transaction.currency)}
                </p>
              </div>
            </div>
          ))}
          
          <div className="pt-3 lg:pt-4 border-t border-gray-200">
            <a 
              href="/history" 
              className="block text-center text-blue-600 hover:text-blue-700 font-medium text-xs lg:text-sm"
            >
              View All Transactions →
            </a>
          </div>
        </div>
      )}
    </div>
  );
} 