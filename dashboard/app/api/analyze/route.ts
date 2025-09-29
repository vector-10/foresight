import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { message } = await req.json();
  
  const mockAnalysis = {
    text: `📊 Treasury Analysis Report\n\n💰 TVL: 10000 tokens\n🏦 Stablecoin Ratio: 30.00%\n⚠️ Concentration Risk: 50.00%\n📈 Risk Score: 6/10\n\n✅ Treasury Healthy`
  };
  
  return NextResponse.json(mockAnalysis);
}