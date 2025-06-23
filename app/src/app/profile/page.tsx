'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import CanadianBankWidget from '@/components/CanadianBankWidget';
import { BankAccount } from '@/types/bank';
import Image from 'next/image';
import { popularCurrencies } from '@/lib/currencies';
import { User } from '@/types/user';

export default function ProfilePage() {
  const { user, isLoading, login } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [preferredCurrency, setPreferredCurrency] = useState('CAD');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [userBanks, setUserBanks] = useState<BankAccount[]>([]);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
    if (user) {
        const typedUser = user as User;
        setFirstName(typedUser.firstName || '');
        setLastName(typedUser.lastName || '');
        setPreferredCurrency(typedUser.preferredCurrency || 'CAD');
        // Load user banks from session or initialize empty array
        if (typedUser.bankAccounts) {
          setUserBanks(typedUser.bankAccounts);
        }
    }
  }, [user, isLoading, router]);

  const handleBanksUpdate = (banks: BankAccount[]) => {
    setUserBanks(banks);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/user/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          firstName, 
          lastName,
          bankAccounts: userBanks,
          preferredCurrency
        }),
      });

      if (res.ok) {
        const { user: updatedUser } = await res.json();
        login(updatedUser); // Update the auth context with the new user data
        setSuccess('Profile updated successfully!');
      } else {
        const { error } = await res.json();
        setError(error);
      }
    } catch (error) {
      setError('Failed to update profile. Please try again.');
    }
  };

  if (isLoading || !user) {
    return <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">Loading...</div>;
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
          <h1 className="text-2xl lg:text-3xl font-bold">Your Profile</h1>
          <p className="text-sm lg:text-base text-gray-300 mt-1">Manage your personal information and bank accounts</p>
        </div>

        <div className="p-6 lg:p-10">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              {/* Personal Information */}
              <div className="bg-white rounded-2xl shadow-md p-6 lg:p-8">
                <h2 className="text-lg lg:text-xl font-bold text-navy mb-4">Personal Information</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="firstName" className="text-sm font-medium text-gray-600">First Name</label>
                    <input id="firstName" type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required className="w-full p-3 lg:p-4 mt-1 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-main focus:border-orange-main text-sm lg:text-base"/>
                  </div>
                  <div>
                    <label htmlFor="lastName" className="text-sm font-medium text-gray-600">Last Name</label>
                    <input id="lastName" type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required className="w-full p-3 lg:p-4 mt-1 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-main focus:border-orange-main text-sm lg:text-base"/>
                  </div>
                  <div>
                    <label htmlFor="preferredCurrency" className="text-sm font-medium text-gray-600">Preferred Currency</label>
                    <select 
                      id="preferredCurrency" 
                      value={preferredCurrency} 
                      onChange={(e) => setPreferredCurrency(e.target.value)} 
                      className="w-full p-3 lg:p-4 mt-1 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-main focus:border-orange-main text-sm lg:text-base"
                    >
                      {popularCurrencies.map((currency) => (
                        <option key={currency.code} value={currency.code}>
                          {currency.name} ({currency.code})
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">This currency will be used to display amounts throughout the application</p>
                  </div>
                  {error && <p className="text-red-500 text-sm">{error}</p>}
                  {success && <p className="text-green-500 text-sm">{success}</p>}
                  <button type="submit" className="w-full font-bold text-white bg-orange-main rounded-lg hover:bg-orange-hover transition-colors duration-300 py-3 lg:py-4 text-sm lg:text-base">
                    Update Profile
                  </button>
                </form>
              </div>

              {/* Canadian Banks */}
              <div className="bg-white rounded-2xl shadow-md p-6 lg:p-8">
                <h2 className="text-lg lg:text-xl font-bold text-navy mb-4">Canadian Bank Accounts</h2>
                <CanadianBankWidget 
                  userBanks={userBanks}
                  onBanksUpdate={handleBanksUpdate}
                />
              </div>
            </div>

            {/* Pioneer Bank Access */}
            <div className="mt-8 p-6 lg:p-8 rounded-2xl shadow-md bg-white">
              <h2 className="text-lg lg:text-xl font-bold text-navy mb-4">Banking</h2>
              <p className="text-gray-600 mb-4 text-sm lg:text-base">Access your Pioneer Bank account to manage your CAD balance and transfers.</p>
              <button 
                onClick={() => router.push('/pioneer-bank')}
                className="w-full font-bold text-white bg-orange-main rounded-lg hover:bg-orange-hover transition-colors duration-300 py-3 lg:py-4 text-sm lg:text-base"
              >
                Open Pioneer Bank
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 