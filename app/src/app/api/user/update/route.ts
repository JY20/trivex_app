import { NextResponse } from 'next/server';
import { getIronSession, IronSession, IronSessionData } from 'iron-session';
import { sessionOptions } from '@/lib/session';
import { cookies } from 'next/headers';
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

async function writeUsers(data: any) {
  await fs.writeFile(usersFilePath, JSON.stringify(data, null, 2));
}

export async function POST(request: Request) {
  const session: IronSession<IronSessionData> = await getIronSession(await cookies(), sessionOptions);

  if (!session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { firstName, lastName, bankAccounts, preferredCurrency } = await request.json();

  if (!firstName || !lastName) {
    return NextResponse.json({ error: 'First name and last name are required' }, { status: 400 });
  }

  const users = await readUsers();
  const user = users[session.user.email];

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  user.firstName = firstName;
  user.lastName = lastName;
  user.displayName = `${firstName} ${lastName}`;
  user.preferredCurrency = preferredCurrency || 'CAD';
  
  // Update bank accounts if provided
  if (bankAccounts && Array.isArray(bankAccounts)) {
    user.bankAccounts = bankAccounts;
  }

  await writeUsers(users);

  session.user.firstName = firstName;
  session.user.lastName = lastName;
  session.user.displayName = `${firstName} ${lastName}`;
  session.user.preferredCurrency = preferredCurrency || 'CAD';
  if (bankAccounts && Array.isArray(bankAccounts)) {
    session.user.bankAccounts = bankAccounts;
  }
  await session.save();

  return NextResponse.json({ success: true, user: session.user });
} 