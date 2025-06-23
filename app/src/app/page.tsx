'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import RecentTransactionsWidget from '@/components/RecentTransactionsWidget';
import { User } from '@/types/user';
import { convertXLMToCurrency, getExchangeRates } from '@/lib/currency-converter';
import Image from 'next/image';
import Link from 'next/link';
import { FaCrown, FaPaperPlane, FaWallet } from 'react-icons/fa';

export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [balance, setBalance] = useState('');
  const [balanceLoading, setBalanceLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    const fetchBalance = async () => {
      setBalanceLoading(true);
      if (user && user.stellarPublicKey) {
        const res = await fetch(`/api/account/balance?publicKey=${user.stellarPublicKey}`);
        const data = await res.json();
        const xlmObj = data.balances?.find((b: any) => b.asset_type === 'native');
        if (xlmObj) {
          const xlm = parseFloat(xlmObj.balance);
          const preferredCurrency = (user as any).preferredCurrency || 'CAD';
          try {
            await getExchangeRates();
            const convertedValue = convertXLMToCurrency(xlm, preferredCurrency);
            setBalance(convertedValue);
          } catch (err) {
            setBalance('N/A');
          }
        } else {
          setBalance('N/A');
        }
      }
      setBalanceLoading(false);
    };
    fetchBalance();
  }, [user]);

  if (isLoading || !user) {
    return <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">Loading...</div>;
  }

  const [integerPart, decimalPart] = balance.replace(/[^0-9.,]/g, '').split(/[.,]/);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      <main className="flex-grow lg:ml-0 transition-all duration-300">
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
          <div className="w-10"></div>
        </div>

        <div className="p-6 lg:p-10 bg-navy text-white">
          <h1 className="text-2xl lg:text-3xl font-bold">Welcome back, {user.firstName} {user.lastName}</h1>
          <p className="text-sm lg:text-base text-gray-300 mt-1">Let's take a detailed look at your financial situation today</p>
        </div>

        <div className="p-6 lg:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-8">
              <div className="bg-white p-6 rounded-2xl shadow-md text-gray-800">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-bold text-navy">My Account & Balance</h2>
                  <button className="text-gray-400">•••</button>
                </div>
                <div className="bg-navy text-white p-6 rounded-xl mb-6">
                  <p className="text-sm text-gray-300">Total Balance</p>
                  {balanceLoading ? (
                    <div className="h-10 w-48 bg-white/30 rounded animate-pulse mt-2" />
                  ) : (
                    <div className="text-4xl font-bold">
                      $ {integerPart}
                      <span className="text-2xl">,{decimalPart || '00'} CAD</span>
                    </div>
                  )}
                </div>
                
                <div className="space-y-4 mb-6 p-6 border border-gray-200 rounded-xl shadow-md">
                    <h3 className="text-lg font-semibold text-navy">Account Info</h3>
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="font-bold text-navy">{user.firstName} {user.lastName}</p>
                            <p className="text-sm text-grey">{user.bankAccounts?.[0].accountNumber}</p>
                        </div>
                        <div className="bg-orange-main text-white px-3 py-1 text-xs font-bold rounded-full flex items-center">
                            <FaCrown className="mr-1" />
                            Priority Customer
                        </div>
                    </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4">
                  <Link href="/send-money" className="bg-orange-main text-white text-center font-bold py-3 rounded-lg hover:bg-orange-hover flex items-center justify-center">
                    <FaPaperPlane className="mr-2" />
                    Send Money
                  </Link>
                  <Link href="/deposit" className="bg-orange-main text-white text-center font-bold py-3 rounded-lg hover:bg-orange-hover flex items-center justify-center">
                    <FaWallet className="mr-2" />
                    Load Money
                  </Link>
                </div>
              </div>
            </div>
            <div className="lg:col-span-2">
              <RecentTransactionsWidget />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
