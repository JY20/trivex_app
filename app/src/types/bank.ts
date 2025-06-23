export interface BankAccount {
  id: string;
  bankId: string;
  bankName: string;
  bankCode: string;
  accountNumber: string;
  transitNumber: string;
  isPrimary: boolean;
  isPioneerBank?: boolean;
  stellarPublicKey?: string;
}

export interface Bank {
  id: string;
  name: string;
  code: string;
  logo: string;
}

export interface BankSearchResponse {
  banks: Bank[];
  total: number;
  query: string;
} 