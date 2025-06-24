import { NextResponse } from 'next/server';

export const dynamic = "force-static";
export const revalidate = false;
import { getIronSession, IronSession, IronSessionData } from 'iron-session';
import { sessionOptions } from '@/lib/session';
import { cookies } from 'next/headers';
import { Horizon } from 'stellar-sdk';
import { createTransaction, updateTransactionStatus, getUserTransactions, Transaction } from '@/lib/transaction-tracker';
import fs from 'fs/promises';
import path from 'path';

const usersFilePath = path.join(process.cwd(), 'users.json');

// This function is not used in this route, but we'll keep it for now.
async function readUsers() {
  try {
    const data = await fs.readFile(usersFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return {};
    }
    throw error;
  }
}

// Function to get XLM to CAD exchange rate
async function getXLMToCADRate(): Promise<number> {
  try {
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=stellar&vs_currencies=usd');
    const data = await response.json();
    const xlmUsdPrice = data.stellar.usd;
    const usdToCadRate = 1.35;
    return xlmUsdPrice * usdToCadRate;
  } catch (error: any) {
    console.error('Failed to fetch exchange rate:', error);
    return 0.5;
  }
}

export async function POST(request: Request) {
    const session: IronSession<IronSessionData> = await getIronSession(
        await cookies(),
        sessionOptions
    );

    if (!session.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { amount: cadAmount } = await request.json();

    if (!cadAmount || cadAmount <= 0) {
        return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    // Check if user has Pioneer Bank account
    if (!session.user.pioneerBankPublicKey) {
        return NextResponse.json({ error: 'Pioneer Bank account not configured' }, { status: 400 });
    }

    // Create transaction record
    let transaction;
    try {
        transaction = await createTransaction({
            userId: session.user.email,
            userEmail: session.user.email,
            type: 'on-ramp',
            amount: cadAmount,
            currency: session.user.preferredCurrency || 'CAD',
            fromAccount: 'Central Bank',
            toAccount: 'Pioneer Bank',
            status: 'pending',
            description: `Deposit to Pioneer Bank account`,
            metadata: {
                userPublicKey: session.user.stellarPublicKey,
                pioneerBankPublicKey: session.user.pioneerBankPublicKey,
                originalAmount: cadAmount
            }
        });
    } catch (error) {
        console.error('Failed to create transaction record:', error);
        return NextResponse.json({ error: 'Failed to create transaction record' }, { status: 500 });
    }

    try {
        // Get current exchange rate and calculate XLM amount
        const xlmToCadRate = await getXLMToCADRate();
        const xlmAmount = (cadAmount / xlmToCadRate).toFixed(7);
        
        // For now, we'll simulate the deposit by directly funding the Pioneer Bank account
        // In a real system, this would come from a central bank or external source
        const horizon = new Horizon.Server('https://horizon-testnet.stellar.org');
        
        // Check current Pioneer Bank balance
        const pioneerAccount = await horizon.loadAccount(session.user.pioneerBankPublicKey);
        const currentBalance = pioneerAccount.balances.find((balance: any) => balance.asset_type === 'native');
        const currentXlm = currentBalance ? parseFloat(currentBalance.balance) : 0;
        
        // For display purposes, we want to show the CAD balance, not the XLM balance
        // Calculate the CAD balance by adding the deposit amount to the previous CAD balance
        // Get the user's previous transactions to find the last CAD balance
        const userTransactions = await getUserTransactions(session.user.email);
        let previousCadBalance = 0;
        
        // Find the most recent transaction with a CAD balance
        const lastTransaction = userTransactions
          .filter((tx: Transaction) => tx.currency === (session.user?.preferredCurrency || 'CAD') && tx.balance !== undefined)
          .sort((a: Transaction, b: Transaction) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
        
        if (lastTransaction && lastTransaction.balance !== undefined) {
          previousCadBalance = lastTransaction.balance;
        }
        
        // Calculate the new CAD balance by adding the deposit amount
        const currentCadBalance = previousCadBalance + cadAmount;
        console.log('Previous CAD balance:', previousCadBalance);
        console.log('Deposit amount:', cadAmount);
        console.log('New CAD balance:', currentCadBalance);
        
        // Generate a mock Stellar transaction hash for simulation purposes
        const mockStellarHash = `mock-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 15)}`;
        
        // Simulate deposit by updating the transaction status
        // In a real system, this would involve actual XLM transfer from a central bank
        if (transaction) {
          await updateTransactionStatus(transaction.id, 'completed', mockStellarHash, currentCadBalance);
        }
        
        return NextResponse.json({ 
            success: true, 
            depositedXlm: xlmAmount,
            depositedCad: cadAmount,
            currentBalance: currentCadBalance,
            transactionId: transaction?.id,
            stellarTransactionHash: mockStellarHash,
            balance: currentCadBalance,
            message: 'Deposit simulated successfully (Pioneer Bank account funded)'
        });

    } catch (error: any) {
        console.error('Pioneer Bank Deposit Error:', error);
        
        // Update transaction status to failed
        if (transaction) {
            await updateTransactionStatus(transaction.id, 'failed');
        }
        
        let details = error.message;
        let extras = error?.response?.data?.extras;
        let result_codes = extras?.result_codes;
        let result_xdr = extras?.result_xdr;
        let type = error?.response?.data?.type;
        let title = error?.response?.data?.title;
        let status = error?.response?.status;
        return NextResponse.json({ 
            error: 'Failed to process deposit', 
            details, 
            type, 
            title, 
            status, 
            result_codes, 
            result_xdr, 
            extras,
            transactionId: transaction?.id
        }, { status: 500 });
    }
} 