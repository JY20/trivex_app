import { NextResponse } from 'next/server';
import { getIronSession, IronSession, IronSessionData } from 'iron-session';
import { sessionOptions } from '@/lib/session';
import { cookies } from 'next/headers';
import bcrypt from 'bcrypt';
import fs from 'fs/promises';
import path from 'path';

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

export async function POST(request: Request) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
  }

  const users = await readUsers();
  const user = users[email];

  if (!user) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  // Build the full user object (matching /api/user)
  const fullUser = {
    email,
    stellarPublicKey: user.stellarPublicKey,
    pioneerBankPublicKey: user.pioneerBankPublicKey,
    firstName: user.firstName,
    lastName: user.lastName,
    displayName: `${user.firstName} ${user.lastName}`,
    bankAccounts: user.bankAccounts || [],
    preferredCurrency: user.preferredCurrency || 'CAD',
  };

  const session: IronSession<IronSessionData> = await getIronSession(
    await cookies(),
    sessionOptions
  );
  session.user = fullUser;
  await session.save();

  return NextResponse.json(fullUser);
} 