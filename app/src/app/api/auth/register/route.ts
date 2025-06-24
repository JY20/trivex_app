import { NextResponse } from 'next/server';

export const dynamic = "force-static";
export const revalidate = false;
import { getIronSession, IronSession, IronSessionData } from 'iron-session';
import { sessionOptions } from '@/lib/session';
import { cookies } from 'next/headers';
import bcrypt from 'bcrypt';
import fs from 'fs/promises';
import path from 'path';
import { Keypair } from 'stellar-sdk';
import { generatePioneerBankAccount } from '@/lib/pioneer-bank';

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
  const { email, password, firstName, lastName } = await request.json();

  if (!email || !password || !firstName || !lastName) {
    return NextResponse.json(
      { error: 'Email, password, first name, and last name are required' },
      { status: 400 }
    );
  }

  const users = await readUsers();

  if (users[email]) {
    return NextResponse.json({ error: 'User already exists' }, { status: 409 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  
  // Create main Kavodax account
  const kavodaxPair = Keypair.random();
  
  // Create Pioneer Bank account
  const pioneerBankPair = Keypair.random();
  
  try {
    // Fund both accounts with friendbot
    await Promise.all([
      fetch(`https://friendbot.stellar.org?addr=${kavodaxPair.publicKey()}`),
      fetch(`https://friendbot.stellar.org?addr=${pioneerBankPair.publicKey()}`)
    ]);
  } catch (e) {
      return NextResponse.json({ error: 'Failed to fund accounts with friendbot' }, { status: 500 });
  }

  // Generate Pioneer Bank account for the user
  const pioneerBankAccount = generatePioneerBankAccount(email, pioneerBankPair.publicKey());

  users[email] = {
    password: hashedPassword,
    stellarPublicKey: kavodaxPair.publicKey(),
    stellarSecretKey: kavodaxPair.secret(),
    pioneerBankPublicKey: pioneerBankPair.publicKey(),
    pioneerBankSecretKey: pioneerBankPair.secret(),
    firstName,
    lastName,
    preferredCurrency: 'CAD',
    bankAccounts: [pioneerBankAccount], // Add Pioneer Bank account by default
  };

  await writeUsers(users);

  const session: IronSession<IronSessionData> = await getIronSession(
    await cookies(),
    sessionOptions
  );
  const sessionData = {
    email,
    stellarPublicKey: kavodaxPair.publicKey(),
    pioneerBankPublicKey: pioneerBankPair.publicKey(),
    firstName,
    lastName,
    displayName: `${firstName} ${lastName}`,
    preferredCurrency: 'CAD',
    bankAccounts: [pioneerBankAccount],
  };
  session.user = sessionData;
  await session.save();

  return NextResponse.json(sessionData);
} 