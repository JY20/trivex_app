import { NextResponse } from 'next/server';
import { getIronSession, IronSession, IronSessionData } from 'iron-session';
import { sessionOptions } from '@/lib/session';
import { cookies } from 'next/headers';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Recipient } from '@/types/recipient';

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

// Get all recipients for the logged-in user
export async function GET(_request: Request) {
    const session: IronSession<IronSessionData> = await getIronSession(await cookies(), sessionOptions);

    if (!session.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const users = await readUsers();
    const user = users[session.user.email];

    if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user.recipients || []);
}

// Add a new recipient
export async function POST(request: Request) {
  const session: IronSession<IronSessionData> = await getIronSession(await cookies(), sessionOptions);

  if (!session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { name, publicKey } = await request.json();

  if (!name || !publicKey) {
    return NextResponse.json({ error: 'Name and public key are required' }, { status: 400 });
  }

  const users = await readUsers();
  const user = users[session.user.email];

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  if (!user.recipients) {
    user.recipients = [];
  }
  
  const newRecipient: Recipient = { id: uuidv4(), name, publicKey };
  user.recipients.push(newRecipient);

  await writeUsers(users);

  return NextResponse.json(newRecipient);
}

// Delete a recipient
export async function DELETE(request: Request) {
    const session: IronSession<IronSessionData> = await getIronSession(await cookies(), sessionOptions);
    
    if (!session.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { id } = await request.json();
    
    if (!id) {
        return NextResponse.json({ error: 'Recipient ID is required' }, { status: 400 });
    }
    
    const users = await readUsers();
    const user = users[session.user.email];
    
    if (!user || !user.recipients) {
        return NextResponse.json({ error: 'User or recipients not found' }, { status: 404 });
    }
    
    const initialLength = user.recipients.length;
    user.recipients = user.recipients.filter((r: Recipient) => r.id !== id);
    
    if (user.recipients.length === initialLength) {
        return NextResponse.json({ error: 'Recipient not found' }, { status: 404 });
    }
    
    await writeUsers(users);
    
    return NextResponse.json({ success: true });
} 