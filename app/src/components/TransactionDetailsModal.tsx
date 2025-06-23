'use client';

import { useState, useEffect, useRef } from 'react';
import { Transaction } from '@/types/transaction';

// Extend the Transaction interface to include metadata.originalAmount
interface TransactionWithMetadata extends Transaction {
  metadata?: {
    bankAccountId?: string;
    bankAccountDetails?: any;
    userPublicKey?: string;
    originalAmount?: number;
    fee?: number;
    recipientAmount?: number;
    relatedTransactions?: TransactionWithMetadata[];
    transactionSteps?: {
      step: string;
      description: string;
      fromAccount?: string;
      toAccount?: string;
    }[];
    [key: string]: any;
  };
  balance?: number;
}

interface TransactionDetailsModalProps {
  transaction: TransactionWithMetadata | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function TransactionDetailsModal({ transaction, isOpen, onClose }: TransactionDetailsModalProps) {
  const [stellarDetails, setStellarDetails] = useState<any>(null);
  const [isLoadingStellar, setIsLoadingStellar] = useState(false);
  const [selectedSubTransaction, setSelectedSubTransaction] = useState<TransactionWithMetadata | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);

  // Initialize with the main transaction
  useEffect(() => {
    if (transaction) {
      setSelectedSubTransaction(null);
    }
  }, [transaction]);

  useEffect(() => {
    if (isOpen && transaction?.stellarTransactionHash) {
      fetchStellarDetails();
    }
  }, [isOpen, transaction]);

  useEffect(() => {
    if (isOpen) {
      previouslyFocusedElement.current = document.activeElement as HTMLElement;
      setTimeout(() => {
        modalRef.current?.focus();
      }, 0);
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          onClose();
        }
        if (e.key === 'Tab' && modalRef.current) {
          const focusableEls = modalRef.current.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
          );
          const focusable = Array.from(focusableEls).filter(el => el.offsetParent !== null);
          if (focusable.length === 0) return;
          const first = focusable[0];
          const last = focusable[focusable.length - 1];
          if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
          } else if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        }
      };
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    } else if (previouslyFocusedElement.current) {
      previouslyFocusedElement.current.focus();
    }
  }, [isOpen, onClose]);

  const fetchStellarDetails = async () => {
    if (!transaction?.stellarTransactionHash) return;
    
    setIsLoadingStellar(true);
    try {
      const response = await fetch(`https://horizon-testnet.stellar.org/transactions/${transaction.stellarTransactionHash}`);
      if (response.ok) {
        const data = await response.json();
        setStellarDetails(data);
      }
    } catch (error) {
      console.error('Failed to fetch Stellar transaction details:', error);
    } finally {
      setIsLoadingStellar(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'failed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return '✅';
      case 'pending': return '⏳';
      case 'failed': return '❌';
      default: return '❓';
    }
  };

  const getTransactionTypeIcon = (type: string) => {
    switch (type) {
      case 'transfer': return '🔄';
      case 'deposit': return '💰';
      case 'on-ramp': return '⬆️';
      case 'payment': return '💳';
      case 'withdrawal': return '🏦';
      case 'off-ramp': return '⬇️';
      default: return '📊';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getTransactionFlow = () => {
    if (!transaction) return [];

    // If we're showing a sub-transaction, use that instead
    const txToShow = selectedSubTransaction || transaction;
    
    const flow = [];
    const originalAmount = txToShow.metadata?.originalAmount !== undefined ? txToShow.metadata.originalAmount : txToShow.amount;
    const fee = txToShow.metadata?.fee;
    const recipientAmount = txToShow.metadata?.recipientAmount;
    
    // Check if we have transaction steps in metadata (new format)
    if (txToShow.type === 'transfer' && txToShow.metadata?.transactionSteps) {
      // This is a transfer with the new format that includes on-ramp and off-ramp details
      const steps = txToShow.metadata.transactionSteps;
      
      // On-ramp step
      const onRampStep = steps.find(s => s.step === 'on-ramp');
      if (onRampStep) {
        flow.push({
          step: 1,
          title: 'On-Ramp',
          description: onRampStep.description || `Convert ${txToShow.currency} to XLM for payment`,
          status: txToShow.status === 'completed' ? 'completed' : 
                 txToShow.status === 'failed' ? 'failed' : 'pending'
        });
      }
      
      // Transfer step
      const transferStep = steps.find(s => s.step === 'transfer');
      if (transferStep) {
        flow.push({
          step: 2,
          title: 'Transfer',
          description: transferStep.description || `Transfer XLM via Stellar Network`,
          status: txToShow.status === 'completed' ? 'completed' : 
                 txToShow.status === 'failed' ? 'failed' : 'pending'
        });
      }
      
      // Off-ramp step
      const offRampStep = steps.find(s => s.step === 'off-ramp');
      if (offRampStep) {
        flow.push({
          step: 3,
          title: 'Off-Ramp',
          description: offRampStep.description || `Convert XLM to recipient's currency`,
          status: txToShow.status === 'completed' ? 'completed' : 
                 txToShow.status === 'failed' ? 'failed' : 'pending'
        });
      }
      
      return flow;
    }
    
    // Fall back to the original logic for older transactions
    switch (txToShow.type) {
      case 'deposit':
        const bankName = txToShow.fromBank || txToShow.fromAccount || 'Bank Account';
        flow.push(
          { step: 1, title: 'Funds Received', description: `${originalAmount.toFixed(2)} ${txToShow.currency} from ${bankName}`, status: 'completed' },
          { step: 2, title: 'Deposit Processing', description: `Processing deposit to your Kavodax wallet`, status: txToShow.status },
          { step: 3, title: 'Funds Available', description: `Deposit completed to your Kavodax wallet`, status: txToShow.status === 'completed' ? 'completed' : 'pending' }
        );
        break;
      
      case 'on-ramp':
        flow.push(
          { step: 1, title: 'On-Ramp Initiated', description: `${originalAmount.toFixed(2)} ${txToShow.currency} prepared for on-ramp`, status: 'completed' },
          { step: 2, title: 'On-Ramp Processing', description: `Converting to digital currency`, status: txToShow.status },
          { step: 3, title: 'On-Ramp Complete', description: `Funds available in digital wallet`, status: txToShow.status === 'completed' ? 'completed' : 'pending' }
        );
        break;
      
      case 'transfer':
        flow.push(
          { step: 1, title: 'Transfer Initiated', description: `${originalAmount.toFixed(2)} ${txToShow.currency} prepared for transfer`, status: 'completed' },
          { step: 2, title: 'Transfer Processing', description: `Transferring funds via Stellar Network`, status: txToShow.status },
          { step: 3, title: 'Transfer Complete', description: `Funds transferred to recipient wallet`, status: txToShow.status === 'completed' ? 'completed' : 'pending' }
        );
        break;
      
      case 'payment':
        flow.push(
          { step: 1, title: 'Payment Initiated', description: `${originalAmount.toFixed(2)} ${txToShow.currency} payment initiated`, status: 'completed' },
          { step: 2, title: 'Payment Processing', description: `Processing payment to recipient`, status: txToShow.status },
          { step: 3, title: 'Payment Complete', description: `Payment delivered to recipient`, status: txToShow.status === 'completed' ? 'completed' : 'pending' }
        );
        break;
        
      case 'withdrawal':
        flow.push(
          { step: 1, title: 'Withdrawal Initiated', description: `Withdrawal request of ${originalAmount.toFixed(2)} ${txToShow.currency}`, status: 'completed' },
          { step: 2, title: 'Withdrawal Processing', description: `Processing withdrawal from your Kavodax wallet`, status: txToShow.status },
          { step: 3, title: 'Withdrawal Complete', description: `${originalAmount.toFixed(2)} ${txToShow.currency} withdrawn to your bank account`, status: txToShow.status === 'completed' ? 'completed' : 'pending' }
        );
        break;
        
      case 'off-ramp':
        flow.push(
          { step: 1, title: 'Off-Ramp Initiated', description: `${originalAmount.toFixed(2)} ${txToShow.currency} prepared for off-ramp`, status: 'completed' },
          { step: 2, title: 'Off-Ramp Processing', description: `Converting from digital currency`, status: txToShow.status },
          { step: 3, title: 'Off-Ramp Complete', description: fee !== undefined && recipientAmount !== undefined ? 
            `${recipientAmount.toFixed(2)} ${txToShow.currency} delivered to recipient (after ${fee.toFixed(2)} ${txToShow.currency} fee)` : 
            `Funds delivered to recipient`, status: txToShow.status === 'completed' ? 'completed' : 'pending' }
        );
        break;
    }
    
    return flow;
  };

  // Function to handle clicking on a related transaction
  const handleSubTransactionClick = (tx: TransactionWithMetadata) => {
    setSelectedSubTransaction(tx);
  };

  // Check if we have related transactions
  const hasRelatedTransactions = transaction?.metadata?.relatedTransactions && 
                               transaction.metadata.relatedTransactions.length > 0 &&
                               !transaction?.metadata?.transactionSteps;

  if (!isOpen || !transaction) return null;

  // Get the transaction to display (either the selected sub-transaction or the main one)
  const displayTransaction = selectedSubTransaction || transaction;
  const flow = getTransactionFlow();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-black/30"
      role="dialog"
      aria-modal="true"
      aria-labelledby="transaction-modal-title"
      aria-describedby="transaction-modal-desc"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto outline-none shadow-xl transform transition-all"
        tabIndex={-1}
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{getTransactionTypeIcon(displayTransaction.type)}</span>
            <div>
              <h2 id="transaction-modal-title" className="text-xl font-bold text-gray-900">Transaction Details</h2>
              <p className="text-sm text-gray-500">ID: {displayTransaction.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            aria-label="Close modal"
            type="button"
          >
            ×
          </button>
        </div>

        {/* Related Transactions Selector (if applicable) */}
        {hasRelatedTransactions && (
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Transaction Steps</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedSubTransaction(null)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  !selectedSubTransaction ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span>{getTransactionTypeIcon('on-ramp')}</span>
                <span>On-Ramp</span>
              </button>
              {transaction.metadata?.relatedTransactions?.map((tx, index) => (
                <button
                  key={tx.id}
                  onClick={() => handleSubTransactionClick(tx)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${
                    selectedSubTransaction?.id === tx.id ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span>{getTransactionTypeIcon(tx.type)}</span>
                  <span>{tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Transaction Summary */}
        <div id="transaction-modal-desc" className="p-6 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {displayTransaction.currency} {(displayTransaction.metadata?.originalAmount !== undefined ? displayTransaction.metadata.originalAmount : displayTransaction.amount).toFixed(2)}
              </div>
              <div className="text-sm text-gray-500">Amount</div>
            </div>
            <div className="text-center">
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(displayTransaction.status)}`}>
                <span className="mr-1">{getStatusIcon(displayTransaction.status)}</span>
                {displayTransaction.status.charAt(0).toUpperCase() + displayTransaction.status.slice(1)}
              </div>
              <div className="text-sm text-gray-500 mt-1">Status</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-medium text-gray-900">
                {formatTimestamp(displayTransaction.timestamp)}
              </div>
              <div className="text-sm text-gray-500">Timestamp</div>
            </div>
          </div>

          {/* Fee Information - Display when available */}
          {displayTransaction.metadata?.fee !== undefined && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="text-sm font-medium text-gray-600">Original Amount</div>
                  <div className="text-base font-bold text-gray-900">
                    {displayTransaction.currency} {displayTransaction.metadata.originalAmount?.toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-600">Fee (1%)</div>
                  <div className="text-base font-bold text-gray-900">
                    {displayTransaction.currency} {displayTransaction.metadata.fee.toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-600">Recipient Receives</div>
                  <div className="text-base font-bold text-gray-900">
                    {displayTransaction.currency} {displayTransaction.metadata.recipientAmount?.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Balance Information */}
        {displayTransaction.balance !== undefined && displayTransaction.type !== 'off-ramp' && (
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Balance Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600">Balance After Transaction</label>
                <p className="text-lg font-bold text-gray-900">{displayTransaction.currency} {displayTransaction.balance.toFixed(2)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Transaction Flow */}
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Transaction Flow</h3>
          <div className="space-y-4">
            {flow.map((step, index) => (
              <div key={step.step} className="flex items-start space-x-4">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  step.status === 'completed' ? 'bg-green-100 text-green-600' :
                  step.status === 'pending' ? 'bg-yellow-100 text-yellow-600' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {step.step}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium text-gray-900">{step.title}</h4>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(step.status)}`}>
                      {getStatusIcon(step.status)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Transaction Details */}
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Transaction Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600">Type</label>
              <p className="text-sm text-gray-900 capitalize">
                {displayTransaction.type === 'on-ramp' ? 'deposit' : 
                 displayTransaction.type === 'off-ramp' ? 'withdrawal' : 
                 displayTransaction.type}
              </p>
            </div>
            {displayTransaction.fromUser && (
              <div>
                <label className="block text-sm font-medium text-gray-600">From</label>
                <p className="text-sm text-gray-900">{displayTransaction.fromUser}</p>
              </div>
            )}
            {displayTransaction.toUser && (
              <div>
                <label className="block text-sm font-medium text-gray-600">To</label>
                <p className="text-sm text-gray-900">{displayTransaction.toUser}</p>
              </div>
            )}
            {displayTransaction.fromBank && (
              <div>
                <label className="block text-sm font-medium text-gray-600">From Bank</label>
                <p className="text-sm text-gray-900">{displayTransaction.fromBank}</p>
              </div>
            )}
            {displayTransaction.toBank && (
              <div>
                <label className="block text-sm font-medium text-gray-600">To Bank</label>
                <p className="text-sm text-gray-900">{displayTransaction.toBank}</p>
              </div>
            )}
            {displayTransaction.fromAccount && (
              <div>
                <label className="block text-sm font-medium text-gray-600">Source Account</label>
                <p className="text-sm text-gray-900">{displayTransaction.fromAccount}</p>
              </div>
            )}
            {displayTransaction.toAccount && (
              <div>
                <label className="block text-sm font-medium text-gray-600">Destination Account</label>
                <p className="text-sm text-gray-900">{displayTransaction.toAccount}</p>
              </div>
            )}
            {displayTransaction.description && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-600">Description</label>
                <p className="text-sm text-gray-900">{displayTransaction.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Bank Account Details for Deposits */}
        {displayTransaction.type === 'deposit' && displayTransaction.fromAccount && (
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Bank Account Details</h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-3">
                <span className="text-2xl">🏦</span>
                <div>
                  <h4 className="font-medium text-blue-900">Source Bank Account</h4>
                  <p className="text-sm text-blue-700">{displayTransaction.fromAccount}</p>
                </div>
              </div>
              {displayTransaction.fromBank && (
                <div className="text-sm text-blue-700">
                  <strong>Bank:</strong> {displayTransaction.fromBank}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Stellar Transaction Details */}
        {(displayTransaction.type === 'transfer' || displayTransaction.type === 'on-ramp' || displayTransaction.type === 'off-ramp') && displayTransaction.stellarTransactionHash && (
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Stellar Transaction</h3>
            <div className="space-y-2">
              <div>
                <label className="block text-sm font-medium text-gray-600">Transaction Hash</label>
                <div className="flex items-center mt-1">
                  <p className="text-xs font-mono bg-gray-50 p-2 rounded overflow-x-auto flex-1">
                    {displayTransaction.stellarTransactionHash}
                  </p>
                  <a 
                    href={`https://horizon-testnet.stellar.org/transactions/${displayTransaction.stellarTransactionHash}`}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="ml-2 text-blue-600 hover:text-blue-800"
                    title="View on Stellar Explorer"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>
              {isLoadingStellar ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-500">Loading Stellar transaction details...</p>
                </div>
              ) : stellarDetails ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Created At</label>
                    <p className="text-sm">{new Date(stellarDetails.created_at).toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Fee</label>
                    <p className="text-sm">{stellarDetails.fee_charged} XLM</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Ledger</label>
                    <p className="text-sm">{stellarDetails.ledger}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Operation Count</label>
                    <p className="text-sm">{stellarDetails.operation_count}</p>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
} 