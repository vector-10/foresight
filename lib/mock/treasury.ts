export const MOCK_TREASURY = {
  walletAddress: '0x1234567890123456789012345678901234567890',
  tokens: [
    { symbol: 'USDC', address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', coingeckoId: 'usd-coin' },
    { symbol: 'USDT', address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', coingeckoId: 'tether' },
    { symbol: 'ETH', address: 'native', coingeckoId: 'ethereum' },
  ],
  monthlyBurn: 50000,
  thresholds: {
    minStablesRatio: 0.5,
    maxConcentration: 0.35,
    minRunway: 6
  }
};

export const MOCK_BALANCES = [
  { token: 'USDC', address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', balance: '300000000000', decimals: 6, normalized: 300000 },
  { token: 'USDT', address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', balance: '200000000000', decimals: 6, normalized: 200000 },
  { token: 'ETH', address: 'native', balance: '150000000000000000000', decimals: 18, normalized: 150 },
];

export const MOCK_PRICES = {
  'usdc': 1,
  'usdt': 1, 
  'ethereum': 2500
};