'use client';

import { useState, useEffect } from 'react';
import { User, UserSearchResponse } from '@/types/user';

interface Recipient {
  id: string;
  name: string;
  publicKey: string;
  bankName?: string;
  accountNumber?: string;
}

interface CombinedRecipientSelectorProps {
  onRecipientSelect: (recipient: { name: string; publicKey: string; bankName?: string; accountNumber?: string; preferredCurrency?: string; }) => void;
  placeholder?: string;
  className?: string;
}

// Helper function to mask account number
const maskAccountNumber = (accountNumber: string): string => {
  if (!accountNumber || accountNumber.length < 4) return accountNumber;
  const last4 = accountNumber.slice(-4);
  const masked = 'X'.repeat(accountNumber.length - 4);
  return `${masked}${last4}`;
};

export default function CombinedRecipientSelector({ 
  onRecipientSelect, 
  placeholder = "Search users or select saved recipient...", 
  className = "" 
}: CombinedRecipientSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showRecipients, setShowRecipients] = useState(false);

  // Fetch saved recipients on mount
  useEffect(() => {
    const fetchRecipients = async () => {
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
  }, []);

  // Search users when query changes
  useEffect(() => {
    const searchUsers = async () => {
      if (searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const response = await fetch(`/api/users/search?q=${encodeURIComponent(searchQuery)}`);
        const data: UserSearchResponse = await response.json();
        setSearchResults(data.users);
      } catch (error) {
        console.error('Failed to search users:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    const timeoutId = setTimeout(searchUsers, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Handle click outside to close results
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.combined-recipient-container')) {
        setShowResults(false);
        setShowRecipients(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleUserSelect = (user: User) => {
    onRecipientSelect({
      name: user.displayName,
      publicKey: user.stellarPublicKey,
      preferredCurrency: user.preferredCurrency
    });
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
  };

  const handleRecipientSelect = (recipient: Recipient) => {
    onRecipientSelect({
      name: recipient.name,
      publicKey: recipient.publicKey,
      bankName: recipient.bankName,
      accountNumber: recipient.accountNumber
    });
    setSearchQuery('');
    setShowRecipients(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setShowResults(true);
    setShowRecipients(false);
  };

  const handleInputFocus = () => {
    if (searchQuery.length >= 2) {
      setShowResults(true);
    } else if (recipients.length > 0) {
      setShowRecipients(true);
    }
  };

  const handleRecipientsButtonClick = () => {
    setShowRecipients(!showRecipients);
    setShowResults(false);
  };

  return (
    <div className={`combined-recipient-container relative ${className}`}>
      <div className="relative">
        <input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          className="w-full p-3 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-20"
        />
        
        {/* Saved Recipients Button */}
        {recipients.length > 0 && (
          <button
            type="button"
            onClick={handleRecipientsButtonClick}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-1 text-xs bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200 transition-colors"
          >
            Saved ({recipients.length})
          </button>
        )}
        
        {isSearching && (
          <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          </div>
        )}
      </div>

      {/* Search Results */}
      {showResults && (searchQuery.length >= 2 || searchResults.length > 0) && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {isSearching ? (
            <div className="p-3 text-gray-500 text-center">Searching...</div>
          ) : searchResults.length > 0 ? (
            <>
              <div className="p-2 bg-gray-50 text-xs font-medium text-gray-600 border-b">
                Kavodax Users
              </div>
              {searchResults.map((user) => (
                <button
                  key={user.email}
                  type="button"
                  onClick={() => handleUserSelect(user)}
                  className="w-full text-left p-3 hover:bg-gray-100 border-b border-gray-100 last:border-b-0 flex items-center space-x-3"
                >
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-medium text-sm">
                      {user.displayName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{user.displayName}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                  <div className="text-xs text-gray-400">
                    <div>Stellar</div>
                    <div className="font-mono">{user.stellarPublicKey.slice(0, 8)}...</div>
                  </div>
                </button>
              ))}
            </>
          ) : searchQuery.length >= 2 ? (
            <div className="p-3 text-gray-500 text-center">No users found</div>
          ) : null}
        </div>
      )}

      {/* Saved Recipients Dropdown */}
      {showRecipients && recipients.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          <div className="p-2 bg-gray-50 text-xs font-medium text-gray-600 border-b">
            Saved Recipients
          </div>
          {recipients.map((recipient) => (
            <button
              key={recipient.id}
              type="button"
              onClick={() => handleRecipientSelect(recipient)}
              className="w-full text-left p-3 hover:bg-gray-100 border-b border-gray-100 last:border-b-0 flex items-center space-x-3"
            >
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-medium text-sm">
                  {recipient.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900">{recipient.name}</div>
                {recipient.bankName && (
                  <div className="mt-1">
                    <div className="text-xs text-gray-700 font-medium">{recipient.bankName}</div>
                    {recipient.accountNumber && (
                      <div className="text-xs text-gray-600 font-mono">
                        {maskAccountNumber(recipient.accountNumber)}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="text-xs text-gray-400">
                <div>Saved</div>
                <div className="font-mono">{recipient.publicKey.slice(0, 8)}...</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
} 