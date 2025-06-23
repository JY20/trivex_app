export async function convert(amount: number, from: string, to: string): Promise<number> {
  if (from === to) {
    return amount;
  }

  try {
    const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${from}`);
    if (!response.ok) {
      throw new Error('Failed to fetch exchange rate');
    }
    const data = await response.json();
    const rate = data.rates?.[to];
    if (rate) {
      return amount * rate;
    } else {
      throw new Error('Exchange rate not available');
    }
  } catch (err) {
    console.error('Exchange rate error:', err);
    throw new Error('Failed to fetch exchange rate');
  }
} 