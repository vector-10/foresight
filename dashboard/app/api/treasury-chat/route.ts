// import { NextResponse } from 'next/server';
// import OpenAI from 'openai';

// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// export async function POST(req: Request) {
//   try {
//     const { message, context } = await req.json();
    
//     const completion = await openai.chat.completions.create({
//       model: "gpt-3.5-turbo",
//       messages: [{
//         role: "system",
//         content: `You are a DAO treasury analyst. Current treasury state:
// - TVL: ${context.tvl} tokens
// - DFUND: ${context.balances.DFUND} (${context.stablecoinRatio}%)
// - DGOV: ${context.balances.DGOV}
// - Risk Score: ${context.riskScore}/10

// Provide concise, actionable advice.`
//       }, {
//         role: "user",
//         content: message
//       }]
//     });
    
//     return NextResponse.json({ 
//       response: completion.choices[0].message.content 
//     });
//   } catch (error) {
//     return NextResponse.json({ 
//       response: 'Error processing request' 
//     }, { status: 500 });
//   }
// }





import { NextResponse } from 'next/server';
// import OpenAI from 'openai';
// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Simulated responses based on common treasury questions
const SIMULATED_RESPONSES: Record<string, string> = {
  risk: `Based on your current metrics, the main risks are:

🔴 **Extreme DGOV Concentration (98.1%)**
- Single token represents nearly entire treasury
- Vulnerable to governance token volatility
- Limits operational flexibility

🟡 **Zero Stablecoin Buffer**
- No immediate liquidity for expenses
- Can't weather market downturns
- Unable to capitalize on opportunities

**Immediate Action**: Rebalance 200 DGOV → 150 DFUND + 50 tDUST within 7 days.`,

  rebalance: `**Recommended Rebalancing Strategy:**

**Phase 1 (Week 1)**: Reduce concentration risk
- Sell 200 DGOV tokens
- Buy 150 DFUND (stablecoin reserve)
- Acquire 50 tDUST (operational buffer)

**Target Allocation:**
- DFUND: 30-40% (stability)
- DGOV: 40-50% (governance rights)
- tDUST: 10-20% (operations)

**New Risk Score**: Would drop from 8/10 to 4/10

Execute during low-volatility periods to minimize slippage.`,

  dfund: `**DFUND Analysis:**

Current: 10 tokens (1.96% of treasury)
Target: 150-200 tokens (30-40%)

**Why Increase DFUND?**
- Acts as volatility buffer
- Provides immediate liquidity
- Enables strategic opportunities
- Industry standard: 30-50% in stablecoins

Your treasury lacks downside protection. With only 10 DFUND, you can't cover unexpected expenses or weather DGOV price drops.`,

  dgov: `**DGOV Analysis:**

Current: 500 tokens (98.04% of treasury)
Risk: EXTREME concentration

**Concerns:**
- Over-reliance on single volatile asset
- Governance token can swing 20-50%
- Limits diversification options
- Creates existential risk

**Recommendation**: Maintain 200-250 DGOV (enough for governance participation) and diversify the rest. You don't need 500 DGOV to have influence.`,

  dust: `**tDUST Analysis:**

Current: 0 tokens
Recommendation: 50-100 tokens (10-20%)

**Why Add tDUST?**
- Native Midnight blockchain token
- Required for transaction fees
- Can stake for yield
- Operational necessity

Zero tDUST means you're dependent on others for gas fees. This is a critical oversight for autonomous DAO operations.`,

  health: `**Treasury Health Report:**

📊 **Overall Score: 2/10** (Critical)

**Strengths:**
✅ Sufficient TVL (510 tokens)
✅ Has governance power via DGOV

**Critical Issues:**
❌ 98% in single volatile asset
❌ No stablecoin reserves
❌ No operational token (tDUST)
❌ Cannot handle volatility
❌ Limited operational autonomy

**Status**: URGENT REBALANCING REQUIRED

This treasury would fail basic risk management audits. Immediate action needed.`,

  strategy: `**90-Day Treasury Strategy:**

**Month 1: Stabilization**
- Rebalance to 40% DFUND / 40% DGOV / 20% tDUST
- Set up automated risk monitoring
- Establish emergency reserve (100 DFUND minimum)

**Month 2: Optimization**
- Evaluate DGOV staking opportunities
- Test tDUST yield strategies
- Review quarterly burn/mint schedules

**Month 3: Growth**
- Assess new token additions
- Implement dynamic rebalancing rules
- Set up treasury dashboard for community

**Goal**: Drop risk score from 8/10 to 3/10 while maintaining governance power.`,

  default: `I can help analyze your treasury from multiple angles:

📊 **Risk Assessment** - Current vulnerabilities
🔄 **Rebalancing** - Optimal allocation strategies  
💰 **Token Analysis** - Deep dives on DFUND, DGOV, tDUST
🏥 **Health Check** - Overall treasury fitness
📈 **Strategy** - Long-term management plan

Your current setup has **extreme concentration risk** (98% DGOV). Ask me about any specific topic!`
};

export async function POST(req: Request) {
  try {
    const { message, context } = await req.json();
    
    // Simulate realistic API delay (500-1500ms)
    const delay = 800 + Math.random() * 700;
    await new Promise(resolve => setTimeout(resolve, delay));
    
    // Match user query to response
    const lowerMessage = message.toLowerCase();
    let response = SIMULATED_RESPONSES.default;
    
    if (lowerMessage.includes('risk')) {
      response = SIMULATED_RESPONSES.risk;
    } else if (lowerMessage.includes('rebalanc')) {
      response = SIMULATED_RESPONSES.rebalance;
    } else if (lowerMessage.includes('dfund')) {
      response = SIMULATED_RESPONSES.dfund;
    } else if (lowerMessage.includes('dgov')) {
      response = SIMULATED_RESPONSES.dgov;
    } else if (lowerMessage.includes('dust') || lowerMessage.includes('tdust')) {
      response = SIMULATED_RESPONSES.dust;
    } else if (lowerMessage.includes('health') || lowerMessage.includes('how')) {
      response = SIMULATED_RESPONSES.health;
    } else if (lowerMessage.includes('strategy') || lowerMessage.includes('plan')) {
      response = SIMULATED_RESPONSES.strategy;
    }
    
    return NextResponse.json({ response });
    
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json({ 
      response: 'Error processing request. Please try again.' 
    }, { status: 500 });
  }
}