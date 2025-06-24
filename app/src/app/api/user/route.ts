import { NextResponse } from 'next/server';

export const dynamic = "force-static";
export const revalidate = false;

// For static export, we'll return a placeholder response
// The actual user data will need to be implemented client-side or via a serverless function
export async function GET() {
  return NextResponse.json({
    user: null,
    message: 'Static export: User data requires server-side implementation'
  });
} 