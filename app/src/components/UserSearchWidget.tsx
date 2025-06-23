'use client';

import { useState, useEffect } from 'react';
import { User, UserSearchResponse } from '@/types/user';

interface UserSearchWidgetProps {
  onUserSelect: (user: User) => void;
  placeholder?: string;
  className?: string;
}

export default function UserSearchWidget({ onUserSelect, placeholder = "Search for users...", className = "" }: UserSearchWidgetProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

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

  // Handle click outside to close search results
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.user-search-container')) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleUserSelect = (user: User) => {
    onUserSelect(user);
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setShowResults(true);
  };

  const handleInputFocus = () => {
    if (searchQuery.length >= 2) {
      setShowResults(true);
    }
  };

  return (
    <div className={`user-search-container relative ${className}`}>
      <div className="relative">
        <input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          className="w-full p-3 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        
        {isSearching && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          </div>
        )}
      </div>

      {showResults && (searchQuery.length >= 2 || searchResults.length > 0) && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {isSearching ? (
            <div className="p-3 text-gray-500 text-center">Searching...</div>
          ) : searchResults.length > 0 ? (
            searchResults.map((user) => (
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
              </button>
            ))
          ) : searchQuery.length >= 2 ? (
            <div className="p-3 text-gray-500 text-center">No users found</div>
          ) : null}
        </div>
      )}
    </div>
  );
} 