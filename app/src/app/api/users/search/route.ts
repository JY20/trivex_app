import { NextResponse } from 'next/server';

export const dynamic = "force-static";
export const revalidate = false;

// For static export, we'll return a placeholder response
// The actual user search will need to be implemented client-side or via a serverless function
export async function GET() {
  return NextResponse.json({
    users: [],
    total: 0,
    query: '',
    message: 'Static export: User search requires server-side implementation'
  });
} 