import { Action, IAgentRuntime, Memory, State, HandlerCallback } from '@ai16z/eliza';
import { getWalletBalances } from '@/lib/wallet/balances';
import { getTokenPrices } from '@/lib/prices/coingecko';
import { analyzeRisk } from '@/lib/treasury/calculator';
import { MOCK_TREASURY } from '@/lib/mock/treasury';

export const analyzeRiskAction: Action = {
  name: "ANALYZE_RISK",
  similes: ["CHECK_RISK", "ASSESS_TREASURY", "CALCULATE_METRICS"],
  description: "Analyzes DAO treasury risk metrics and checks thresholds",
  
  validate: async (runtime: IAgentRuntime, message: Memory) => {
    return true;
  },

  handler: async (
    runtime: IAgentRuntime,
    message: Memory,
    state?: State,
    options?: any,
    callback?: HandlerCallback
  ): Promise<boolean> => {
    try {
      const balances = await getWalletBalances(
        MOCK_TREASURY.walletAddress,
        MOCK_TREASURY.tokens,
        process.env.ETH_RPC_URL!
      );

      const tokenIds = MOCK_TREASURY.tokens.map(t => t.coingeckoId);
      const prices = await getTokenPrices(tokenIds);

      const metrics = analyzeRisk(
        balances,
        prices,
        MOCK_TREASURY.monthlyBurn,
        MOCK_TREASURY.thresholds
      );

      const breached = 
        metrics.stablesRatio < MOCK_TREASURY.thresholds.minStablesRatio ||
        metrics.concentrationRisk > MOCK_TREASURY.thresholds.maxConcentration ||
        metrics.runway < MOCK_TREASURY.thresholds.minRunway;


      const response = {
        text: `Treasury Analysis Complete:
  - TVL: $${metrics.tvl.toLocaleString()}
  - Stables Ratio: ${(metrics.stablesRatio * 100).toFixed(1)}%
  - Concentration Risk: ${(metrics.concentrationRisk * 100).toFixed(1)}%
  - Runway: ${metrics.runway.toFixed(1)} months
  - Risk Score: ${(metrics.riskScore * 100).toFixed(1)}/100
  
  ${breached ? '⚠️ THRESHOLD BREACH DETECTED - Triggering Portfolio Manager' : '✅ All metrics within acceptable range'}`,
        data: {
          metrics,
          breached,
          timestamp: Date.now()
        }
      };
  
      if (callback) {
        await callback(response);
      }
  
      if (breached) {
        console.log('🚨 Risk threshold breached - would trigger Portfolio Manager');
      }
  
      return true;
    } catch (error) {
      console.error('Risk analysis failed:', error);
      if (callback) {
        await callback({
          text: `Risk analysis failed: ${(error as Error).message}`,
          data: { error: true }
        });
      }
      return false;
    }
  },

  examples: [
    [
      {
        user: "user",
        content: { text: "Check treasury risk" }
      },
      {
        user: "risk_monitor",
        content: { text: "Analyzing treasury metrics..." }
      }
    ]
  ]
};