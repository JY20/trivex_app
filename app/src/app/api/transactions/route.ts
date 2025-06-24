import { NextResponse } from 'next/server';

export const dynamic = "force-static";
export const revalidate = false;

// For static export, we'll return a placeholder response
// The actual transactions will need to be implemented client-side or via a serverless function
export async function GET() {
  return NextResponse.json({
    transactions: [],
    stats: {
      totalTransactions: 0,
      totalDeposits: 0,
      totalWithdrawals: 0,
      totalPayments: 0,
      averageTransactionAmount: 0
    },
    message: 'Static export: Transactions require server-side implementation'
  });
} 