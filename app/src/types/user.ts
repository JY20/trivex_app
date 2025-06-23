import { BankAccount } from "./bank";
import { Recipient } from "./recipient";

export interface User {
  email: string;
  firstName: string;
  lastName: string;
  stellarPublicKey: string;
  displayName: string;
  pioneerBankPublicKey: string;
  bankAccounts?: BankAccount[];
  recipients?: Recipient[];
  preferredCurrency?: string;
}

export interface UserSearchResponse {
  users: User[];
  total: number;
  query: string;
} 