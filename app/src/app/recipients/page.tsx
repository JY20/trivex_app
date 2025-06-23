'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import UserSearchWidget from '@/components/UserSearchWidget';
import { User } from '@/types/user';
import Image from 'next/image';

interface Recipient {
  id: string;
  name: string;
  publicKey: string;
  bankName?: string;
  accountNumber?: string;
}

// Helper function to mask account number
const maskAccountNumber = (accountNumber: string): string => {
  if (!accountNumber || accountNumber.length < 4) return accountNumber;
  const last4 = accountNumber.slice(-4);
  const masked = 'X'.repeat(accountNumber.length - 4);
  return `${masked}${last4}`;
};

export default function RecipientsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [name, setName] = useState('');
  const [publicKey, setPublicKey] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    const fetchRecipients = async () => {
      if (!user) return;
      try {
        const res = await fetch('/api/recipients');
        if (res.ok) {
          const data = await res.json();
          setRecipients(data);
        }
      } catch (err) {
        console.error('Failed to fetch recipients:', err);
      }
    };

    fetchRecipients();
  }, [user]);
  
  const handleAddRecipient = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/recipients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, publicKey }),
      });

      if (res.ok) {
        const newRecipient = await res.json();
        setRecipients([...recipients, newRecipient]);
        setName('');
        setPublicKey('');
        setSuccess('Recipient added successfully!');
      } else {
        const { error } = await res.json();
        setError(error);
      }
    } catch (error) {
      setError('Failed to add recipient. Please try again.');
    }
  };

  const handleUserSelect = async (selectedUser: User) => {
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/recipients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: selectedUser.displayName, 
          publicKey: selectedUser.stellarPublicKey 
        }),
      });

      if (res.ok) {
        const newRecipient = await res.json();
        setRecipients([...recipients, newRecipient]);
        setSuccess(`${selectedUser.displayName} added as recipient successfully!`);
      } else {
        const { error } = await res.json();
        setError(error);
      }
    } catch (error) {
      setError('Failed to add user as recipient. Please try again.');
    }
  };
  
  const handleDeleteRecipient = async (id: string) => {
      try {
          const res = await fetch('/api/recipients', {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id }),
          });
          
          if (res.ok) {
              setRecipients(recipients.filter(r => r.id !== id));
              setSuccess('Recipient deleted successfully!');
          } else {
              const { error } = await res.json();
              setError(`Failed to delete recipient: ${error}`);
          }
      } catch (err) {
          setError('An error occurred while deleting the recipient.');
      }
  }

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
          <h1 className="text-2xl lg:text-3xl font-bold">Manage Recipients</h1>
          <p className="text-sm lg:text-base text-gray-300 mt-1">Add, view, and manage your payment recipients</p>
        </div>

        <div className="p-6 lg:p-10">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              {/* Add Kavodax User */}
              <div className="bg-white rounded-2xl shadow-md p-6 lg:p-8">
                <h2 className="text-xl lg:text-2xl font-bold text-navy mb-4">Add Kavodax User</h2>
                <p className="text-gray-600 mb-4 text-sm lg:text-base">Search for other Kavodax users to add them as recipients.</p>
                <UserSearchWidget 
                  onUserSelect={handleUserSelect}
                  placeholder="Search by name or email..."
                  className="mb-4"
                />
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                {success && <p className="text-green-500 text-sm mt-2">{success}</p>}
              </div>

              {/* Add Manual Recipient */}
              <div className="bg-white rounded-2xl shadow-md p-6 lg:p-8">
                <h2 className="text-xl lg:text-2xl font-bold text-navy mb-4">Add Manual Recipient</h2>
                <p className="text-gray-600 mb-4 text-sm lg:text-base">Add a recipient by entering their details manually.</p>
                <form onSubmit={handleAddRecipient} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="text-sm font-medium text-gray-600">Recipient's Name</label>
                    <input 
                      id="name" 
                      type="text" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)} 
                      required 
                      className="w-full p-3 lg:p-4 mt-1 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-main focus:border-orange-main text-sm lg:text-base"
                    />
                  </div>
                  <div>
                    <label htmlFor="publicKey" className="text-sm font-medium text-gray-600">Stellar Public Key</label>
                    <input 
                      id="publicKey" 
                      type="text" 
                      value={publicKey} 
                      onChange={(e) => setPublicKey(e.target.value)} 
                      required 
                      className="w-full p-3 lg:p-4 mt-1 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-main focus:border-orange-main text-sm lg:text-base"
                      placeholder="G..."
                    />
                  </div>
                  <button type="submit" className="w-full font-bold text-white bg-orange-main rounded-lg hover:bg-orange-hover transition-colors duration-300 py-3 lg:py-4 text-sm lg:text-base">
                    Add Recipient
                  </button>
                </form>
              </div>
            </div>

            {/* Recipients List */}
            <div className="mt-8 p-6 lg:p-8 rounded-2xl shadow-md bg-white">
              <h2 className="text-xl lg:text-2xl font-bold text-navy mb-4">Your Recipients</h2>
              {recipients.length === 0 ? (
                <p className="text-gray-500 text-center py-6 lg:py-8 text-sm lg:text-base">No recipients added yet. Add some recipients to get started!</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
                  {recipients.map(r => (
                    <div key={r.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 text-sm lg:text-base">{r.name}</p>
                        {r.bankName && (
                          <div className="mt-2">
                            <p className="text-xs lg:text-sm text-gray-700 font-medium">{r.bankName}</p>
                            {r.accountNumber && (
                              <p className="text-xs text-gray-600 font-mono">
                                Account: {maskAccountNumber(r.accountNumber)}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                      <button 
                        onClick={() => handleDeleteRecipient(r.id)} 
                        className="ml-3 text-red-500 hover:text-red-700 text-xs lg:text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 