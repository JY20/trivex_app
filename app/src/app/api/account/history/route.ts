import { NextResponse } from 'next/server';

export const dynamic = "force-static";
export const revalidate = false;

// For static export, we'll return a placeholder response
// The actual payment history will need to be implemented client-side or via a serverless function
export async function GET() {
  return NextResponse.json({
    _embedded: {
      records: []
    },
    _links: {
      self: {
        href: ""
      }
    },
    message: 'Static export: Payment history requires server-side implementation'
  });
} 