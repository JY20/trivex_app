export const dynamic = "force-static";
export const revalidate = false;
import { NextResponse } from 'next/server';
import { migratePioneerBankAccounts } from '@/scripts/migrate-pioneer-bank';

export async function POST(request: Request) {
  try {
    await migratePioneerBankAccounts();
    return NextResponse.json({ 
      success: true, 
      message: 'Pioneer Bank migration completed successfully' 
    });
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to run migration' 
    }, { status: 500 });
  }
} 