'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { convertXLMToCurrency, getExchangeRates, convertCurrencyToXLM } from '@/lib/currency-converter';
import Image from 'next/image';
import { User } from '@/types/user';

interface DepositForm {
  bankAccountId: string;
  amount: string;
}

interface DepositResponse {
  success: boolean;
  transactionId: string;
  stellarTransactionId: string;
  amount: number;
  currency: string;
  bankAccount: {
    bankName: string;
    accountNumber: string;
    isPioneerBank: boolean;
  };
  message: string;
}

export default function DepositPage() {
  const { user, isLoading, login } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [bankAccounts, setBankAccounts] = useState<any[]>([]);
  const [bankAccountsLoading, setBankAccountsLoading] = useState(true);
  const [hasRetried, setHasRetried] = useState(false);
  const [form, setForm] = useState<DepositForm>({
    bankAccountId: '',
    amount: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<DepositResponse | null>(null);
  const [error, setError] = useState<string>('');
  const [balance, setBalance] = useState<string>('0');
  const [numericBalance, setNumericBalance] = useState<number>(0);
  const [convertedSuccessAmount, setConvertedSuccessAmount] = useState<number>(0);
  const [balanceLoading, setBalanceLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  // Retry mechanism: refetch user if bankAccounts is empty after first load
  useEffect(() => {
    if (user && (!user.bankAccounts || user.bankAccounts.length === 0) && !hasRetried) {
      setHasRetried(true);
      fetch('/api/user')
        .then(res => res.json())
        .then(data => {
          if (data.user) {
            login(data.user as User);
          }
        });
    }
  }, [user, hasRetried, login]);

  useEffect(() => {
    if (user) {
      setBalanceLoading(true);
      setBankAccountsLoading(true);
      fetchBalance();
      if (user.bankAccounts && user.bankAccounts.length > 0) {
        const accounts = user.bankAccounts;
        setBankAccounts(accounts);
        // Default to Pioneer Bank if present, else first bank
        const pioneer = accounts.find(acc => acc.isPioneerBank);
        setForm(prev => ({ ...prev, bankAccountId: pioneer ? pioneer.id : accounts[0]?.id || '' }));
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
          
          // Get the raw rate for direct calculation
          const rates = await getExchangeRates();
          const rate = rates[preferredCurrency.toLowerCase()] || 0.33;
        
          
          // Get the formatted string for display
          const convertedValue = convertXLMToCurrency(xlm, preferredCurrency);
          setBalance(convertedValue);
          setNumericBalance(parseFloat(convertedValue));
        } catch (err) {
          setBalance('0');
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
    setConvertedSuccessAmount(0);
    setIsSubmitting(true);

    if (!user) {
      setError('You must be logged in to make a deposit.');
      setIsSubmitting(false);
      return;
    }

    try {
      const preferredCurrency = user.preferredCurrency || 'CAD';
      const amountValue = parseFloat(form.amount);
      const amountInXLM = convertCurrencyToXLM(amountValue, preferredCurrency);

      const res = await fetch('/api/account/load', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bankAccountId: form.bankAccountId,
          amount: amountInXLM.toString(),
          amountInFiat: amountValue.toString(),
          prevBalance: numericBalance.toString(),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        const resultData = data as DepositResponse;
        setResult(resultData);
        const convertedValue = convertXLMToCurrency(resultData.amount, preferredCurrency);
        setConvertedSuccessAmount(resultData.amount);
        setForm(prev => ({ ...prev, amount: '' }));
        fetchBalance(); // Refresh balance
      } else {
        setError(data.error || 'Failed to process deposit');
      }
    } catch (err: any) {
      setError(err.message || 'Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof DepositForm, value: string) => {
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
          <h1 className="text-2xl lg:text-3xl font-bold">Deposit Funds</h1>
          <p className="text-sm lg:text-base text-gray-300 mt-1">Transfer funds from your connected bank account to your Kavodax wallet</p>
        </div>

        <div className="p-6 lg:p-10">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-md p-6 lg:p-8 mb-6 lg:mb-8">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-xl lg:text-2xl font-bold text-navy">Deposit from Bank</h2>
              </div>

              {/* Balance Display */}
              <div className="bg-navy text-white p-6 rounded-xl mb-6">
                <p className="text-sm text-gray-300 mb-2">Current Wallet Balance</p>
                {balanceLoading ? (
                  <div className="h-10 w-48 bg-white/30 rounded animate-pulse mt-2" />
                ) : (
                  <div className="text-3xl lg:text-4xl font-bold">
                    {balance || '0'} {user && (user as any).preferredCurrency ? (user as any).preferredCurrency : 'CAD'}
                  </div>
                )}
              </div>

              {/* Deposit Form */}
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
                        {bankAccounts.map((account) =>
                          account ? (
                            <option key={account.id} value={account.id}>
                              {account.bankName} - {account.accountNumber} {account.isPioneerBank && '(Pioneer Bank)'}
                            </option>
                          ) : null
                        )}
                      </select>
                      {bankAccounts.length === 0 && !bankAccountsLoading && (
                        <div className="mt-2">
                          <p className="text-sm text-red-600">
                            No bank accounts connected. Please add a bank account in your profile first.
                          </p>
                          <button
                            type="button"
                            className="mt-2 px-4 py-2 bg-orange-main text-white rounded hover:bg-orange-hover text-sm font-bold"
                            onClick={async () => {
                              setBankAccountsLoading(true);
                              const res = await fetch('/api/user');
                              const data = await res.json();
                              if (data.user) {
                                login(data.user as User);
                              }
                              setBankAccountsLoading(false);
                            }}
                          >
                            Retry
                          </button>
                        </div>
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
                  <p className="text-xs text-gray-500 mt-2">
                    Minimum amount: 0.01 {user && (user as any).preferredCurrency ? (user as any).preferredCurrency : 'CAD'}
                  </p>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || bankAccounts.length === 0 || !form.amount}
                  className="w-full py-3 lg:py-4 px-6 bg-orange-main text-white font-bold rounded-lg hover:bg-orange-hover disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm lg:text-base"
                >
                  Deposit Funds
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

              {/* Success Result */}
              {!isSubmitting && result && (
                <div className="mt-6 p-4 lg:p-6 bg-green-50 border border-green-200 rounded-xl">
                  <h3 className="text-lg lg:text-xl font-bold text-green-800 mb-4">Deposit Successful!</h3>
                  <div className="space-y-3 text-sm lg:text-base text-green-700">
                    <p><strong>Transaction ID:</strong> {result.transactionId}</p>
                    <p><strong>Amount:</strong> {convertedSuccessAmount} {user.preferredCurrency || 'CAD'}</p>
                    <p><strong>Bank Account:</strong> {result.bankAccount.bankName} - {result.bankAccount.accountNumber}</p>
                    <p><strong>Stellar Hash:</strong> <a href={`https://horizon-testnet.stellar.org/transactions/${result.stellarTransactionId}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">{result.stellarTransactionId}</a></p>
                    <p className="mt-4 font-medium">{result.message}</p>
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