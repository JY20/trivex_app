import 'dotenv/config';
import type { SessionOptions } from 'iron-session';
import { BankAccount } from '@/types/bank';

if (!process.env.SESSION_SECRET) {
    throw new Error('SESSION_SECRET is not set in .env.local');
}

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET,
  cookieName: 'kavodax-session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
  },
}; 