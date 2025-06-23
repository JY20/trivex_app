import 'dotenv/config';
import { Keypair } from 'stellar-sdk';

if (!process.env.STELLAR_SECRET_KEY) {
  throw new Error('STELLAR_SECRET_KEY is not set in .env.local');
}

export const serverWallet = () => {
    return Keypair.fromSecret(process.env.STELLAR_SECRET_KEY!);
} 