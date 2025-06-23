import { NextResponse } from 'next/server';
import { Horizon } from 'stellar-sdk';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const publicKey = searchParams.get('publicKey');

  if (!publicKey) {
    return NextResponse.json({ error: 'publicKey is required' }, { status: 400 });
  }

  try {
    const horizon = new Horizon.Server('https://horizon-testnet.stellar.org');

    const account = await horizon.loadAccount(publicKey);
    return NextResponse.json({ balances: account.balances });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to get balance' }, { status: 500 });
  }
} 