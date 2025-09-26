import { Action, IAgentRuntime, Memory, State, HandlerCallback } from '@ai16z/eliza';
import { suggestRebalancing, generateProposalText, AllocationPolicy } from '@/lib/treasury/allocator';
import { TokenBalance, TreasuryMetrics } from '@/types/treasury';

export const rebalanceAction: Action = {
  name: "SUGGEST_REBALANCE",
  similes: ["REBALANCE", "ALLOCATE", "OPTIMIZE_PORTFOLIO"],
  description: "Generates treasury rebalancing recommendations and governance proposals",
  
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
      // Extract data from message (would come from Risk Monitor)
      const metrics = options?.metrics as TreasuryMetrics;
      const balances = options?.balances as TokenBalance[];
      const prices = options?.prices as Record<string, number>;

      if (!metrics || !balances || !prices) {
        throw new Error('Missing required data from Risk Monitor');
      }

      // Define allocation policy
      const policy: AllocationPolicy = {
        targetStablesRatio: 0.65,
        tolerance: 0.05,
        maxMovePctPerCycle: 0.2,
        assetCapPct: 0.35
      };

      // Generate rebalancing actions
      const actions = suggestRebalancing(
        balances,
        prices,
        metrics.stablesRatio,
        metrics.tvl,
        policy
      );

      // Generate proposal text
      const proposalText = generateProposalText(actions, {
        tvl: metrics.tvl,
        stablesRatio: metrics.stablesRatio,
        runway: metrics.runway
      });

      // Create proposal JSON for multisig
      const proposalJSON = {
        title: "Treasury Rebalancing Proposal",
        description: proposalText,
        actions: actions.map(a => ({
          type: a.type,
          from: a.from,
          to: a.to,
          amount: a.amount,
          reason: a.reason
        })),
        metadata: {
          generatedAt: Date.now(),
          metrics,
          policy
        }
      };

      const response = {
        text: `Portfolio Rebalancing Complete:

${proposalText}

📋 Actions: ${actions.length} rebalancing operation(s)
💰 Total to rebalance: $${actions.reduce((sum, a) => sum + a.amount, 0).toLocaleString()}`,
        data: {
          actions,
          proposalText,
          proposalJSON,
          timestamp: Date.now()
        }
      };

      if (callback) {
        await callback(response);
      }

      return true;
    } catch (error) {
      console.error('Rebalancing failed:', error);
      if (callback) {
        await callback({
          text: `Rebalancing failed: ${(error as Error).message}`,
          data: { error: true }
        });
      }
      return false;
    }
  },

  examples: [
    [
      {
        user: "risk_monitor",
        content: { text: "Risk threshold breached - stables ratio too low" }
      },
      {
        user: "portfolio_manager",
        content: { text: "Generating rebalancing proposal..." }
      }
    ]
  ]
};