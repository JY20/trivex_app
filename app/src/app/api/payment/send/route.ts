import { NextResponse } from 'next/server';

export const dynamic = "force-static";
export const revalidate = false;
import { Horizon, Keypair, TransactionBuilder, Asset, Operation } from 'stellar-sdk';
import { getIronSession, IronSession, IronSessionData } from 'iron-session';
import { sessionOptions } from '@/lib/session';
import { cookies } from 'next/headers';
import fs from 'fs/promises';
import path from 'path';
import { createTransaction, updateTransactionStatus, getUserTransactions, Transaction } from '@/lib/transaction-tracker';

const usersFilePath = path.join(process.cwd(), 'users.json');
const FEE_PERCENTAGE = 1; // 1% fee

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
  const session: IronSession<IronSessionData> = await getIronSession(
    await cookies(),
    sessionOptions
  );

  if (!session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { destinationPublicKey, amount, amountInFiat} = await request.json();

  if (!destinationPublicKey || !amount) {
    return NextResponse.json(
      { error: 'destinationPublicKey and amount are required' },
      { status: 400 }
    );
  }
  
  // Store the original user input amount directly at the top level scope
  const userInputAmount = parseFloat(amountInFiat);
  
  // Calculate the fee and recipient amount
  const feeAmount = userInputAmount * (FEE_PERCENTAGE / 100);
  const recipientAmount = userInputAmount - feeAmount;
  
  // Use the original XLM amount for the Stellar transaction
  const amountNum = parseFloat(amount);

  // Create a single transfer transaction record with on-ramp and off-ramp details in metadata
  let transferTransaction;
  try {
    transferTransaction = await createTransaction({
      userId: session.user.email,
      userEmail: session.user.email,
      type: 'transfer',
      amount: userInputAmount,
      currency: session.user.preferredCurrency || 'CAD',
      fromAccount: 'Kavodax Wallet',
      toAccount: destinationPublicKey,
      status: 'pending',
      description: `Transfer to ${destinationPublicKey.substring(0, 8)}...`,
      metadata: {
        userPublicKey: session.user.stellarPublicKey,
        destinationPublicKey: destinationPublicKey,
        originalAmount: userInputAmount,
        fee: feeAmount,
        recipientAmount: recipientAmount,
        transactionSteps: [
          {
            step: "on-ramp",
            description: `Convert ${session.user.preferredCurrency || 'CAD'} to XLM for payment`,
            fromAccount: 'Bank Account',
            toAccount: 'Kavodax Wallet'
          },
          {
            step: "transfer",
            description: `Transfer XLM via Stellar Network to ${destinationPublicKey.substring(0, 8)}...`,
            fromAccount: 'Kavodax Wallet',
            toAccount: 'Stellar Network'
          },
          {
            step: "off-ramp",
            description: `Convert XLM to ${session.user.preferredCurrency || 'CAD'} for recipient (after 1% fee)`,
            fromAccount: 'Stellar Network',
            toAccount: destinationPublicKey
          }
        ]
      }
    });
  } catch (error) {
    console.error('Failed to create transfer transaction record:', error);
    return NextResponse.json({ error: 'Failed to create transfer transaction record' }, { status: 500 });
  }

  try {
    const users = await readUsers();
    const user = users[session.user.email];

    if (!user || !user.stellarSecretKey) {
        await updateTransactionStatus(transferTransaction.id, 'failed');
        return NextResponse.json({ error: 'User not found or secret key missing' }, { status: 404 });
    }
    
    const sourceSecretKey = user.stellarSecretKey;
    const sourceKeypair = Keypair.fromSecret(sourceSecretKey);

    const horizon = new Horizon.Server('https://horizon-testnet.stellar.org');
    const sourceAccount = await horizon.loadAccount(sourceKeypair.publicKey());

    const stellarTransaction = new TransactionBuilder(sourceAccount, {
      fee: '100',
      networkPassphrase: 'Test SDF Network ; September 2015',
    })
      .addOperation(
        Operation.payment({
          destination: destinationPublicKey,
          asset: Asset.native(),
          amount: amount, // Keep using the original string amount for Stellar
        })
      )
      .setTimeout(30)
      .build();

    stellarTransaction.sign(sourceKeypair);

    const response = await horizon.submitTransaction(stellarTransaction);
    
    // Fetch the updated account balance after the transaction
    const updatedAccount = await horizon.loadAccount(sourceKeypair.publicKey());
    const xlmBalance = updatedAccount.balances.find((b: any) => b.asset_type === 'native');
    const currentXlmBalance = xlmBalance ? parseFloat(xlmBalance.balance) : 0;
    
    // For display purposes, we want to show the CAD balance, not the XLM balance
    // Calculate the CAD balance by subtracting the payment amount from the previous CAD balance
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
    
    // Calculate the new CAD balance by subtracting the payment amount
    const currentCadBalance = previousCadBalance - userInputAmount;
    console.log('Previous CAD balance:', previousCadBalance);
    console.log('Payment amount:', userInputAmount);
    console.log('New CAD balance:', currentCadBalance);
    
    // Update transaction status to completed
    await updateTransactionStatus(transferTransaction.id, 'completed', response.hash, currentCadBalance);
    
    return NextResponse.json({
      ...response,
      transactionId: transferTransaction.id,
      stellarTransactionHash: response.hash,
      balance: currentCadBalance,
      fee: feeAmount,
      recipientAmount: recipientAmount
    });
  } catch (error: any) {
    console.error('Stellar Error Details:', error?.response?.data?.extras);
    
    // Update transaction status to failed
    await updateTransactionStatus(transferTransaction.id, 'failed');
    
    return NextResponse.json({ 
      error: 'Failed to send money', 
      details: error.message,
      transactionId: transferTransaction.id
    }, { status: 500 });
  }
} 