'use client';

import { useState, useEffect, Suspense } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import TransactionDetailsModal from '@/components/TransactionDetailsModal';
import { Transaction, TransactionStats } from '@/types/transaction';
import Image from 'next/image';

interface TransactionWithMetadata extends Transaction {
  userId: string;
  userEmail: string;
  fromAccount?: string;
  toAccount?: string;
  stellarTransactionId?: string;
  stellarTransactionHash?: string;
  metadata?: Record<string, any> & {
    relatedTransactions?: TransactionWithMetadata[];
  };
  calculatedBalance?: number;
  balance?: number;
}

// Interface for grouped transactions
interface GroupedTransaction {
  id: string;
  transactions: TransactionWithMetadata[];
  timestamp: string;
  type: string;
  status: string;
  amount: number;
  currency: string;
  description: string;
  stellarTransactionHash?: string;
}

function HistoryPageContent() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const highlightedTxId = searchParams.get('tx');
  const [transactions, setTransactions] = useState<TransactionWithMetadata[]>([]);
  const [groupedTransactions, setGroupedTransactions] = useState<GroupedTransaction[]>([]);
  const [stats, setStats] = useState<TransactionStats | null>(null);
  const [error, setError] = useState('');
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionWithMetadata | null>(null);
  const [selectedGroupedTransaction, setSelectedGroupedTransaction] = useState<GroupedTransaction | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  // Group related transactions (on-ramp, transfer, off-ramp)
  useEffect(() => {
    if (transactions.length === 0) return;

    // Create a map to track transaction groups by their timestamps (within a 5-minute window)
    const transactionGroups: Map<string, TransactionWithMetadata[]> = new Map();
    const processedTransactions: Set<string> = new Set();
    const groupedTransactionsArray: GroupedTransaction[] = [];
    const standaloneTransactions: TransactionWithMetadata[] = [];

    // First, process new-style transactions with transactionSteps in metadata
    const newStyleTransactions = transactions.filter(tx => 
      tx.type === 'transfer' && tx.metadata?.transactionSteps
    );
    
    newStyleTransactions.forEach(tx => {
      processedTransactions.add(tx.id);
      
      // Create a grouped transaction for the new style
      const groupedTransaction: GroupedTransaction = {
        id: tx.id,
        transactions: [tx],
        timestamp: tx.timestamp,
        type: 'transfer',
        status: tx.status,
        amount: tx.amount,
        currency: tx.currency,
        description: tx.description || 'Money Transfer',
        stellarTransactionHash: tx.stellarTransactionHash || tx.stellarTransactionId
      };
      
      groupedTransactionsArray.push(groupedTransaction);
    });

    // Then process old-style transactions (on-ramp, transfer, off-ramp)
    const onRampTransactions = transactions.filter(tx => 
      !processedTransactions.has(tx.id) && tx.type === 'on-ramp'
    );

    // For each on-ramp transaction, try to find matching transfer and off-ramp
    onRampTransactions.forEach(onRampTx => {
      if (processedTransactions.has(onRampTx.id)) return;

      const onRampTime = new Date(onRampTx.timestamp).getTime();
      
      // Find a transfer transaction within 5 minutes of the on-ramp
      const transferTx = transactions.find(tx => 
        !processedTransactions.has(tx.id) && 
        tx.type === 'transfer' && 
        Math.abs(new Date(tx.timestamp).getTime() - onRampTime) < 300000
      );
      
      // If we found a transfer, look for an off-ramp
      if (transferTx) {
        const transferTime = new Date(transferTx.timestamp).getTime();
        
        // Find an off-ramp transaction within 5 minutes of the transfer
        const offRampTx = transactions.find(tx => 
          !processedTransactions.has(tx.id) && 
          tx.type === 'off-ramp' && 
          Math.abs(new Date(tx.timestamp).getTime() - transferTime) < 300000
        );
        
        // If we have all three transaction types, create a group
        if (offRampTx) {
          // Mark all three transactions as processed
          processedTransactions.add(onRampTx.id);
          processedTransactions.add(transferTx.id);
          processedTransactions.add(offRampTx.id);
          
          // Create the combined transaction with all three steps
          const combinedTransactions = [onRampTx, transferTx, offRampTx];
          
          // Sort by timestamp
          combinedTransactions.sort((a, b) => 
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          );
          
          const groupId = `group-${onRampTx.id}`;
          
          // Create the grouped transaction
          const groupedTransaction: GroupedTransaction = {
            id: groupId,
            transactions: combinedTransactions,
            timestamp: onRampTx.timestamp,
            type: 'combined-transfer',
            status: combinedTransactions.every(t => t.status === 'completed') ? 'completed' : 
                   combinedTransactions.some(t => t.status === 'failed') ? 'failed' : 'pending',
            amount: onRampTx.amount,
            currency: onRampTx.currency,
            description: 'Complete Money Transfer',
            stellarTransactionHash: transferTx.stellarTransactionHash || transferTx.stellarTransactionId
          };
          
          groupedTransactionsArray.push(groupedTransaction);
        } else {
          // No matching off-ramp, keep as standalone transactions
          standaloneTransactions.push(onRampTx);
          standaloneTransactions.push(transferTx);
          processedTransactions.add(onRampTx.id);
          processedTransactions.add(transferTx.id);
        }
      } else {
        // No matching transfer, keep as standalone transaction
        standaloneTransactions.push(onRampTx);
        processedTransactions.add(onRampTx.id);
      }
    });

    // Add any remaining transactions that weren't processed
    transactions.forEach(tx => {
      if (!processedTransactions.has(tx.id)) {
        standaloneTransactions.push(tx);
        processedTransactions.add(tx.id);
      }
    });

    // Convert standalone transactions to "grouped" format for consistent handling
    const standaloneGrouped = standaloneTransactions.map(tx => ({
      id: tx.id,
      transactions: [tx],
      timestamp: tx.timestamp,
      type: tx.type,
      status: tx.status,
      amount: tx.amount,
      currency: tx.currency,
      description: tx.description || '',
      stellarTransactionHash: tx.stellarTransactionHash || tx.stellarTransactionId
    }));

    // Combine and sort all transactions by timestamp (newest first)
    const allGroupedTransactions = [...groupedTransactionsArray, ...standaloneGrouped]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    setGroupedTransactions(allGroupedTransactions);

    // Check if there's a highlighted transaction and find its group
    if (highlightedTxId) {
      const highlightedGroup = allGroupedTransactions.find(group => 
        group.transactions.some(tx => tx.id === highlightedTxId)
      );
      
      if (highlightedGroup) {
        setSelectedGroupedTransaction(highlightedGroup);
        setSelectedTransaction(highlightedGroup.transactions.find(tx => tx.id === highlightedTxId) || 
                               highlightedGroup.transactions[0]);
        setIsModalOpen(true);
      }
    }
  }, [transactions, highlightedTxId]);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user) return;
      try {
        setIsLoadingData(true);
        const res = await fetch('/api/transactions');
        if (res.ok) {
          const data = await res.json();
          setTransactions(data.transactions);
          setStats(data.stats);
        } else {
          setError('Failed to fetch transaction history.');
        }
      } catch (err) {
        console.error('Transaction fetch error:', err);
        setError('An error occurred while fetching transactions.');
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchTransactions();
  }, [user, highlightedTxId]);

  const formatCurrency = (amount: number, currency: string) => {
    return `${amount.toFixed(2)} ${currency}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'failed':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return '💰';
      case 'on-ramp':
        return '⬆️';
      case 'transfer':
        return '🔄';
      case 'payment':
        return '💳';
      case 'withdrawal':
        return '🏦';
      case 'off-ramp':
        return '⬇️';
      case 'combined-transfer':
        return '🔄⬆️⬇️';
      default:
        return '📊';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'deposit':
        return 'Deposit';
      case 'on-ramp':
        return 'On-Ramp';
      case 'transfer':
        return 'Transfer';
      case 'payment':
        return 'Payment';
      case 'withdrawal':
        return 'Withdrawal';
      case 'off-ramp':
        return 'Off-Ramp';
      case 'combined-transfer':
        return 'Combined Transfer';
      default:
        return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

  const handleTransactionClick = (groupedTransaction: GroupedTransaction) => {
    setSelectedGroupedTransaction(groupedTransaction);
    setSelectedTransaction(groupedTransaction.transactions[0]);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTransaction(null);
    setSelectedGroupedTransaction(null);
  };

  if (isLoading || !user) {
    return <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">Loading...</div>;
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
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
          <h1 className="text-2xl lg:text-3xl font-bold mb-4 lg:mb-6">Transaction History</h1>

          {/* Transaction Stats */}
          {stats && (
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 lg:gap-4 mb-6 lg:mb-8">
              <div className="bg-white p-3 lg:p-4 rounded-lg shadow-sm">
                <div className="text-xl lg:text-2xl font-bold text-blue-600">{stats.totalTransactions}</div>
                <div className="text-xs lg:text-sm text-gray-600">Total Transactions</div>
              </div>
              <div className="bg-white p-3 lg:p-4 rounded-lg shadow-sm">
                <div className="text-xl lg:text-2xl font-bold text-green-600">{stats.totalDeposits}</div>
                <div className="text-xs lg:text-sm text-gray-600">Deposits</div>
              </div>
              <div className="bg-white p-3 lg:p-4 rounded-lg shadow-sm">
                <div className="text-xl lg:text-2xl font-bold text-purple-600">{stats.totalTransfers}</div>
                <div className="text-xs lg:text-sm text-gray-600">Transfers</div>
              </div>
              <div className="bg-white p-3 lg:p-4 rounded-lg shadow-sm">
                <div className="text-xl lg:text-2xl font-bold text-orange-600">{stats.totalWithdrawals}</div>
                <div className="text-xs lg:text-sm text-gray-600">Withdrawals</div>
              </div>
              <div className="bg-white p-3 lg:p-4 rounded-lg shadow-sm">
                <div className="text-xl lg:text-2xl font-bold text-yellow-600">{stats.totalOnRamps + stats.totalOffRamps}</div>
                <div className="text-xs lg:text-sm text-gray-600">Ramps</div>
              </div>
            </div>
          )}

          {error && <p className="text-red-500 mb-4 text-sm lg:text-base">{error}</p>}
          
          {isLoadingData ? (
            <div className="bg-white rounded-xl shadow-md p-6 lg:p-8 text-center">
              <div className="animate-spin rounded-full h-6 lg:h-8 w-6 lg:w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600 text-sm lg:text-base">Loading transactions...</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-md">
              <div className="overflow-x-auto overflow-y-auto max-h-[500px] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                <table className="min-w-full">
                  <thead className="sticky top-0 bg-white z-10">
                    <tr className="border-b border-gray-200">
                      <th className="p-3 lg:p-4 text-left font-semibold text-xs lg:text-sm">Transaction ID</th>
                      <th className="p-3 lg:p-4 text-left font-semibold text-xs lg:text-sm">Date</th>
                      <th className="p-3 lg:p-4 text-left font-semibold text-xs lg:text-sm">Type</th>
                      <th className="p-3 lg:p-4 text-left font-semibold text-xs lg:text-sm">Description</th>
                      <th className="p-3 lg:p-4 text-left font-semibold text-xs lg:text-sm">Amount</th>
                      <th className="p-3 lg:p-4 text-left font-semibold text-xs lg:text-sm">Status</th>
                      <th className="p-3 lg:p-4 text-left font-semibold text-xs lg:text-sm">Stellar TX</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupedTransactions.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-6 lg:p-8 text-center text-gray-500 text-sm lg:text-base">
                          No transactions found
                        </td>
                      </tr>
                    ) : (
                      groupedTransactions.map((groupedTx) => {
                        // For combined transactions, use the sum of amounts
                        const displayAmount = groupedTx.type === 'combined-transfer' 
                          ? groupedTx.transactions.find(t => t.type === 'on-ramp')?.amount || groupedTx.amount
                          : groupedTx.amount;
                        
                        // For combined transactions, use a special description
                        const displayDescription = groupedTx.type === 'combined-transfer'
                          ? `Complete transfer via ${groupedTx.transactions.length} steps`
                          : groupedTx.description;
                        
                        return (
                          <tr 
                            key={groupedTx.id} 
                            className={`border-b border-gray-200 last:border-b-0 hover:bg-gray-50 ${
                              highlightedTxId && groupedTx.transactions.some(tx => tx.id === highlightedTxId) ? 'bg-yellow-50' : ''
                            }`}
                          >
                            <td className="p-3 lg:p-4">
                              <button
                                onClick={() => handleTransactionClick(groupedTx)}
                                className="font-mono text-xs text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                              >
                                {groupedTx.type === 'combined-transfer' 
                                  ? `${groupedTx.transactions.length} TXs` 
                                  : groupedTx.id}
                              </button>
                            </td>
                            <td className="p-3 lg:p-4 text-xs lg:text-sm">
                              {new Date(groupedTx.timestamp).toLocaleString()}
                            </td>
                            <td className="p-3 lg:p-4">
                              <div className="flex items-center">
                                <span className="mr-1 lg:mr-2 text-sm lg:text-base">{getTypeIcon(groupedTx.type)}</span>
                                <span className="capitalize text-xs lg:text-sm">{getTypeLabel(groupedTx.type)}</span>
                              </div>
                            </td>
                            <td className="p-3 lg:p-4 text-xs lg:text-sm">
                              {displayDescription}
                            </td>
                            <td className="p-3 lg:p-4 font-medium text-xs lg:text-sm">
                              {formatCurrency(displayAmount, groupedTx.currency)}
                            </td>
                            <td className="p-3 lg:p-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(groupedTx.status)}`}>
                                {groupedTx.status}
                              </span>
                            </td>
                            <td className="p-3 lg:p-4">
                              {groupedTx.stellarTransactionHash ? (
                                <a 
                                  href={`https://horizon-testnet.stellar.org/transactions/${groupedTx.stellarTransactionHash}`}
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline text-xs"
                                >
                                  View
                                </a>
                              ) : (
                                <span className="text-gray-400 text-xs">-</span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Transaction Details Modal */}
          <TransactionDetailsModal
            transaction={selectedTransaction ? {
              id: selectedTransaction.id,
              type: selectedTransaction.type,
              status: selectedTransaction.status,
              amount: selectedTransaction.amount,
              currency: selectedTransaction.currency,
              fromUser: selectedTransaction.metadata?.fromUser,
              toUser: selectedTransaction.metadata?.toUser,
              fromBank: selectedTransaction.metadata?.fromBank,
              toBank: selectedTransaction.metadata?.toBank,
              stellarTransactionHash: selectedTransaction.stellarTransactionHash || selectedTransaction.stellarTransactionId,
              timestamp: selectedTransaction.timestamp,
              description: selectedTransaction.description,
              metadata: {
                ...selectedTransaction.metadata,
                relatedTransactions: selectedGroupedTransaction?.type === 'combined-transfer' 
                  ? selectedGroupedTransaction.transactions.filter(t => t.id !== selectedTransaction.id)
                  : undefined
              }
            } : null}
            isOpen={isModalOpen}
            onClose={closeModal}
          />
        </div>
      </main>
    </div>
  );
} 

export default function HistoryPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">Loading...</div>}>
      <HistoryPageContent />
    </Suspense>
  );
}