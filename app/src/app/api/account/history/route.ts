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
    const payments = await horizon.payments().forAccount(publicKey).call();
    return NextResponse.json(payments);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to get payment history' }, { status: 500 });
  }
} 