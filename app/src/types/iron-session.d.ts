import { BankAccount } from '@/types/bank';
import { User } from '@/types/user';

declare module 'iron-session' {
    interface IronSessionData {
      user?: User;
    }
} 