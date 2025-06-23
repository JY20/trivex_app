import { NextResponse } from 'next/server';
import { getIronSession, IronSession, IronSessionData } from 'iron-session';
import { sessionOptions } from '@/lib/session';
import { cookies } from 'next/headers';
import fs from 'fs/promises';
import path from 'path';
import { User } from '@/types/user';

const usersFilePath = path.join(process.cwd(), 'users.json');

async function readUsers() {
  try {
    const data = await fs.readFile(usersFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return {};
    }
    throw error;
  }
}

export async function GET(_request: Request) {
  const session: IronSession<IronSessionData> = await getIronSession(await cookies(), sessionOptions);

  if (!session.user) {
    return NextResponse.json({ user: null });
  }

  // Read complete user data from file
  const users = await readUsers();
  const userData = users[session.user.email];

  if (!userData) {
    return NextResponse.json({ user: null });
  }

  // Return user data with bank accounts
  const user: Partial<User> = {
    email: session.user.email,
    stellarPublicKey: userData.stellarPublicKey,
    pioneerBankPublicKey: userData.pioneerBankPublicKey,
    firstName: userData.firstName,
    lastName: userData.lastName,
    displayName: userData.displayName || `${userData.firstName} ${userData.lastName}`,
    bankAccounts: userData.bankAccounts || [],
    preferredCurrency: userData.preferredCurrency || 'CAD',
  };

  return NextResponse.json({ user });
} 