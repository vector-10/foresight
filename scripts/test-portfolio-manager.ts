import { config } from 'dotenv';
config({ path: '.env.local' });

import { rebalanceAction } from '../agents/portfolio-manager/actions/rebalance';
import { Memory } from '@ai16z/eliza';
import { MOCK_BALANCES, MOCK_PRICES } from '../lib/mock/treasury';

async function testPortfolioManager() {
  console.log('Testing Portfolio Manager...\n');
  
  const mockMetrics = {
    tvl: 875000,
    stablesRatio: 0.35, // Below threshold
    concentrationRisk: 0.43,
    runway: 17.5,
    riskScore: 0.6
  };

  const mockCallback = async (response: any): Promise<Memory[]> => {
    console.log(response.text);
    console.log('\n📄 Proposal JSON:', JSON.stringify(response.data.proposalJSON, null, 2));
    return [];
  };

  await rebalanceAction.handler(
    {} as any,
    {} as any,
    {} as any,
    {
      metrics: mockMetrics,
      balances: MOCK_BALANCES,
      prices: MOCK_PRICES
    },
    mockCallback
  );
}

testPortfolioManager();