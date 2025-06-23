'use client';

import { useState, useEffect } from 'react';
import { validateBankAccount, formatAccountNumber, getSampleTransitNumber, type BankValidationResult } from '@/lib/bank-validation';
import { Bank, BankAccount, BankSearchResponse } from '@/types/bank';
import { isPioneerBankAccount, PIONEER_BANK_INFO } from '@/lib/pioneer-bank';

interface CanadianBankWidgetProps {
  userBanks: BankAccount[];
  onBanksUpdate: (banks: BankAccount[]) => void;
}

export default function CanadianBankWidget({ userBanks, onBanksUpdate }: CanadianBankWidgetProps) {
  const [bankSearchQuery, setBankSearchQuery] = useState('');
  const [bankSearchResults, setBankSearchResults] = useState<Bank[]>([]);
  const [isSearchingBanks, setIsSearchingBanks] = useState(false);
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  const [accountNumber, setAccountNumber] = useState('');
  const [transitNumber, setTransitNumber] = useState('');
  const [showBankSearch, setShowBankSearch] = useState(false);
  const [bankValidation, setBankValidation] = useState<BankValidationResult | null>(null);
  const [isAddingBank, setIsAddingBank] = useState(false);
  const [editingBankId, setEditingBankId] = useState<string | null>(null);

  // Search banks when query changes
  useEffect(() => {
    const searchBanks = async () => {
      if (bankSearchQuery.length < 2) {
        setBankSearchResults([]);
        return;
      }

      setIsSearchingBanks(true);
      try {
        const response = await fetch(`/api/banks?q=${encodeURIComponent(bankSearchQuery)}`);
        const data: BankSearchResponse = await response.json();
        setBankSearchResults(data.banks);
      } catch (error) {
        console.error('Failed to search banks:', error);
      } finally {
        setIsSearchingBanks(false);
      }
    };

    const timeoutId = setTimeout(searchBanks, 300);
    return () => clearTimeout(timeoutId);
  }, [bankSearchQuery]);

  // Handle click outside to close bank search
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.bank-search-container')) {
        setShowBankSearch(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleBankSelect = (bank: Bank) => {
    setSelectedBank(bank);
    setBankSearchQuery(bank.name);
    setShowBankSearch(false);
    
    // Suggest a sample transit number for the selected bank
    const sampleTransit = getSampleTransitNumber(bank.code);
    if (sampleTransit) {
      setTransitNumber(sampleTransit);
    }
  };

  // Validate bank details when they change
  useEffect(() => {
    if (selectedBank && (accountNumber || transitNumber)) {
      const validation = validateBankAccount({
        bankCode: selectedBank.code,
        accountNumber: accountNumber,
        transitNumber: transitNumber
      });
      setBankValidation(validation);
    } else {
      setBankValidation(null);
    }
  }, [selectedBank, accountNumber, transitNumber]);

  const handleAddBank = () => {
    if (!selectedBank || !accountNumber || !transitNumber) {
      return;
    }

    if (bankValidation && !bankValidation.isValid) {
      return;
    }

    const newBank: BankAccount = {
      id: Date.now().toString(),
      bankId: selectedBank.id,
      bankName: selectedBank.name,
      bankCode: selectedBank.code,
      accountNumber: accountNumber,
      transitNumber: transitNumber,
      isPrimary: userBanks.length === 0 // First bank becomes primary
    };

    const updatedBanks = [...userBanks, newBank];
    onBanksUpdate(updatedBanks);

    // Reset form
    setSelectedBank(null);
    setAccountNumber('');
    setTransitNumber('');
    setBankSearchQuery('');
    setBankValidation(null);
    setIsAddingBank(false);
  };

  const handleEditBank = (bank: BankAccount) => {
    // Don't allow editing Pioneer Bank accounts
    if (isPioneerBankAccount(bank)) {
      return;
    }

    setEditingBankId(bank.id);
    setSelectedBank({ id: bank.bankId, name: bank.bankName, code: bank.bankCode, logo: '🏦' });
    setAccountNumber(bank.accountNumber);
    setTransitNumber(bank.transitNumber);
    setBankSearchQuery(bank.bankName);
    setIsAddingBank(true);
  };

  const handleUpdateBank = () => {
    if (!editingBankId || !selectedBank || !accountNumber || !transitNumber) {
      return;
    }

    if (bankValidation && !bankValidation.isValid) {
      return;
    }

    const updatedBanks = userBanks.map(bank => 
      bank.id === editingBankId 
        ? {
            ...bank,
            bankId: selectedBank.id,
            bankName: selectedBank.name,
            bankCode: selectedBank.code,
            accountNumber: accountNumber,
            transitNumber: transitNumber
          }
        : bank
    );

    onBanksUpdate(updatedBanks);

    // Reset form
    setEditingBankId(null);
    setSelectedBank(null);
    setAccountNumber('');
    setTransitNumber('');
    setBankSearchQuery('');
    setBankValidation(null);
    setIsAddingBank(false);
  };

  const handleDeleteBank = (bankId: string) => {
    const bankToDelete = userBanks.find(bank => bank.id === bankId);
    
    // Don't allow deletion of Pioneer Bank accounts
    if (bankToDelete && isPioneerBankAccount(bankToDelete)) {
      return;
    }

    const updatedBanks = userBanks.filter(bank => bank.id !== bankId);
    
    // If we deleted the primary bank and there are other banks, make the first one primary
    if (updatedBanks.length > 0 && bankToDelete?.isPrimary) {
      updatedBanks[0].isPrimary = true;
    }
    
    onBanksUpdate(updatedBanks);
  };

  const handleSetPrimaryBank = (bankId: string) => {
    const updatedBanks = userBanks.map(bank => ({
      ...bank,
      isPrimary: bank.id === bankId
    }));
    onBanksUpdate(updatedBanks);
  };

  const cancelEdit = () => {
    setEditingBankId(null);
    setSelectedBank(null);
    setAccountNumber('');
    setTransitNumber('');
    setBankSearchQuery('');
    setBankValidation(null);
    setIsAddingBank(false);
  };

  return (
    <div className="space-y-6">
      {/* Existing Banks */}
      {userBanks.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Your Bank Accounts</h3>
          <div className="space-y-3">
            {userBanks.map((bank) => {
              const isPioneer = isPioneerBankAccount(bank);
              return (
                <div 
                  key={bank.id} 
                  className={`p-4 rounded-lg border ${
                    isPioneer 
                      ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200' 
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">
                        {isPioneer ? '🏦' : '🏦'}
                      </span>
                      <div>
                        <div className="font-medium flex items-center space-x-2">
                          <span>{bank.bankName}</span>
                          {isPioneer && (
                            <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                              Pioneer Bank
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600">
                          Account: {formatAccountNumber(bank.accountNumber)} | 
                          Transit: {bank.transitNumber}
                        </div>
                        {bank.isPrimary && (
                          <span className="inline-block mt-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            Primary
                          </span>
                        )}
                        {isPioneer && (
                          <div className="text-xs text-blue-600 mt-1">
                            Connected to your Pioneer Bank Stellar account
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {!bank.isPrimary && (
                        <button
                          onClick={() => handleSetPrimaryBank(bank.id)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Set Primary
                        </button>
                      )}
                      {!isPioneer && (
                        <>
                          <button
                            onClick={() => handleEditBank(bank)}
                            className="text-gray-600 hover:text-gray-800 text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteBank(bank.id)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Delete
                          </button>
                        </>
                      )}
                      {isPioneer && (
                        <span className="text-xs text-gray-500 italic">
                          System Account
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add/Edit Bank Form */}
      {isAddingBank && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">
            {editingBankId ? 'Edit Bank Account' : 'Add New Bank Account'}
          </h3>
          
          <div className="space-y-4">
            {/* Bank Selection */}
            <div className="bank-search-container">
              <label className="block text-sm font-medium text-gray-600">Canadian Bank</label>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Search for your bank..."
                  value={bankSearchQuery}
                  onChange={(e) => {
                    setBankSearchQuery(e.target.value);
                    setShowBankSearch(true);
                  }}
                  onFocus={() => setShowBankSearch(true)}
                  className="w-full p-3 mt-1 bg-gray-100 border border-gray-200 rounded-lg"
                />
                
                {showBankSearch && (bankSearchQuery.length >= 2 || bankSearchResults.length > 0) && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {isSearchingBanks ? (
                      <div className="p-3 text-gray-500">Searching...</div>
                    ) : bankSearchResults.length > 0 ? (
                      bankSearchResults.map((bank) => (
                        <button
                          key={bank.id}
                          type="button"
                          onClick={() => handleBankSelect(bank)}
                          className="w-full text-left p-3 hover:bg-gray-100 border-b border-gray-100 last:border-b-0 flex items-center"
                        >
                          <span className="mr-3">{bank.logo}</span>
                          <div>
                            <div className="font-medium">{bank.name}</div>
                            <div className="text-sm text-gray-500">{bank.code}</div>
                          </div>
                        </button>
                      ))
                    ) : bankSearchQuery.length >= 2 ? (
                      <div className="p-3 text-gray-500">No banks found</div>
                    ) : null}
                  </div>
                )}
              </div>
            </div>
            
            {selectedBank && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center">
                  <span className="mr-2">{selectedBank.logo}</span>
                  <div>
                    <div className="font-medium text-blue-900">{selectedBank.name}</div>
                    <div className="text-sm text-blue-700">Code: {selectedBank.code}</div>
                  </div>
                </div>
              </div>
            )}
            
            {selectedBank && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-600">
                    Transit Number (5 digits)
                  </label>
                  <input 
                    type="text" 
                    value={transitNumber} 
                    onChange={(e) => setTransitNumber(e.target.value.replace(/\D/g, '').slice(0, 5))} 
                    placeholder="e.g., 12345"
                    className="w-full p-3 mt-1 bg-gray-100 border border-gray-200 rounded-lg"
                    maxLength={5}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600">
                    Account Number (7-12 digits)
                  </label>
                  <input 
                    type="text" 
                    value={accountNumber} 
                    onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, '').slice(0, 12))} 
                    placeholder="Enter your account number"
                    className="w-full p-3 mt-1 bg-gray-100 border border-gray-200 rounded-lg"
                    maxLength={12}
                  />
                </div>
                
                {/* Validation Results */}
                {bankValidation && (
                  <div className={`p-3 rounded-lg border ${
                    bankValidation.isValid 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-red-50 border-red-200'
                  }`}>
                    {bankValidation.errors.length > 0 && (
                      <div className="mb-2">
                        <h4 className="font-medium text-red-800 mb-1">Errors:</h4>
                        <ul className="text-sm text-red-700 space-y-1">
                          {bankValidation.errors.map((error, index) => (
                            <li key={index}>• {error}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {bankValidation.warnings.length > 0 && (
                      <div>
                        <h4 className="font-medium text-yellow-800 mb-1">Warnings:</h4>
                        <ul className="text-sm text-yellow-700 space-y-1">
                          {bankValidation.warnings.map((warning, index) => (
                            <li key={index}>• {warning}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {bankValidation.isValid && bankValidation.errors.length === 0 && (
                      <div className="text-green-700 text-sm">
                        ✓ Bank account details appear valid
                      </div>
                    )}
                  </div>
                )}
                
                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <button
                    onClick={editingBankId ? handleUpdateBank : handleAddBank}
                    disabled={!bankValidation?.isValid}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {editingBankId ? 'Update Bank' : 'Add Bank'}
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Add Bank Button */}
      {!isAddingBank && (
        <button
          onClick={() => setIsAddingBank(true)}
          className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-800 transition-colors"
        >
          <div className="flex items-center justify-center space-x-2">
            <span className="text-xl">+</span>
            <span>Add Bank Account</span>
          </div>
        </button>
      )}
    </div>
  );
} 