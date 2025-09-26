export const MOCK_TREASURY = {
    walletAddress: '0x1234567890123456789012345678901234567890',
    tokens: [
      { symbol: 'USDC', address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', coingeckoId: 'usd-coin' },
      { symbol: 'USDT', address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', coingeckoId: 'tether' },
      { symbol: 'WETH', address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', coingeckoId: 'weth' },
    ],
    monthlyBurn: 50000,
    thresholds: {
      minStablesRatio: 0.4,
      maxConcentration: 0.35,
      minRunway: 3
    }
  };