import { NextResponse } from 'next/server';

export const dynamic = "force-static";
export const revalidate = false;

// For static export, we'll return a placeholder response
// The actual balance check will need to be implemented client-side or via a serverless function
export async function GET() {
  return NextResponse.json({
    balances: [
      {
        balance: "0.0000000",
        asset_type: "native"
      }
    ],
    message: 'Static export: Balance check requires server-side implementation'
  });
} 