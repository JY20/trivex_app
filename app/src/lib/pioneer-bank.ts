import { v4 as uuidv4 } from 'uuid';

// Pioneer Bank routing number (fictional Canadian bank)
export const PIONEER_BANK_ROUTING_NUMBER = '12345';

// Pioneer Bank details
export const PIONEER_BANK_INFO = {
  id: 'pioneer-bank',
  name: 'Pioneer Bank',
  code: 'PION',
  logo: '🏦',
  routingNumber: PIONEER_BANK_ROUTING_NUMBER,
  transitNumber: PIONEER_BANK_ROUTING_NUMBER,
};

/**
 * Generate a Pioneer Bank account for a user
 */
export function generatePioneerBankAccount(userEmail: string, stellarPublicKey: string): {
  id: string;
  bankId: string;
  bankName: string;
  bankCode: string;
  accountNumber: string;
  transitNumber: string;
  isPrimary: boolean;
  isPioneerBank: boolean;
  stellarPublicKey: string;
} {
  // Generate a unique account number based on user email and stellar public key
  const emailHash = userEmail.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  const publicKeyHash = stellarPublicKey.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  // Create a deterministic account number (7-12 digits)
  const accountNumberBase = Math.abs(emailHash + publicKeyHash) % 1000000;
  const accountNumber = (1000000 + accountNumberBase).toString();
  
  return {
    id: `pioneer-${uuidv4()}`,
    bankId: PIONEER_BANK_INFO.id,
    bankName: PIONEER_BANK_INFO.name,
    bankCode: PIONEER_BANK_INFO.code,
    accountNumber: accountNumber,
    transitNumber: PIONEER_BANK_INFO.transitNumber,
    isPrimary: true, // Pioneer Bank is always primary by default
    isPioneerBank: true,
    stellarPublicKey: stellarPublicKey,
  };
}

/**
 * Check if a bank account is a Pioneer Bank account
 */
export function isPioneerBankAccount(bankAccount: any): boolean {
  return bankAccount.bankCode === PIONEER_BANK_INFO.code || bankAccount.isPioneerBank === true;
}

/**
 * Get Pioneer Bank account from user's bank accounts
 */
export function getPioneerBankAccount(bankAccounts: any[]): any | null {
  return bankAccounts.find(account => isPioneerBankAccount(account)) || null;
} 