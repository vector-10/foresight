export interface TokenBalance {
    token: string;
    address: string;
    balance: string;
    decimals: number;
    normalized: number;
  }
  
  export interface TreasuryConfig {
    walletAddress: string;
    monthlyBurn: number;
    thresholds: {
      minStablesRatio: number;
      maxConcentration: number;
      minRunway: number;
    };
  }
  
  export interface TreasuryMetrics {
    tvl: number;
    stablesRatio: number;
    concentrationRisk: number;
    runway: number;
    riskScore: number;
  }