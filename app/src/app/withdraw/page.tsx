'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { BankAccount } from '@/types/bank';
import { convertXLMToCurrency, getExchangeRates, convertCurrencyToXLM } from '@/lib/currency-converter';
import Image from 'next/image';

interface WithdrawalForm {
  bankAccountId: string;
  amount: string;
  description: string;
}

interface WithdrawalResponse {
  success: boolean;
  transactionId: string;
  stellarTransactionHash: string;
  amount: number;
  currency: string;
  bankAccount: {
    bankName: string;
    accountNumber: string;
  };
  message: string;
}

export default function WithdrawPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [bankAccountsLoading, setBankAccountsLoading] = useState(true);
  const [form, setForm] = useState<WithdrawalForm>({
    bankAccountId: '',
    amount: '',
    description: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<WithdrawalResponse | null>(null);
  const [error, setError] = useState<string>('');
  const [balance, setBalance] = useState<string>('');
  const [balanceLoading, setBalanceLoading] = useState(true);
  const [convertedSuccessAmount, setConvertedSuccessAmount] = useState<string>('');

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user) {
      setBankAccountsLoading(true);
      fetchBalance();
      if (user.bankAccounts) {
        setBankAccounts(user.bankAccounts);
        setBankAccountsLoading(false);
      } else {
        setBankAccounts([]);
        setBankAccountsLoading(false);
      }
    }
  }, [user]);

  const fetchBalance = async () => {
    setBalanceLoading(true);
    if (!user?.stellarPublicKey) {
      setBalanceLoading(false);
      return;
    }
    try {
      const res = await fetch(`/api/account/balance?publicKey=${user.stellarPublicKey}`);
      const data = await res.json();
      const xlmObj = data.balances?.find((b: any) => b.asset_type === 'native');
      if (xlmObj) {
        const xlm = parseFloat(xlmObj.balance);
        // Use user's preferred currency
        const preferredCurrency = (user as any).preferredCurrency || 'CAD';
        try {
          await getExchangeRates(); // Update rates cache
          const convertedValue = convertXLMToCurrency(xlm, preferredCurrency);
          setBalance(convertedValue);
        } catch (err) {
          setBalance('N/A');
        }
      }
    } catch (err) {
      console.error('Failed to fetch balance:', err);
    }
    setBalanceLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setIsSubmitting(true);

    if (!user) {
      setError('You must be logged in to make a withdrawal.');
      setIsSubmitting(false);
      return;
    }

    try {
      const preferredCurrency = user.preferredCurrency || 'CAD';
      const amountInXLM = Number ((convertCurrencyToXLM(parseFloat(form.amount), preferredCurrency)).toFixed(7));
      const amountValue = parseFloat(form.amount);

      console.log( 'AmountInXLM: ', amountInXLM);

      const res = await fetch('/api/account/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bankAccountId: form.bankAccountId,
          amount: amountInXLM.toString(),
          description: form.description,
          amountInFiat: amountValue.toString(),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setResult(data);
        const convertedValue = convertXLMToCurrency(data.amount, preferredCurrency);
        setConvertedSuccessAmount(convertedValue);
        setForm({ bankAccountId: '', amount: '', description: '' });
        fetchBalance(); // Refresh balance
      } else {
        setError(data.error || 'Failed to process withdrawal');
      }
    } catch (err: any) {
      setError(err.message || 'Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof WithdrawalForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      <main className="flex-grow lg:ml-0 transition-all duration-300">
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
          <Image src="/kavodax-round-logo-white.png" alt="Kavodax Logo" width={40} height={40} />
          <div className="w-10"></div> {/* Spacer for centering */}
        </div>

        {/* Navy Header Section */}
        <div className="p-6 lg:p-10 bg-navy text-white">
          <h1 className="text-2xl lg:text-3xl font-bold">Withdraw Funds</h1>
          <p className="text-sm lg:text-base text-gray-300 mt-1">Transfer funds from your Kavodax wallet to your connected bank account</p>
        </div>

        <div className="p-6 lg:p-10">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-md p-6 lg:p-8 mb-6 lg:mb-8">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-xl lg:text-2xl font-bold text-navy">Withdraw to Bank</h2>
              </div>

              {/* Balance Display */}
              <div className="bg-navy text-white p-6 rounded-xl mb-6">
                <p className="text-sm text-gray-300 mb-2">Available Balance</p>
                {balanceLoading ? (
                  <div className="h-10 w-48 bg-white/30 rounded animate-pulse mt-2" />
                ) : (
                  <div className="text-3xl lg:text-4xl font-bold">
                    {balance || '0'} {user && (user as any).preferredCurrency ? (user as any).preferredCurrency : 'CAD'}
                  </div>
                )}
              </div>

              {/* Withdrawal Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Bank Account Selection */}
                <div>
                  <label htmlFor="bankAccount" className="block text-sm font-medium text-gray-700 mb-2">
                    Select Bank Account
                  </label>
                  {bankAccountsLoading ? (
                    <div className="h-12 w-full bg-gray-200 rounded animate-pulse" />
                  ) : (
                    <>
                      <select
                        id="bankAccount"
                        value={form.bankAccountId}
                        onChange={(e) => handleInputChange('bankAccountId', e.target.value)}
                        required
                        className="w-full p-3 lg:p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-main focus:border-orange-main text-sm lg:text-base bg-gray-50"
                      >
                        <option value="">Choose a bank account</option>
                        {bankAccounts.map((account) => (
                          <option key={account.id} value={account.id}>
                            {account.bankName} - {account.accountNumber} {account.isPrimary && '(Primary)'}
                          </option>
                        ))}
                      </select>
                      {bankAccounts.length === 0 && (
                        <p className="text-sm text-red-600 mt-2">
                          No bank accounts connected. Please add a bank account in your profile first.
                        </p>
                      )}
                    </>
                  )}
                </div>

                {/* Amount */}
                <div>
                  <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                    Amount
                  </label>
                  <div className="flex items-stretch gap-3">
                    <input
                      type="number"
                      id="amount"
                      value={form.amount}
                      onChange={(e) => handleInputChange('amount', e.target.value)}
                      required
                      min="0.01"
                      step="0.01"
                      placeholder="0.00"
                      className="flex-1 p-3 lg:p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-main focus:border-orange-main text-sm lg:text-base bg-gray-50"
                    />
                    <div className="flex items-center px-4 py-3 bg-gray-200 rounded-lg">
                      <span className="text-gray-800 font-medium text-sm lg:text-base">
                        {user.preferredCurrency || 'CAD'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Description (Optional)
                  </label>
                  <input
                    type="text"
                    id="description"
                    value={form.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="e.g., Monthly withdrawal"
                    className="w-full p-3 lg:p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-main focus:border-orange-main text-sm lg:text-base bg-gray-50"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || !form.bankAccountId || !form.amount}
                  className="w-full py-3 lg:py-4 px-6 bg-orange-main text-white font-bold rounded-lg hover:bg-orange-hover disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm lg:text-base"
                >
                  Withdraw Funds
                </button>
              </form>

              {/* Loading/Processing State */}
              {isSubmitting && (
                <div className="mt-6 flex flex-col items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-main mb-2"></div>
                  <p className="text-orange-main font-medium text-base">Processing...</p>
                </div>
              )}

              {/* Error Display */}
              {!isSubmitting && error && (
                <div className="mt-6 p-4 lg:p-6 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-red-800 text-sm lg:text-base">{error}</p>
                </div>
              )}

              {/* Success Display */}
              {!isSubmitting && result && (
                <div className="mt-6 p-4 lg:p-6 bg-green-50 border border-green-200 rounded-xl">
                  <h3 className="text-lg lg:text-xl font-bold text-green-800 mb-4">Withdrawal Successful!</h3>
                  <div className="space-y-3 text-sm lg:text-base text-green-700">
                    <p><strong>Transaction ID:</strong> {result.transactionId}</p>
                    <p><strong>Amount:</strong> {convertedSuccessAmount} {user.preferredCurrency || 'CAD'}</p>
                    <p><strong>Bank Account:</strong> {result.bankAccount.bankName} - {result.bankAccount.accountNumber}</p>
                    <p><strong>Stellar Hash:</strong> <span className="font-mono text-xs lg:text-sm break-all">{result.stellarTransactionHash}</span></p>
                    <p><strong>Message:</strong> {result.message}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 