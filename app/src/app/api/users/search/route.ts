import { NextResponse } from 'next/server';
import { getIronSession, IronSession, IronSessionData } from 'iron-session';
import { sessionOptions } from '@/lib/session';
import { cookies } from 'next/headers';
import fs from 'fs/promises';
import path from 'path';
import { User } from '@/types/user';

const usersFilePath = path.join(process.cwd(), 'users.json');

async function readUsers(): Promise<{[email: string]: User}> {
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

export async function GET(request: Request) {
  const session: IronSession<IronSessionData> = await getIronSession(await cookies(), sessionOptions);

  if (!session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query || query.length < 2) {
    return NextResponse.json({ users: [], total: 0, query });
  }

  try {
    const users = await readUsers();
    const currentUserEmail = session.user.email;
    
    // Search for users by email or name (case insensitive)
    const matchingUsers = Object.entries(users)
      .filter(([email, userData]: [string, User]) => {
        // Don't include the current user
        if (email === currentUserEmail) return false;
        
        const lowerCaseQuery = query.toLowerCase();

        // Search by email
        if (email.toLowerCase().includes(lowerCaseQuery)) return true;
        
        // Search by name
        if (userData.displayName && userData.displayName.toLowerCase().includes(lowerCaseQuery)) return true;
        
        return false;
      })
      .map(([email, userData]: [string, User]) => ({
        email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        stellarPublicKey: userData.stellarPublicKey,
        preferredCurrency: userData.preferredCurrency || 'CAD',
        displayName: userData.firstName && userData.lastName 
          ? `${userData.firstName} ${userData.lastName}`
          : userData.firstName || email
      }))
      .slice(0, 10); // Limit to 10 results

    return NextResponse.json({
      users: matchingUsers,
      total: matchingUsers.length,
      query
    });
  } catch (error: any) {
    console.error('Error searching users:', error);
    return NextResponse.json({ error: 'Failed to search users' }, { status: 500 });
  }
} 