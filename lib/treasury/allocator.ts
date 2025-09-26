import { TokenBalance } from '@/types/treasury';

export interface AllocationAction {
  type: 'swap';
  from: string;
  to: string;
  amount: number;
  reason: string;
}

export interface AllocationPolicy {
  targetStablesRatio: number;
  tolerance: number;
  maxMovePctPerCycle: number;
  assetCapPct: number;
}

export function suggestRebalancing(
  balances: TokenBalance[],
  prices: Record<string, number>,
  currentStablesRatio: number,
  tvl: number,
  policy: AllocationPolicy
): AllocationAction[] {
  const actions: AllocationAction[] = [];
  
  // Check if stables ratio needs adjustment
  if (currentStablesRatio < policy.targetStablesRatio - policy.tolerance) {
    const targetIncrease = (policy.targetStablesRatio - currentStablesRatio) * tvl;
    const maxMove = tvl * policy.maxMovePctPerCycle;
    const amountToMove = Math.min(targetIncrease, maxMove);

    // Find largest volatile position to trim
    const volatileBalances = balances.filter(
      b => !['USDC', 'USDT', 'DAI', 'USDM'].includes(b.token)
    );

    if (volatileBalances.length > 0) {
      const largest = volatileBalances.reduce((max, b) => {
        const value = b.normalized * (prices[b.token.toLowerCase()] || 0);
        const maxValue = max.normalized * (prices[max.token.toLowerCase()] || 0);
        return value > maxValue ? b : max;
      });

      actions.push({
        type: 'swap',
        from: largest.token,
        to: 'USDC',
        amount: amountToMove,
        reason: `Increase stables ratio from ${(currentStablesRatio * 100).toFixed(1)}% to ${(policy.targetStablesRatio * 100).toFixed(1)}%`
      });
    }
  }

  return actions;
}

export function generateProposalText(
  actions: AllocationAction[],
  metrics: { tvl: number; stablesRatio: number; runway: number }
): string {
  let proposal = `# Treasury Rebalancing Proposal\n\n`;
  proposal += `## Current Status\n`;
  proposal += `- TVL: $${metrics.tvl.toLocaleString()}\n`;
  proposal += `- Stablecoins: ${(metrics.stablesRatio * 100).toFixed(1)}%\n`;
  proposal += `- Runway: ${metrics.runway.toFixed(1)} months\n\n`;
  proposal += `## Proposed Actions\n`;
  
  actions.forEach((action, i) => {
    proposal += `${i + 1}. Swap $${action.amount.toLocaleString()} of ${action.from} → ${action.to}\n`;
    proposal += `   Reason: ${action.reason}\n\n`;
  });

  return proposal;
}