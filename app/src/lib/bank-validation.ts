// Canadian Bank Validation Utilities

export interface BankValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface BankAccount {
  bankCode: string;
  accountNumber: string;
  transitNumber?: string;
}

// Major Canadian bank transit number ranges
const BANK_TRANSIT_RANGES = {
  'RBC': { start: 1, end: 199 },
  'TD': { start: 200, end: 399 },
  'BMO': { start: 400, end: 599 },
  'CIBC': { start: 600, end: 799 },
  'Scotiabank': { start: 800, end: 999 },
  'National Bank': { start: 1000, end: 1199 },
  'HSBC': { start: 1200, end: 1399 },
  'Desjardins': { start: 1400, end: 1599 },
  'Laurentian': { start: 1600, end: 1799 },
  'Canadian Western': { start: 1800, end: 1999 },
  'ATB': { start: 2000, end: 2199 },
  'Coast Capital': { start: 2200, end: 2399 },
  'Vancity': { start: 2400, end: 2599 },
  'Servus': { start: 2600, end: 2799 },
  'Affinity': { start: 2800, end: 2999 },
  'Alterna': { start: 3000, end: 3199 },
  'Assiniboine': { start: 3200, end: 3399 },
  'Cambrian': { start: 3400, end: 3599 },
  'Connect First': { start: 3600, end: 3799 },
  'First West': { start: 3800, end: 3999 },
  'Innovation': { start: 4000, end: 4199 },
  'Libro': { start: 4200, end: 4399 },
  'Northern': { start: 4400, end: 4599 },
  'Peoples': { start: 4600, end: 4799 },
  'Prospera': { start: 4800, end: 4999 },
  'SaskCentral': { start: 5000, end: 5199 },
  'Steinbach': { start: 5200, end: 5399 },
  'Sunshine Coast': { start: 5400, end: 5599 },
  'Synergy': { start: 5600, end: 5799 },
  'Tandia': { start: 5800, end: 5999 },
  'Westoba': { start: 6000, end: 6199 },
  'Windsor': { start: 6200, end: 6399 },
  'Yukon': { start: 6400, end: 6599 }
};

// Validate transit number format (5 digits)
export function validateTransitNumber(transitNumber: string): BankValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!transitNumber) {
    errors.push('Transit number is required');
    return { isValid: false, errors, warnings };
  }

  // Check if it's exactly 5 digits
  if (!/^\d{5}$/.test(transitNumber)) {
    errors.push('Transit number must be exactly 5 digits');
    return { isValid: false, errors, warnings };
  }

  // Check if it's in a valid range (00001-99999)
  const transitNum = parseInt(transitNumber);
  if (transitNum < 1 || transitNum > 99999) {
    errors.push('Transit number must be between 00001 and 99999');
    return { isValid: false, errors, warnings };
  }

  return { isValid: true, errors, warnings };
}

// Validate account number format (7-12 digits)
export function validateAccountNumber(accountNumber: string): BankValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!accountNumber) {
    errors.push('Account number is required');
    return { isValid: false, errors, warnings };
  }

  // Check if it's 7-12 digits
  if (!/^\d{7,12}$/.test(accountNumber)) {
    errors.push('Account number must be between 7 and 12 digits');
    return { isValid: false, errors, warnings };
  }

  // Check for common patterns that might indicate invalid numbers
  if (/^0+$/.test(accountNumber)) {
    errors.push('Account number cannot be all zeros');
    return { isValid: false, errors, warnings };
  }

  if (/^1+$/.test(accountNumber)) {
    warnings.push('Account number appears to be all ones - please verify');
  }

  return { isValid: true, errors, warnings };
}

// Validate bank code against known Canadian banks
export function validateBankCode(bankCode: string): BankValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!bankCode) {
    errors.push('Bank code is required');
    return { isValid: false, errors, warnings };
  }

  // Check if it's a valid bank code (3-4 characters, alphanumeric)
  if (!/^[A-Z0-9]{3,4}$/.test(bankCode)) {
    errors.push('Bank code must be 3-4 alphanumeric characters');
    return { isValid: false, errors, warnings };
  }

  // Check against known bank codes
  const knownBankCodes = Object.keys(BANK_TRANSIT_RANGES);
  if (!knownBankCodes.includes(bankCode)) {
    warnings.push(`Bank code '${bankCode}' is not in our database of major Canadian banks`);
  }

  return { isValid: true, errors, warnings };
}

// Validate complete bank account information
export function validateBankAccount(bankAccount: BankAccount): BankValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate transit number
  const transitValidation = validateTransitNumber(bankAccount.transitNumber || bankAccount.bankCode);
  errors.push(...transitValidation.errors);
  warnings.push(...transitValidation.warnings);

  // Validate account number
  const accountValidation = validateAccountNumber(bankAccount.accountNumber);
  errors.push(...accountValidation.errors);
  warnings.push(...accountValidation.warnings);

  // Validate bank code
  const bankCodeValidation = validateBankCode(bankAccount.bankCode);
  errors.push(...bankCodeValidation.errors);
  warnings.push(...bankCodeValidation.warnings);

  // Additional cross-validation checks
  if (transitValidation.isValid && accountValidation.isValid) {
    // Check if transit number and account number are the same (common error)
    if (bankAccount.transitNumber === bankAccount.accountNumber) {
      errors.push('Transit number and account number cannot be the same');
    }

    // Check for suspicious patterns
    if (bankAccount.accountNumber.length === 5 && bankAccount.transitNumber === bankAccount.accountNumber) {
      errors.push('Account number appears to be a transit number - please verify');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

// Format account number for display (mask sensitive parts)
export function formatAccountNumber(accountNumber: string): string {
  if (!accountNumber || accountNumber.length < 4) {
    return accountNumber;
  }
  
  const visibleDigits = 4;
  const maskedLength = accountNumber.length - visibleDigits;
  const maskedPart = '*'.repeat(maskedLength);
  const visiblePart = accountNumber.slice(-visibleDigits);
  
  return `${maskedPart}${visiblePart}`;
}

// Generate a sample transit number for a given bank
export function getSampleTransitNumber(bankCode: string): string | null {
  const bankRanges = BANK_TRANSIT_RANGES[bankCode as keyof typeof BANK_TRANSIT_RANGES];
  
  if (!bankRanges) {
    return null;
  }
  
  // Return a sample transit number from the middle of the range
  const sampleNumber = Math.floor((bankRanges.start + bankRanges.end) / 2);
  return sampleNumber.toString().padStart(5, '0');
} 