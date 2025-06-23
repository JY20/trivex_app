import { NextResponse } from 'next/server';
import { getIronSession, IronSession, IronSessionData } from 'iron-session';
import { sessionOptions } from '@/lib/session';
import { cookies } from 'next/headers';
import { Horizon, TransactionBuilder, Asset, Operation, Keypair } from 'stellar-sdk';
import fs from 'fs/promises';
import path from 'path';
import { createTransaction, updateTransactionStatus, getUserTransactions, Transaction } from '@/lib/transaction-tracker';
import { BankAccount } from '@/types/bank';

const usersFilePath = path.join(process.cwd(), 'users.json');

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

export async function POST(request: Request) {
  console.log('=== WITHDRAW API CALLED ===');
  
  const session: IronSession<IronSessionData> = await getIronSession(
    await cookies(),
    sessionOptions
  );
  console.log('Session user:', session.user?.email);

  if (!session.user) {
    console.log('No user in session');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { bankAccountId, amount, description, amountInFiat} = await request.json();
  console.log('Request data:', { bankAccountId, amount, description, amountInFiat });

  if (!bankAccountId || !amount) {
    console.log('Missing required fields');
    return NextResponse.json(
      { error: 'bankAccountId and amount are required' },
      { status: 400 }
    );
  }

  const amountNum = parseFloat(amount);
  if (isNaN(amountNum) || amountNum <= 0) {
    console.log('Invalid amount');
    return NextResponse.json(
      { error: 'Amount must be a positive number' },
      { status: 400 }
    );
  }

  // Read user data to get bank accounts
  const users = await readUsers();
  const user = users[session.user.email];
  console.log('User data loaded:', !!user, 'Bank accounts:', user?.bankAccounts?.length);

  if (!user) {
    console.log('User not found');
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // Find the selected bank account
  const bankAccount = user.bankAccounts?.find((acc: BankAccount) => acc.id === bankAccountId);
  console.log('Bank account found:', bankAccount);
  
  if (!bankAccount) {
    console.log('Bank account not found');
    return NextResponse.json({ error: 'Bank account not found' }, { status: 404 });
  }

  // Get the destination Stellar account for the selected bank
  let destinationStellarAccount;
  if (bankAccount.isPioneerBank) {
    console.log('Processing Pioneer Bank withdrawal');
    if (!user.pioneerBankPublicKey) {
      console.log('Pioneer Bank account not properly configured');
      return NextResponse.json({ error: 'Pioneer Bank account not properly configured' }, { status: 400 });
    }
    destinationStellarAccount = user.pioneerBankPublicKey;
  } else {
    console.log('Non-Pioneer Bank not supported for withdrawals');
    return NextResponse.json({ error: 'Only Pioneer Bank withdrawals are currently supported' }, { status: 400 });
  }

  // Create transaction record
  const userInputAmount = parseFloat(amountInFiat);
  let transaction;
  try {
    console.log('Creating transaction record...');
    transaction = await createTransaction({
      userId: session.user.email,
      userEmail: session.user.email,
      type: 'withdrawal',
      amount: userInputAmount,
      currency: session.user.preferredCurrency || 'CAD',
      fromAccount: 'Kavodax Wallet',
      toAccount: `${bankAccount.bankName} - ${bankAccount.accountNumber}`,
      status: 'pending',
      description: description || `Withdrawal to ${bankAccount.bankName}`,
      metadata: {
        bankAccountId: bankAccountId,
        bankAccountDetails: bankAccount,
        userPublicKey: session.user.stellarPublicKey,
        destinationStellarAccount: destinationStellarAccount,
        originalAmount: userInputAmount
      }
    });
    console.log('Transaction record created:', transaction.id);
  } catch (error) {
    console.error('Failed to create transaction record:', error);
    return NextResponse.json({ error: 'Failed to create transaction record' }, { status: 500 });
  }

  try {
    console.log('Starting Stellar withdrawal transaction...');
    
    // Get current XLM balance
    const horizon = new Horizon.Server('https://horizon-testnet.stellar.org');
    const sourceAccount = await horizon.loadAccount(session.user.stellarPublicKey);
    const xlmBalance = sourceAccount.balances.find((b: any) => b.asset_type === 'native');
    
    console.log('Source account balance:', xlmBalance?.balance || '0');
    
    if (!xlmBalance || parseFloat(xlmBalance.balance) < 1) {
      console.log('Insufficient balance');
      await updateTransactionStatus(transaction.id, 'failed');
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
    }

    // Check if user has enough XLM for the withdrawal
    if (parseFloat(xlmBalance.balance) < amountNum) {
      console.log('Insufficient XLM balance for withdrawal');
      await updateTransactionStatus(transaction.id, 'failed');
      return NextResponse.json({ error: 'Insufficient XLM balance for this withdrawal amount' }, { status: 400 });
    }

    // Create keypair from user's secret key
    const userKeypair = Keypair.fromSecret(user.stellarSecretKey);
    console.log('User keypair created, destination:', destinationStellarAccount);

    // Perform the Stellar transaction
    const stellarTransaction = new TransactionBuilder(sourceAccount, {
      fee: '100',
      networkPassphrase: 'Test SDF Network ; September 2015',
    })
      .addOperation(
        Operation.payment({
          destination: destinationStellarAccount,
          asset: Asset.native(),
          amount: amountNum.toString(),
        })
      )
      .setTimeout(30)
      .build();

    console.log('Transaction built, signing...');
    stellarTransaction.sign(userKeypair);

    console.log('Submitting transaction to Stellar network...');
    const response = await horizon.submitTransaction(stellarTransaction);
    console.log('Withdrawal transaction submitted successfully:', response.hash);

    // Fetch the updated account balance after the transaction
    const updatedAccount = await horizon.loadAccount(session.user.stellarPublicKey);
    const xlmBalanceUpdated = updatedAccount.balances.find((b: any) => b.asset_type === 'native');
    const currentXlmBalance = xlmBalanceUpdated ? parseFloat(xlmBalanceUpdated.balance) : 0;
    
    // For display purposes, we want to show the CAD balance, not the XLM balance
    // Calculate the CAD balance by subtracting the withdrawal amount from the previous CAD balance
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
    
    // Calculate the new CAD balance by subtracting the withdrawal amount
    const currentCadBalance = previousCadBalance - amountNum;
    console.log('Previous CAD balance:', previousCadBalance);
    console.log('Withdrawal amount:', amountNum);
    console.log('New CAD balance:', currentCadBalance);

    // Update transaction with success and store the new CAD balance
    await updateTransactionStatus(
      transaction.id, 
      'completed',
      response.hash,
      currentCadBalance
    );
    console.log('Transaction status updated to completed');

    return NextResponse.json({
      success: true,
      transactionId: transaction.id,
      stellarTransactionHash: response.hash,
      amount: amountNum,
      currency: session.user.preferredCurrency || 'CAD',
      balance: currentCadBalance,
      bankAccount: {
        bankName: bankAccount.bankName,
        accountNumber: bankAccount.accountNumber,
        isPioneerBank: bankAccount.isPioneerBank
      },
      message: 'Withdrawal completed successfully. XLM transferred to your bank account.'
    });

  } catch (error: any) {
    console.error('=== WITHDRAWAL TRANSACTION FAILED ===');
    console.error('Error:', error.message);
    console.error('Stellar Error Details:', error?.response?.data?.extras);
    
    if (transaction) {
      await updateTransactionStatus(transaction.id, 'failed');
    }
    return NextResponse.json({ 
      error: 'Failed to process withdrawal', 
      details: error.message,
      transactionId: transaction?.id
    }, { status: 500 });
  }
} 