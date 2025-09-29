// import { NextResponse } from 'next/server';
// import OpenAI from 'openai';

// const openai = new OpenAI({ 
//   apiKey: process.env.OPENAI_API_KEY 
// });


// const VERIFIED_BALANCES = {
//   DFUND: 10, 
//   DGOV: 500,   
//   tDUST: 0
// };

// export async function GET() {
//   try {
//     const { DFUND, DGOV, tDUST } = VERIFIED_BALANCES;
    
//     // Calculate metrics
//     const tvl = DFUND + DGOV + tDUST;
//     const stablecoinRatio = (DFUND / tvl) * 100;
//     const concentrationRisk = Math.max(
//       DFUND / tvl,
//       DGOV / tvl,
//       tDUST / tvl
//     ) * 100;
    
//     let riskScore = 0;
//     if (stablecoinRatio < 40 || stablecoinRatio > 60) riskScore += 3;
//     if (concentrationRisk > 30) riskScore += 4;
//     if (tvl < 100) riskScore += 3;
    
//     // Get AI analysis
//     const completion = await openai.chat.completions.create({
//       model: "gpt-3.5-turbo",
//       messages: [{
//         role: "system",
//         content: "You are a DAO treasury analyst. Analyze metrics and provide concise, actionable insights."
//       }, {
//         role: "user",
//         content: `Analyze this DAO treasury:
// - Total Value: ${tvl} tokens
// - DFUND (stablecoin): ${DFUND} tokens (${stablecoinRatio.toFixed(1)}%)
// - DGOV (governance): ${DGOV} tokens (${((DGOV/tvl)*100).toFixed(1)}%)
// - Concentration Risk: ${concentrationRisk.toFixed(1)}%
// - Risk Score: ${riskScore}/10

// Provide risk assessment and specific rebalancing recommendations.`
//       }]
//     });
    
//     const aiAnalysis = completion.choices[0].message.content;
    
//     return NextResponse.json({
//       success: true,
//       data: {
//         tvl,
//         balances: { DFUND, DGOV, tDUST },
//         stablecoinRatio: stablecoinRatio.toFixed(2),
//         concentrationRisk: concentrationRisk.toFixed(2),
//         riskScore,
//         recommendation: riskScore > 7 ? 'REBALANCE REQUIRED' : 'Treasury Healthy',
//         aiAnalysis,
//         walletAddress: process.env.MN_SHIELD_WALLET_ADDRESS
//       }
//     });
    
//   } catch (error) {
//     console.error('Treasury analysis error:', error);
//     return NextResponse.json({ 
//       success: false,
//       error: error instanceof Error ? error.message : 'Unknown error' 
//     }, { status: 500 });
//   }
// }



import { NextResponse } from 'next/server';
// import OpenAI from 'openai';

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY
// });

const VERIFIED_BALANCES = {
  DFUND: 10,
  DGOV: 500,
  tDUST: 0
};

export async function GET() {
  try {
    const { DFUND, DGOV, tDUST } = VERIFIED_BALANCES;
    
    // Calculate metrics
    const tvl = DFUND + DGOV + tDUST;
    const stablecoinRatio = (DFUND / tvl) * 100;
    const concentrationRisk = Math.max(
      DFUND / tvl,
      DGOV / tvl,
      tDUST / tvl
    ) * 100;
    
    // Risk scoring algorithm
    let riskScore = 0;
    if (stablecoinRatio < 20) riskScore += 3; // Too low stablecoin
    if (stablecoinRatio > 60) riskScore += 2; // Too high stablecoin
    if (concentrationRisk > 90) riskScore += 4; // Extreme concentration
    if (tvl < 100) riskScore += 1; // Small treasury size
    
    // Generate analysis based on actual metrics
    const aiAnalysis = generateTreasuryAnalysis({
      tvl,
      DFUND,
      DGOV,
      tDUST,
      stablecoinRatio,
      concentrationRisk,
      riskScore
    });
    
    return NextResponse.json({
      success: true,
      data: {
        tvl,
        balances: { DFUND, DGOV, tDUST },
        stablecoinRatio: stablecoinRatio.toFixed(2),
        concentrationRisk: concentrationRisk.toFixed(2),
        riskScore,
        recommendation: riskScore > 5 ? 'REBALANCE REQUIRED' : 'Treasury Healthy',
        aiAnalysis,
        walletAddress: process.env.MN_SHIELD_WALLET_ADDRESS,
        lastUpdated: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Treasury analysis error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

function generateTreasuryAnalysis(metrics: {
  tvl: number;
  DFUND: number;
  DGOV: number;
  tDUST: number;
  stablecoinRatio: number;
  concentrationRisk: number;
  riskScore: number;
}) {
  const { tvl, DFUND, DGOV, tDUST, stablecoinRatio, concentrationRisk, riskScore } = metrics;
  
  let analysis = `**Treasury Risk Assessment**\n\n`;
  
  // Concentration analysis
  if (concentrationRisk > 90) {
    analysis += `🔴 **CRITICAL**: ${concentrationRisk.toFixed(1)}% concentrated in ${DGOV > DFUND ? 'DGOV' : 'DFUND'}. Extremely vulnerable to single-asset volatility.\n\n`;
  } else if (concentrationRisk > 70) {
    analysis += `🟡 **WARNING**: ${concentrationRisk.toFixed(1)}% concentration risk detected.\n\n`;
  }
  
  // Stablecoin analysis
  if (stablecoinRatio < 10) {
    analysis += `🔴 **URGENT**: Only ${stablecoinRatio.toFixed(1)}% in stablecoins (DFUND). Treasury has minimal buffer against volatility.\n\n`;
  } else if (stablecoinRatio < 30) {
    analysis += `🟡 Low stablecoin reserves at ${stablecoinRatio.toFixed(1)}%. Consider increasing DFUND allocation.\n\n`;
  }
  
  // Recommendations
  analysis += `**Recommended Actions:**\n`;
  
  if (DGOV > tvl * 0.7) {
    analysis += `- Reduce DGOV position from ${DGOV} to ~${Math.round(tvl * 0.5)} tokens (50% target)\n`;
    analysis += `- Acquire ${Math.round(tvl * 0.3)} DFUND tokens to reach 30% stablecoin ratio\n`;
    analysis += `- Consider diversifying ${Math.round(tvl * 0.2)} into tDUST for yield generation\n`;
  }
  
  if (tDUST === 0) {
    analysis += `- Current tDUST balance is zero. Allocate 10-20% for operational expenses\n`;
  }
  
  analysis += `\n**Risk Score: ${riskScore}/10** ${riskScore > 5 ? '(Action Required)' : '(Acceptable Range)'}`;
  
  return analysis;
}