
export interface AgentMessage {
    id: string;
    from: string;
    to: string;
    type: 'trigger' | 'response' | 'error';
    payload: any;
    timestamp: number;
  }
  
  export interface RiskTriggerPayload {
    breached: boolean;
    metrics: {
      tvl: number;
      stablesRatio: number;
      concentrationRisk: number;
      runway: number;
      riskScore: number;
    };
    balances: Array<{
      token: string;
      symbol: string;
      balance: string;
      decimals: number;
      valueUSD: number;
    }>;
    prices: Record<string, number>;
    config: {
      targetStablesRatio: number;
      minStablesRatio: number;
      maxConcentration: number;
      minRunway: number;
    };
  }
  
  export interface RebalanceResponsePayload {
    actions: Array<{
      type: 'swap';
      fromToken: string;
      toToken: string;
      amount: string;
      amountUSD: number;
    }>;
    proposal: string; 
    summary: {
      currentStablesRatio: number;
      targetStablesRatio: number;
      totalMovedUSD: number;
    };
  }
  
  export interface CommunicationAdapter {
    initialize(): Promise<void>;
    send(message: AgentMessage): Promise<void>;
    subscribe(handler: (message: AgentMessage) => void): Promise<void>;
    disconnect(): Promise<void>;
  }