export interface TreasuryAnalysis {
    tvl: number;
    balances: {
      DFUND: number;
      DGOV: number;
      tDUST: number;
    };
    stablecoinRatio: string;
    concentrationRisk: string;
    riskScore: number;
    recommendation: string;
    aiAnalysis: string;
    walletAddress: string;
  }