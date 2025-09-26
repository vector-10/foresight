import axios from 'axios';

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const cache = new Map<string, { price: number; timestamp: number }>();

export async function getTokenPrices(tokenIds: string[]): Promise<Record<string, number>> {
  const now = Date.now();
  const prices: Record<string, number> = {};
  const toFetch: string[] = [];

  // Check cache
  for (const id of tokenIds) {
    const cached = cache.get(id);
    if (cached && now - cached.timestamp < CACHE_TTL) {
      prices[id] = cached.price;
    } else {
      toFetch.push(id);
    }
  }

  // Fetch missing prices
  if (toFetch.length > 0) {
    const response = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
      params: {
        ids: toFetch.join(','),
        vs_currencies: 'usd'
      }
    });

    for (const [id, data] of Object.entries(response.data)) {
      const price = (data as any).usd;
      prices[id] = price;
      cache.set(id, { price, timestamp: now });
    }
  }

  return prices;
}