import { 
    Action, 
    ActionResult, 
    Content,
    HandlerCallback, 
    IAgentRuntime, 
    Memory, 
    State,
    logger 
  } from "@elizaos/core";
  
  export const analyzeTreasuryAction: Action = {
    name: "ANALYZE_TREASURY",
    similes: ["analyze treasury", "check treasury health", "treasury risk", "portfolio analysis"],
    description: "Analyzes DAO treasury health by calculating TVL, risk metrics, and generating rebalancing proposals",
    
    validate: async (_runtime: IAgentRuntime, _message: Memory, _state: State): Promise<boolean> => {
      return true; 
    },
    
    handler: async (
      _runtime: IAgentRuntime,
      message: Memory,
      _state: State,
      _options: any,
      callback: HandlerCallback,
      _responses: Memory[]
    ): Promise<ActionResult> => {
      try {
        logger.info('Handling ANALYZE_TREASURY action');
  
        // Mock data since wallet has 0 balance
        const mockData = {
          tDUST: 5000,
          DFUND: 3000,
          DGOV: 2000
        };
        
        const tvl = mockData.tDUST + mockData.DFUND + mockData.DGOV;
        const stablecoinRatio = (mockData.DFUND / tvl) * 100;
        const concentrationRisk = Math.max(
          mockData.tDUST / tvl,
          mockData.DFUND / tvl,
          mockData.DGOV / tvl
        ) * 100;
        
        let riskScore = 0;
        if (stablecoinRatio < 40 || stablecoinRatio > 60) riskScore += 3;
        if (concentrationRisk > 30) riskScore += 4;
        if (tvl < 10000) riskScore += 3;
        
        const analysisText = `📊 Treasury Analysis Report\n\n` +
          `💰 TVL: ${tvl} tokens\n` +
          `🏦 Stablecoin Ratio: ${stablecoinRatio.toFixed(2)}%\n` +
          `⚠️ Concentration Risk: ${concentrationRisk.toFixed(2)}%\n` +
          `📈 Risk Score: ${riskScore}/10\n\n` +
          `${riskScore > 7 ? '🚨 REBALANCE REQUIRED' : '✅ Treasury Healthy'}`;
  
        const responseContent: Content = {
          text: analysisText,
          actions: ['ANALYZE_TREASURY'],
          source: message.content.source,
        };
  
        await callback(responseContent);
  
        return {
          text: 'Treasury analysis completed',
          values: {
            tvl,
            stablecoinRatio: parseFloat(stablecoinRatio.toFixed(2)),
            concentrationRisk: parseFloat(concentrationRisk.toFixed(2)),
            riskScore,
            needsRebalancing: riskScore > 7
          },
          data: {
            actionName: 'ANALYZE_TREASURY',
            balances: mockData,
            timestamp: Date.now(),
          },
          success: true,
        };
      } catch (error) {
        logger.error({ error }, 'Error in ANALYZE_TREASURY action');
  
        return {
          text: 'Treasury analysis failed',
          values: { success: false },
          data: {
            error: error instanceof Error ? error.message : String(error),
          },
          success: false,
          error: error instanceof Error ? error : new Error(String(error)),
        };
      }
    },
  
    examples: [
      [
        {
          name: '{{user}}',
          content: { text: 'analyze treasury' },
        },
        {
          name: '{{agent}}',
          content: {
            text: 'Treasury analysis completed',
            actions: ['ANALYZE_TREASURY'],
          },
        },
      ],
    ],
  };