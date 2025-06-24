import { NextResponse } from 'next/server';

export const dynamic = "force-static";
export const revalidate = false;
import { Keypair } from 'stellar-sdk';

export async function POST() {
  try {
    const pair = Keypair.random();
    console.log(`Funding account: ${pair.publicKey()}`);
    
    await fetch(`https://friendbot.stellar.org?addr=${pair.publicKey()}`);

    console.log('Account funded');

    return NextResponse.json({
      publicKey: pair.publicKey(),
      secretKey: pair.secret(),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 });
  }
} 