import { config } from 'dotenv';
config({ path: '.env' });

import { analyzeRiskAction } from '../agents/risk-monitor/actions/analyzeRisk';
import { Memory } from '@ai16z/eliza';

async function testRiskMonitor() {
  console.log('Testing Risk Monitor...\n');
  console.log('RPC URL:', process.env.ETH_RPC_URL);
  
  if (!process.env.ETH_RPC_URL) {
    console.error('❌ ETH_RPC_URL not found in .env');
    process.exit(1);
  }
  
  const mockCallback = async (response: any): Promise<Memory[]> => {
    console.log(response.text);
    console.log('\nData:', JSON.stringify(response.data, null, 2));
    return [];
  };

  await analyzeRiskAction.handler(
    {} as any,
    {} as any,
    {} as any,
    {},
    mockCallback
  );
}

testRiskMonitor();