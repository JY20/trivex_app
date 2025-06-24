import { NextResponse } from 'next/server';

export const dynamic = "force-static";
export const revalidate = false;
import { getIronSession, IronSession, IronSessionData } from 'iron-session';
import { sessionOptions } from '@/lib/session';
import { cookies } from 'next/headers';
import { Horizon } from 'stellar-sdk';
import { createTransaction, updateTransactionStatus } from '@/lib/transaction-tracker';
import fs from 'fs/promises';

// Function to get XLM to CAD exchange rate
async function getXLMToCADRate(): Promise<number> {
  try {
    // Using CoinGecko API to get XLM price in USD, then converting to CAD
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=stellar&vs_currencies=usd');
    const data = await response.json();
    const xlmUsdPrice = data.stellar.usd;
    
    // Convert USD to CAD (using a fixed rate for simplicity, in production you'd use a real USD/CAD API)
    const usdToCadRate = 1.35; // Approximate USD to CAD rate
    return xlmUsdPrice * usdToCadRate;
  } catch (error: any) {
    console.error('Failed to fetch exchange rate:', error);
    // Fallback rate if API fails
    return 0.5;
  }
}

export async function GET(_request: Request) {
    console.log('Pioneer Bank GET request received');
    
    const session: IronSession<IronSessionData> = await getIronSession(await cookies(), sessionOptions);
    console.log('Session:', session);

    if (!session.user) {
        console.log('No user in session');
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('User email:', session.user.email);
    console.log('Pioneer Bank public key:', session.user.pioneerBankPublicKey);
    
    try {
        // Get the Pioneer Bank account balance from Stellar
        const horizon = new Horizon.Server('https://horizon-testnet.stellar.org');
        const account = await horizon.loadAccount(session.user.pioneerBankPublicKey);
        
        // Find the native XLM balance
        const xlmBalance = account.balances.find((balance: any) => balance.asset_type === 'native');
        const xlmAmount = xlmBalance ? parseFloat(xlmBalance.balance) : 0;
        
        console.log('XLM balance:', xlmAmount);
        
        // Convert XLM to CAD
        const xlmToCadRate = await getXLMToCADRate();
        const cadBalance = xlmAmount * xlmToCadRate;
        
        console.log('CAD balance:', cadBalance);
        
        return NextResponse.json({
            balance: cadBalance,
            currency: 'CAD',
            xlmBalance: xlmAmount,
            exchangeRate: xlmToCadRate
        });
        
    } catch (error: any) {
        console.error('Failed to fetch Pioneer Bank balance:', error);
        return NextResponse.json({ 
            error: 'Failed to fetch balance', 
            details: error.message 
        }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const session: IronSession<IronSessionData> = await getIronSession(await cookies(), sessionOptions);

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
            type: 'transfer',
            amount: cadAmount,
            currency: session.user.preferredCurrency || 'CAD',
            fromAccount: 'Pioneer Bank',
            toAccount: 'Kavodax Wallet',
            status: 'pending',
            description: `Transfer from Pioneer Bank to Kavodax Wallet`,
            metadata: {
                userPublicKey: session.user.stellarPublicKey,
                pioneerBankPublicKey: session.user.pioneerBankPublicKey
            }
        });
    } catch (error) {
        console.error('Failed to create transaction record:', error);
        return NextResponse.json({ error: 'Failed to create transaction record' }, { status: 500 });
    }

    try {
        // Import stellar-sdk and get exchange rate
        const { TransactionBuilder, Asset, Operation, Keypair } = await import('stellar-sdk');
        
        // Get current exchange rate
        const xlmToCadRate = await getXLMToCADRate();
        const xlmAmount = (cadAmount / xlmToCadRate).toFixed(7);
        
        // Check if Pioneer Bank account has enough XLM
        const horizon = new Horizon.Server('https://horizon-testnet.stellar.org');
        const pioneerAccount = await horizon.loadAccount(session.user.pioneerBankPublicKey);
        const xlmBalance = pioneerAccount.balances.find((balance: any) => balance.asset_type === 'native');
        const availableXlm = xlmBalance ? parseFloat(xlmBalance.balance) : 0;
        
        if (availableXlm < parseFloat(xlmAmount)) {
            if (transaction) {
                await updateTransactionStatus(transaction.id, 'failed');
            }
            return NextResponse.json({ 
                error: 'Insufficient funds in Pioneer Bank account',
                available: availableXlm * xlmToCadRate,
                requested: cadAmount,
                transactionId: transaction?.id
            }, { status: 400 });
        }
        
        // Create keypair for Pioneer Bank account
        const users = await fs.readFile('users.json', 'utf-8').then(data => JSON.parse(data));
        const user = users[session.user.email];
        const pioneerKeypair = Keypair.fromSecret(user.pioneerBankSecretKey);
        
        // Perform the transfer from Pioneer Bank to Kavodax wallet
        const stellarTransaction = new TransactionBuilder(pioneerAccount, {
            fee: '100',
            networkPassphrase: 'Test SDF Network ; September 2015',
        })
        .addOperation(
            Operation.payment({
                destination: session.user.stellarPublicKey,
                asset: Asset.native(),
                amount: xlmAmount.toString(),
            })
        )
        .setTimeout(30)
        .build();

        stellarTransaction.sign(pioneerKeypair);
        const response = await horizon.submitTransaction(stellarTransaction);
        
        // Update transaction status to completed
        if (transaction) {
            await updateTransactionStatus(transaction.id, 'completed', response.hash);
        }
        
        return NextResponse.json({ 
            success: true,
            message: 'Pioneer Bank transaction processed successfully',
            transactionId: transaction.id,
            stellarTransactionHash: response.hash,
            transferredXlm: xlmAmount,
            transferredCad: cadAmount
        });

    } catch (error: any) {
        console.error('Pioneer Bank Transfer Error:', error);
        
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
            error: 'Failed to process transfer', 
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