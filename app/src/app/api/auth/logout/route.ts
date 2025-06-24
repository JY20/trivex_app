import { NextResponse } from 'next/server';

export const dynamic = "force-static";
export const revalidate = false;
import { getIronSession } from 'iron-session';
import { sessionOptions } from '@/lib/session';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  const session = await getIronSession(await cookies(), sessionOptions);
  session.destroy();
  return NextResponse.json({ message: 'Logged out' });
} 