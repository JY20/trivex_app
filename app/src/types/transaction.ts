export interface Transaction {
  id: string;
  type: 'transfer' | 'deposit' | 'payment' | 'withdrawal' | 'on-ramp' | 'off-ramp';
  status: 'pending' | 'completed' | 'failed';
  amount: number;
  currency: string;
  fromUser?: string;
  toUser?: string;
  fromBank?: string;
  toBank?: string;
  fromAccount?: string;
  toAccount?: string;
  stellarTransactionHash?: string;
  timestamp: string;
  description?: string;
  balance?: number;
  metadata?: {
    bankAccountId?: string;
    bankAccountDetails?: any;
    userPublicKey?: string;
    originalAmount?: number;
    [key: string]: any;
  };
}

export interface TransactionStats {
  totalTransactions: number;
  totalDeposits: number;
  totalTransfers: number;
  totalPayments: number;
  totalWithdrawals: number;
  totalOnRamps: number;
  totalOffRamps: number;
  totalAmount: number;
} 