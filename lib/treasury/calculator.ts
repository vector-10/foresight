import { TokenBalance, TreasuryMetrics } from '@/types/treasury';

const STABLECOINS = ['USDC', 'USDT', 'DAI', 'USDM', 'FRAX'];

export function calculateTVL(
  balances: TokenBalance[],
  prices: Record<string, number>
): number {
  return balances.reduce((total, balance) => {
    const price = prices[balance.token.toLowerCase()] || 0;
    return total + balance.normalized * price;
  }, 0);
}

export function calculateStablesRatio(
  balances: TokenBalance[],
  prices: Record<string, number>
): number {
  const totalValue = calculateTVL(balances, prices);
  const stableValue = balances
    .filter(b => STABLECOINS.includes(b.token))
    .reduce((sum, b) => {
      const price = prices[b.token.toLowerCase()] || 1;
      return sum + b.normalized * price;
    }, 0);

  return totalValue > 0 ? stableValue / totalValue : 0;
}

export function calculateConcentrationRisk(
  balances: TokenBalance[],
  prices: Record<string, number>
): number {
  const totalValue = calculateTVL(balances, prices);
  const tokenValues = balances.map(b => {
    const price = prices[b.token.toLowerCase()] || 0;
    return b.normalized * price;
  });

  const maxValue = Math.max(...tokenValues);
  return totalValue > 0 ? maxValue / totalValue : 0;
}

export function calculateRunway(
  tvl: number,
  monthlyBurn: number,
  stablesRatio: number
): number {
  const volatilityHaircut = 1 - (1 - stablesRatio) * 0.3; // 30% haircut on volatile assets
  const adjustedTVL = tvl * volatilityHaircut;
  return monthlyBurn > 0 ? adjustedTVL / monthlyBurn : Infinity;
}

export function computeRiskScore(
  stablesRatio: number,
  concentrationRisk: number,
  runway: number,
  thresholds: { minStablesRatio: number; maxConcentration: number; minRunway: number }
): number {
  const stablesWeight = 0.4;
  const concentrationWeight = 0.3;
  const runwayWeight = 0.3;

  const stablesScore = stablesRatio < thresholds.minStablesRatio ? 
    (1 - stablesRatio / thresholds.minStablesRatio) : 0;
  
  const concentrationScore = concentrationRisk > thresholds.maxConcentration ?
    (concentrationRisk - thresholds.maxConcentration) / (1 - thresholds.maxConcentration) : 0;
  
  const runwayScore = runway < thresholds.minRunway ?
    (1 - runway / thresholds.minRunway) : 0;

  return (
    stablesScore * stablesWeight +
    concentrationScore * concentrationWeight +
    runwayScore * runwayWeight
  );
}

export function analyzeRisk(
  balances: TokenBalance[],
  prices: Record<string, number>,
  monthlyBurn: number,
  thresholds: { minStablesRatio: number; maxConcentration: number; minRunway: number }
): TreasuryMetrics {
  const tvl = calculateTVL(balances, prices);
  const stablesRatio = calculateStablesRatio(balances, prices);
  const concentrationRisk = calculateConcentrationRisk(balances, prices);
  const runway = calculateRunway(tvl, monthlyBurn, stablesRatio);
  const riskScore = computeRiskScore(stablesRatio, concentrationRisk, runway, thresholds);

  return {
    tvl,
    stablesRatio,
    concentrationRisk,
    runway,
    riskScore,
  };
}