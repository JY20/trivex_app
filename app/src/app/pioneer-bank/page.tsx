'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Image from 'next/image';

interface BankInfo {
  balance: number;
  currency: string;
  xlmBalance: number;
  exchangeRate: number;
}

interface Transaction {
  id: string;
  type: 'transfer' | 'deposit';
  amount: number;
  currency: string;
  timestamp: string;
  status: 'completed' | 'pending' | 'failed';
  description: string;
}

export default function PioneerBank() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [bankInfo, setBankInfo] = useState<BankInfo | null>(null);
  const [transferAmount, setTransferAmount] = useState('');
  const [transferResult, setTransferResult] = useState('');
  const [isTransferLoading, setIsTransferLoading] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoadingBankInfo, setIsLoadingBankInfo] = useState(true);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositResult, setDepositResult] = useState('');
  const [isDepositLoading, setIsDepositLoading] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  const fetchBankInfo = async () => {
    if (!user) return;
    try {
      const res = await fetch('/api/pioneer-bank');
      if (res.ok) {
        const data = await res.json();
        setBankInfo(data);
      }
    } catch (err) {
      console.error('Failed to fetch bank info:', err);
    } finally {
      setIsLoadingBankInfo(false);
    }
  };

  const fetchTransactions = async () => {
    // Mock transactions for now - in a real app, this would come from an API
    const mockTransactions: Transaction[] = [
      {
        id: '1',
        type: 'transfer',
        amount: 100,
        currency: 'CAD',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        status: 'completed',
        description: 'Transfer to Kavodax Wallet'
      },
      {
        id: '2',
        type: 'deposit',
        amount: 500,
        currency: 'CAD',
        timestamp: new Date(Date.now() - 172800000).toISOString(),
        status: 'completed',
        description: 'Salary Deposit'
      }
    ];
    setTransactions(mockTransactions);
  };

  useEffect(() => {
    fetchBankInfo();
    fetchTransactions();
  }, [user]);

  const handleBankTransfer = async () => {
    if (!transferAmount || parseFloat(transferAmount) <= 0) {
      setTransferResult('Please enter a valid amount');
      return;
    }

    setIsTransferLoading(true);
    setTransferResult('');
    try {
      const res = await fetch('/api/pioneer-bank', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: parseFloat(transferAmount) }),
      });
      const data = await res.json();
      if (res.ok) {
        setTransferResult('Transfer successful!');
        setTransferAmount('');
        fetchBankInfo(); // Refresh bank balance
        fetchTransactions(); // Refresh transaction history
      } else {
        setTransferResult(`Error: ${data.error}${data.details ? ` - ${data.details}` : ''}`);
      }
    } catch (err) {
      setTransferResult('An unexpected error occurred.');
    } finally {
      setIsTransferLoading(false);
    }
  };

  const handleDeposit = async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      setDepositResult('Please enter a valid amount');
      return;
    }

    setIsDepositLoading(true);
    setDepositResult('');
    try {
      const res = await fetch('/api/pioneer-bank/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: parseFloat(depositAmount) }),
      });
      const data = await res.json();
      if (res.ok) {
        setDepositResult('Deposit successful!');
        setDepositAmount('');
        fetchBankInfo(); // Refresh bank balance
        fetchTransactions(); // Refresh transaction history
      } else {
        setDepositResult(`Error: ${data.error}${data.details ? ` - ${data.details}` : ''}`);
      }
    } catch (err) {
      setDepositResult('An unexpected error occurred.');
    } finally {
      setIsDepositLoading(false);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading || !user) {
    return <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">Loading...</div>;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      <main className="flex-grow lg:ml-0">
        {/* Mobile header */}
        <div className="lg:hidden bg-white shadow-sm border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <Image src="/Kavodax-Logo.png" alt="Kavodax Logo" width={100} height={26} />
          <div className="w-10"></div> {/* Spacer for centering */}
        </div>

        <div className="p-4 lg:p-8">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-6 lg:mb-8">
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Pioneer Bank</h1>
              <p className="text-gray-600 text-sm lg:text-base">Welcome to your digital banking experience</p>
            </div>

            {/* Account Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mb-6 lg:mb-8">
              <div className="lg:col-span-2">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-4 lg:p-6 text-white">
                  <h2 className="text-lg lg:text-xl font-semibold mb-2">Account Overview</h2>
                  {isLoadingBankInfo ? (
                    <div className="animate-pulse">
                      <div className="h-6 lg:h-8 bg-blue-500 rounded mb-2"></div>
                      <div className="h-3 lg:h-4 bg-blue-500 rounded w-1/2"></div>
                    </div>
                  ) : bankInfo ? (
                    <div>
                      <p className="text-2xl lg:text-3xl font-bold mb-1">
                        {formatCurrency(bankInfo.balance, bankInfo.currency)}
                      </p>
                      <p className="text-blue-100 mb-2 text-sm lg:text-base">Available Balance</p>
                      <div className="text-xs lg:text-sm text-blue-200">
                        <p>XLM Balance: {bankInfo.xlmBalance.toFixed(4)} XLM</p>
                        <p>Exchange Rate: 1 XLM = {formatCurrency(bankInfo.exchangeRate, 'CAD')}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm lg:text-base">Unable to load account information</p>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm">
                <h3 className="text-base lg:text-lg font-semibold mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => document.getElementById('transfer-section')?.scrollIntoView({ behavior: 'smooth' })}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm lg:text-base"
                  >
                    Transfer to Kavodax
                  </button>
                  <button className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors text-sm lg:text-base">
                    View Statements
                  </button>
                  <button className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors text-sm lg:text-base">
                    Contact Support
                  </button>
                </div>
              </div>
            </div>

            {/* Deposit Section */}
            <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm mb-6 lg:mb-8">
              <h2 className="text-xl lg:text-2xl font-bold mb-4 lg:mb-6">Deposit to Pioneer Bank</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount (CAD)
                  </label>
                  <input
                    type="number"
                    placeholder="Enter amount"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="w-full p-2 lg:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm lg:text-base"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={handleDeposit}
                    disabled={isDepositLoading || !depositAmount}
                    className="w-full bg-green-600 text-white py-2 lg:py-3 px-4 lg:px-6 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm lg:text-base"
                  >
                    {isDepositLoading ? 'Processing...' : 'Deposit Funds'}
                  </button>
                </div>
              </div>
              {depositResult && (
                <div className={`mt-4 p-3 lg:p-4 rounded-lg text-sm lg:text-base ${
                  depositResult.includes('Error') 
                    ? 'bg-red-100 text-red-700 border border-red-200' 
                    : 'bg-green-100 text-green-700 border border-green-200'
                }`}>
                  {depositResult}
                </div>
              )}
            </div>

            {/* Transfer Section */}
            <div id="transfer-section" className="bg-white rounded-xl p-4 lg:p-6 shadow-sm mb-6 lg:mb-8">
              <h2 className="text-xl lg:text-2xl font-bold mb-4 lg:mb-6">Transfer to Kavodax Wallet</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount (CAD)
                  </label>
                  <input
                    type="number"
                    placeholder="Enter amount"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    className="w-full p-2 lg:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm lg:text-base"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={handleBankTransfer}
                    disabled={isTransferLoading || !transferAmount}
                    className="w-full bg-blue-600 text-white py-2 lg:py-3 px-4 lg:px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm lg:text-base"
                  >
                    {isTransferLoading ? 'Processing...' : 'Transfer Funds'}
                  </button>
                </div>
              </div>
              {transferResult && (
                <div className={`mt-4 p-3 lg:p-4 rounded-lg text-sm lg:text-base ${
                  transferResult.includes('Error') 
                    ? 'bg-red-100 text-red-700 border border-red-200' 
                    : 'bg-green-100 text-green-700 border border-green-200'
                }`}>
                  {transferResult}
                </div>
              )}
            </div>

            {/* Transaction History */}
            <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm">
              <h2 className="text-xl lg:text-2xl font-bold mb-4 lg:mb-6">Recent Transactions</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 lg:py-3 px-2 lg:px-4 font-semibold text-gray-700 text-xs lg:text-sm">Date</th>
                      <th className="text-left py-2 lg:py-3 px-2 lg:px-4 font-semibold text-gray-700 text-xs lg:text-sm">Description</th>
                      <th className="text-left py-2 lg:py-3 px-2 lg:px-4 font-semibold text-gray-700 text-xs lg:text-sm">Type</th>
                      <th className="text-left py-2 lg:py-3 px-2 lg:px-4 font-semibold text-gray-700 text-xs lg:text-sm">Amount</th>
                      <th className="text-left py-2 lg:py-3 px-2 lg:px-4 font-semibold text-gray-700 text-xs lg:text-sm">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((transaction) => (
                      <tr key={transaction.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-2 lg:py-3 px-2 lg:px-4 text-xs lg:text-sm text-gray-600">
                          {formatDate(transaction.timestamp)}
                        </td>
                        <td className="py-2 lg:py-3 px-2 lg:px-4 text-xs lg:text-sm text-gray-900">
                          {transaction.description}
                        </td>
                        <td className="py-2 lg:py-3 px-2 lg:px-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            transaction.type === 'transfer' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                          </span>
                        </td>
                        <td className="py-2 lg:py-3 px-2 lg:px-4 text-xs lg:text-sm font-medium text-gray-900">
                          {formatCurrency(transaction.amount, transaction.currency)}
                        </td>
                        <td className="py-2 lg:py-3 px-2 lg:px-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            transaction.status === 'completed' 
                              ? 'bg-green-100 text-green-800'
                              : transaction.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {transactions.length === 0 && (
                <div className="text-center py-6 lg:py-8 text-gray-500 text-sm lg:text-base">
                  No transactions found
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 