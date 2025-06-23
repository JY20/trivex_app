import { popularCurrencies } from './currencies';

// Currency conversion utility
export interface CurrencyRates {
  [currency: string]: number;
}

// Cache for exchange rates to avoid too many API calls
let ratesCache: CurrencyRates | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const allCurrencyCodes = popularCurrencies.map(c => c.code.toLowerCase()).join(',');

export async function getExchangeRates(): Promise<CurrencyRates> {
  const now = Date.now();
  
  // Return cached rates if still valid
  if (ratesCache && (now - cacheTimestamp) < CACHE_DURATION) {
    return ratesCache;
  }

  try {
    // Get XLM to all major currencies
    const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=stellar&vs_currencies=${allCurrencyCodes}`);
    const data = await response.json();
    
    if (data.stellar) {
      ratesCache = data.stellar;
      cacheTimestamp = now;
      return data.stellar;
    }
  } catch (error) {
    console.error('Failed to fetch exchange rates:', error);
  }

  // Return default rates if API fails
  return {
    cad: 0.33,
    usd: 0.25,
    eur: 0.23,
    gbp: 0.20,
    jpy: 35.0,
    aud: 0.38,
    chf: 0.22,
    cny: 1.80,
    inr: 20.0,
    brl: 1.25,
    ngn: 115,
    zar: 4.5,
    egp: 12,
    kes: 32,
    ghs: 3,
    mad: 2.5,
    tnd: 0.78,
    ugx: 930,
    tzs: 650,
    etb: 14,
    xof: 150,
    xaf: 150,
    zmw: 6.5,
    mwk: 430,
    bwp: 3.4,
    nad: 4.5,
    mur: 11.5,
    sll: 5500
  };
}

export function convertXLMToCurrency(xlm: number, targetCurrency: string): string {
  const currency = targetCurrency.toLowerCase();
  
  // Default conversion if no rates available
  const defaultRates: CurrencyRates = {
    cad: 0.33,
    usd: 0.25,
    eur: 0.23,
    gbp: 0.20,
    jpy: 35.0,
    aud: 0.38,
    chf: 0.22,
    cny: 1.80,
    inr: 20.0,
    brl: 1.25,
    ngn: 115,
    zar: 4.5,
    egp: 12,
    kes: 32,
    ghs: 3,
    mad: 2.5,
    tnd: 0.78,
    ugx: 930,
    tzs: 650,
    etb: 14,
    xof: 150,
    xaf: 150,
    zmw: 6.5,
    mwk: 430,
    bwp: 3.4,
    nad: 4.5,
    mur: 11.5,
    sll: 5500
  };

  const rate = ratesCache?.[currency] || defaultRates[currency] || 0.33;
  const converted = xlm * rate;

  // Format based on currency
  const formatters: { [key: string]: Intl.NumberFormat } = {
    cad: new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }),
    usd: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }),
    eur: new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }),
    gbp: new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }),
    jpy: new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }),
    aud: new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }),
    chf: new Intl.NumberFormat('de-CH', { style: 'currency', currency: 'CHF' }),
    cny: new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY' }),
    inr: new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }),
    brl: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }),
    ngn: new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }),
    zar: new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }),
    egp: new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP' }),
    kes: new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }),
    ghs: new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' }),
    mad: new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD' }),
    tnd: new Intl.NumberFormat('ar-TN', { style: 'currency', currency: 'TND' }),
    ugx: new Intl.NumberFormat('en-UG', { style: 'currency', currency: 'UGX' }),
    tzs: new Intl.NumberFormat('en-TZ', { style: 'currency', currency: 'TZS' }),
    etb: new Intl.NumberFormat('am-ET', { style: 'currency', currency: 'ETB' }),
    xof: new Intl.NumberFormat('fr-SN', { style: 'currency', currency: 'XOF' }),
    xaf: new Intl.NumberFormat('fr-CM', { style: 'currency', currency: 'XAF' }),
    zmw: new Intl.NumberFormat('en-ZM', { style: 'currency', currency: 'ZMW' }),
    mwk: new Intl.NumberFormat('en-MW', { style: 'currency', currency: 'MWK' }),
    bwp: new Intl.NumberFormat('en-BW', { style: 'currency', currency: 'BWP' }),
    nad: new Intl.NumberFormat('en-NA', { style: 'currency', currency: 'NAD' }),
    mur: new Intl.NumberFormat('en-MU', { style: 'currency', currency: 'MUR' }),
    sll: new Intl.NumberFormat('en-SL', { style: 'currency', currency: 'SLL' })
  };

  const formatter = formatters[currency] || formatters.cad;
  return formatter.format(converted);
}

export function getCurrencySymbol(currency: string): string {
  const symbols: { [key: string]: string } = popularCurrencies.reduce((acc, curr) => {
    acc[curr.code] = curr.symbol;
    return acc;
  }, {} as { [key: string]: string });
  
  return symbols[currency] || currency;
}

export function convertCurrencyToXLM(amount: number, fromCurrency: string): number {
  const currency = fromCurrency.toLowerCase();
  
  // Invert the rates for conversion to XLM
  const defaultRates: CurrencyRates = {
    cad: 0.33,
    usd: 0.25,
    eur: 0.23,
    gbp: 0.20,
    jpy: 35.0,
    aud: 0.38,
    chf: 0.22,
    cny: 1.80,
    inr: 20.0,
    brl: 1.25,
    ngn: 115,
    zar: 4.5,
    egp: 12,
    kes: 32,
    ghs: 3,
    mad: 2.5,
    tnd: 0.78,
    ugx: 930,
    tzs: 650,
    etb: 14,
    xof: 150,
    xaf: 150,
    zmw: 6.5,
    mwk: 430,
    bwp: 3.4,
    nad: 4.5,
    mur: 11.5,
    sll: 5500
  };

  const rate = ratesCache?.[currency] || defaultRates[currency];

  if (!rate) {
    throw new Error(`Exchange rate not available for currency: ${fromCurrency}`);
  }

  // To convert from currency to XLM, we divide by the rate
  return amount / rate;
} 