import { NextResponse } from 'next/server';
import { getIronSession, IronSession, IronSessionData } from 'iron-session';
import { sessionOptions } from '@/lib/session';
import { cookies } from 'next/headers';
import { Horizon, TransactionBuilder, Asset, Operation, Keypair } from 'stellar-sdk';
import { createTransaction, updateTransactionStatus, getUserTransactions, Transaction } from '@/lib/transaction-tracker';
import fs from 'fs/promises';
import path from 'path';
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
  console.log('=== LOAD MONEY API CALLED ===');
  
  const session: IronSession<IronSessionData> = await getIronSession(
    await cookies(),
    sessionOptions
  );
  console.log('Session user:', session.user?.email);

  if (!session.user) {
    console.log('No user in session');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const {bankAccountId, amount,  amountInFiat, prevBalance } = await request.json();
  console.log('Request data:', { amount, bankAccountId });
  console.log('Amount type:', typeof amount);
  console.log('Amount value:', amount);

  if (!amount) {
    console.log('No amount provided');
    return NextResponse.json({ error: 'Amount is required' }, { status: 400 });
  }

  // Validate amount format for Stellar
  const amountNum = parseFloat(amount);
  if (isNaN(amountNum) || amountNum <= 0) {
    console.log('Invalid amount provided');
    return NextResponse.json({ error: 'Amount must be a positive number' }, { status: 400 });
  }

  // Format amount to have at most 7 decimal places for Stellar
  // Remove trailing zeros and ensure proper decimal format
  const formattedAmount = amountNum.toFixed(7).replace(/\.?0+$/, '');
  console.log('Formatted amount for Stellar:', formattedAmount);

  // Additional validation for Stellar requirements
  if (formattedAmount.includes('.') && formattedAmount.split('.')[1].length > 7) {
    console.log('Amount has too many decimal places');
    return NextResponse.json({ error: 'Amount cannot have more than 7 decimal places' }, { status: 400 });
  }

  if (!bankAccountId) {
    console.log('No bank account ID provided');
    return NextResponse.json({ error: 'Bank account selection is required' }, { status: 400 });
  }

  // Get bank account details
  const users = await readUsers();
  const user = users[session.user.email];
  console.log('User data loaded:', !!user, 'Bank accounts:', user?.bankAccounts?.length);
  
  if (!user || !user.bankAccounts) {
    console.log('No bank accounts found for user');
    return NextResponse.json({ error: 'No bank accounts found' }, { status: 400 });
  }

  const bankAccountDetails = user.bankAccounts.find((acc: BankAccount) => acc.id === bankAccountId);
  console.log('Bank account details:', bankAccountDetails);
  
  if (!bankAccountDetails) {
    console.log('Bank account not found');
    return NextResponse.json({ error: 'Bank account not found' }, { status: 400 });
  }

  // Get the Stellar account for the selected bank
  let sourceStellarAccount;
  if (bankAccountDetails.isPioneerBank) {
    console.log('Processing Pioneer Bank transfer');
    // Use Pioneer Bank's Stellar account
    if (!user.pioneerBankPublicKey || !user.pioneerBankSecretKey) {
      console.log('Pioneer Bank account not properly configured');
      return NextResponse.json({ error: 'Pioneer Bank account not properly configured' }, { status: 400 });
    }
    sourceStellarAccount = {
      publicKey: user.pioneerBankPublicKey,
      secretKey: user.pioneerBankSecretKey
    };
    console.log('Pioneer Bank Stellar account:', sourceStellarAccount.publicKey);
  } else {
    console.log('Non-Pioneer Bank not supported');
    // For other banks, we would need their Stellar accounts
    // For now, return an error for non-Pioneer Bank accounts
    return NextResponse.json({ error: 'Only Pioneer Bank transfers are currently supported' }, { status: 400 });
  }

  // Create transaction record
  let transaction;
  try {
    console.log('Creating transaction record...');
    // Store the original user input amount from the form
    const depositAmount = parseFloat(amountInFiat);
    transaction = await createTransaction({
      userId: session.user.email,
      userEmail: session.user.email,
      type: 'deposit',
      amount: depositAmount,
      currency: session.user.preferredCurrency || 'CAD',
      fromAccount: `${bankAccountDetails.bankName} - ${bankAccountDetails.accountNumber}`,
      toAccount: 'Kavodax Wallet',
      status: 'pending',
      description: `Load money from ${bankAccountDetails.bankName}`,
      metadata: {
        bankAccountId: bankAccountId,
        bankAccountDetails: bankAccountDetails,
        userPublicKey: session.user.stellarPublicKey,
        sourceStellarAccount: sourceStellarAccount.publicKey,
        originalAmount: depositAmount
      }
    });
    console.log('Transaction record created:', transaction.id);
  } catch (error) {
    console.error('Failed to create transaction record:', error);
    return NextResponse.json({ error: 'Failed to create transaction record' }, { status: 500 });
  }

  try {
    console.log('Starting Stellar transaction...');
    // Create keypair from the source bank's secret key
    const sourceKeypair = Keypair.fromSecret(sourceStellarAccount.secretKey);
    const destinationPublicKey = session.user.stellarPublicKey;
    console.log('Destination public key:', destinationPublicKey);

    const horizon = new Horizon.Server('https://horizon-testnet.stellar.org');
    const sourceAccount = await horizon.loadAccount(sourceStellarAccount.publicKey);
    console.log('Source account loaded, sequence:', sourceAccount.sequenceNumber());

    const stellarTransaction = new TransactionBuilder(sourceAccount, {
      fee: '100',
      networkPassphrase: 'Test SDF Network ; September 2015',
    })
      .addOperation(
        Operation.payment({
          destination: destinationPublicKey,
          asset: Asset.native(),
          amount: formattedAmount,
        })
      )
      .setTimeout(30)
      .build();

    console.log('Transaction built, signing...');
    stellarTransaction.sign(sourceKeypair);

    console.log('Submitting transaction to Stellar network...');
    const response = await horizon.submitTransaction(stellarTransaction);
    console.log('Transaction submitted successfully:', response.hash);
    
    // For display purposes, we want to show the CAD balance, not the XLM balance
    // Calculate the CAD balance by adding the deposit amount to the previous CAD balance
    // Get the user's previous transactions to find the last CAD balance
    const userTransactions = await getUserTransactions(session.user.email);
    let previousCadBalance = parseFloat(prevBalance) || 0;
  
    
    // Calculate the new CAD balance by adding the deposit amount (user input amount)
    const userInputAmount = parseFloat(amountInFiat);
    const currentCadBalance = previousCadBalance + userInputAmount;
    console.log('Previous CAD balance:', previousCadBalance);
    console.log('Deposit amount:', userInputAmount);
    console.log('New CAD balance:', currentCadBalance);
    
    // Update transaction status to completed and store the new balance in CAD
    await updateTransactionStatus(transaction.id, 'completed', response.hash, currentCadBalance);
    console.log('Transaction status updated to completed');
    
    return NextResponse.json({
      success: true,
      message: 'Deposit processed successfully.',
      amount: userInputAmount,
      currency: session.user.preferredCurrency || 'CAD',
      transactionId: transaction.id,
      stellarTransactionHash: response.hash,
      balance: currentCadBalance,
      bankAccount: {
        bankName: bankAccountDetails.bankName,
        accountNumber: bankAccountDetails.accountNumber,
        isPioneerBank: bankAccountDetails.isPioneerBank
      }
    });
  } catch (error: any) {
    console.error('=== STELLAR TRANSACTION FAILED ===');
    console.error('Error:', error.message);
    console.error('Stellar Error Details:', error?.response?.data?.extras);
    
    // Update transaction status to failed
    if (transaction) {
      await updateTransactionStatus(transaction.id, 'failed');
    }
    
    return NextResponse.json({ 
      error: 'Failed to load money', 
      details: error.message,
      transactionId: transaction?.id
    }, { status: 500 });
  }
} 