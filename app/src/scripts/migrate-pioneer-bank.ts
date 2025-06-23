import fs from 'fs/promises';
import path from 'path';
import { Keypair } from 'stellar-sdk';
import { generatePioneerBankAccount, isPioneerBankAccount } from '@/lib/pioneer-bank';

const usersFilePath = path.join(process.cwd(), 'users.json');

async function readUsers() {
  try {
    const data = await fs.readFile(usersFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return {};
  }
}

async function writeUsers(data: any) {
  await fs.writeFile(usersFilePath, JSON.stringify(data, null, 2));
}

export async function migratePioneerBankAccounts() {
  console.log('Starting Pioneer Bank migration...');
  
  const users = await readUsers();
  let migratedCount = 0;
  
  for (const [email, userData] of Object.entries(users)) {
    const user = userData as any;
    let updated = false;

    // 1. If missing Pioneer Bank keys, generate and fund
    if (!user.pioneerBankPublicKey || !user.pioneerBankSecretKey) {
      const pioneerPair = Keypair.random();
      try {
        console.log(`Funding Pioneer Bank account for ${email}: ${pioneerPair.publicKey()}`);
        await fetch(`https://friendbot.stellar.org?addr=${pioneerPair.publicKey()}`);
        user.pioneerBankPublicKey = pioneerPair.publicKey();
        user.pioneerBankSecretKey = pioneerPair.secret();
        updated = true;
      } catch (e) {
        console.error(`Failed to fund Pioneer Bank account for ${email}:`, e);
        continue;
      }
    }

    // 2. Ensure bankAccounts array exists
    if (!user.bankAccounts) {
      user.bankAccounts = [];
      updated = true;
    }

    // 3. If Pioneer Bank account not present, add it
    const hasPioneer = user.bankAccounts.some((acc: any) => isPioneerBankAccount(acc));
    if (!hasPioneer) {
      const pioneerBankAccount = generatePioneerBankAccount(email, user.pioneerBankPublicKey);
      // If this is the only account, set as primary
      if (user.bankAccounts.length === 0) pioneerBankAccount.isPrimary = true;
      user.bankAccounts.unshift(pioneerBankAccount);
      updated = true;
      console.log(`Added Pioneer Bank account for user ${email}: ${pioneerBankAccount.accountNumber}`);
    }

    if (updated) migratedCount++;
  }
  
  if (migratedCount > 0) {
    await writeUsers(users);
    console.log(`Migration completed! Updated ${migratedCount} users.`);
  } else {
    console.log('No users needed migration.');
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  migratePioneerBankAccounts().catch(console.error);
} 