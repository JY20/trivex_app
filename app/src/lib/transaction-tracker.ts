import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export interface Transaction {
  id: string;
  userId: string;
  userEmail: string;
  type: 'deposit' | 'transfer' | 'payment' | 'withdrawal' | 'on-ramp' | 'off-ramp';
  amount: number;
  currency: string;
  fromAccount?: string;
  toAccount?: string;
  status: 'pending' | 'completed' | 'failed';
  stellarTransactionHash?: string;
  timestamp: string;
  description: string;
  balance?: number;
  metadata?: {
    bankAccountId?: string;
    bankAccountDetails?: any;
    userPublicKey?: string;
    originalAmount?: number;
    [key: string]: any;
  };
}

const transactionsFilePath = path.join(process.cwd(), 'transactions.json');

async function readTransactions() {
  try {
    const data = await fs.readFile(transactionsFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return { transactions: {} };
  }
}

async function writeTransactions(data: any) {
  await fs.writeFile(transactionsFilePath, JSON.stringify(data, null, 2));
}

export function generateTransactionId(): string {
  // Generate a unique transaction ID with timestamp prefix
  const timestamp = Date.now().toString(36);
  const uuid = uuidv4().replace(/-/g, '').substring(0, 8);
  return `TXN-${timestamp}-${uuid}`.toUpperCase();
}

export async function createTransaction(transactionData: Omit<Transaction, 'id' | 'timestamp'>): Promise<Transaction> {
  const transactions = await readTransactions();
  
  // Create the transaction without calculating the balance
  // The balance should be provided by the caller based on the actual Stellar wallet balance
  const transaction: Transaction = {
    ...transactionData,
    id: generateTransactionId(),
    timestamp: new Date().toISOString()
  };
  
  // Ensure metadata exists
  if (!transaction.metadata) {
    transaction.metadata = {};
  }
  
  // Store the original amount in metadata if not already set
  if (transaction.metadata.originalAmount === undefined) {
    transaction.metadata.originalAmount = transaction.amount;
  }
  
  transactions.transactions[transaction.id] = transaction;
  await writeTransactions(transactions);
  
  return transaction;
}

export async function getTransaction(transactionId: string): Promise<Transaction | null> {
  const transactions = await readTransactions();
  return transactions.transactions[transactionId] || null;
}

export async function getUserTransactions(userEmail: string): Promise<Transaction[]> {
  const transactions = await readTransactions();
  const userTransactions = Object.values(transactions.transactions)
    .filter((txn: any) => txn.userEmail === userEmail)
    .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  
  return userTransactions as Transaction[];
}

export async function updateTransactionStatus(
  transactionId: string, 
  status: Transaction['status'], 
  stellarTransactionHash?: string,
  balance?: number
): Promise<void> {
  const transactions = await readTransactions();
  
  if (transactions.transactions[transactionId]) {
    transactions.transactions[transactionId].status = status;
    if (stellarTransactionHash) {
      transactions.transactions[transactionId].stellarTransactionHash = stellarTransactionHash;
    }
    if (balance !== undefined) {
      transactions.transactions[transactionId].balance = balance;
    }
    await writeTransactions(transactions);
  }
}

export async function getTransactionStats(userEmail: string): Promise<{
  totalTransactions: number;
  totalDeposits: number;
  totalTransfers: number;
  totalPayments: number;
  totalWithdrawals: number;
  totalOnRamps: number;
  totalOffRamps: number;
  totalAmount: number;
}> {
  const userTransactions = await getUserTransactions(userEmail);
  
  const stats = {
    totalTransactions: userTransactions.length,
    totalDeposits: userTransactions.filter(t => t.type === 'deposit').length,
    totalTransfers: userTransactions.filter(t => t.type === 'transfer').length,
    totalPayments: userTransactions.filter(t => t.type === 'payment').length,
    totalWithdrawals: userTransactions.filter(t => t.type === 'withdrawal').length,
    totalOnRamps: userTransactions.filter(t => t.type === 'on-ramp').length,
    totalOffRamps: userTransactions.filter(t => t.type === 'off-ramp').length,
    totalAmount: userTransactions
      .filter(t => t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0)
  };
  
  return stats;
} 