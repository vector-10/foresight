import { DEGAAdapter } from '../communication/dega-adapter';
import { AgentMessage, RiskTriggerPayload, RebalanceResponsePayload } from '../communication/types';
import { analyzeRisk } from '../treasury/calculator';
import { suggestRebalancing, generateProposalText } from '../treasury/allocator';

export interface OrchestratorConfig {
  riskMonitor: {
    agentId: string;
    publicKey: string;
    privateKey: string;
  };
  portfolioManager: {
    agentId: string;
    publicKey: string;
    privateKey: string;
  };
  supabase: {
    url: string;
    anonKey: string;
  };
}

export class TreasuryOrchestrator {
  private riskMonitorAdapter: DEGAAdapter;
  private portfolioManagerAdapter: DEGAAdapter;
  private rebalancePromise: Promise<RebalanceResponsePayload> | null = null;
  private rebalanceResolver: ((value: RebalanceResponsePayload) => void) | null = null;

  constructor(config: OrchestratorConfig) {
    this.riskMonitorAdapter = new DEGAAdapter({
      agentId: config.riskMonitor.agentId,
      publicKey: config.riskMonitor.publicKey,
      privateKey: config.riskMonitor.privateKey,
      supabaseUrl: config.supabase.url,
      supabaseAnonKey: config.supabase.anonKey,
    });

    this.portfolioManagerAdapter = new DEGAAdapter({
      agentId: config.portfolioManager.agentId,
      publicKey: config.portfolioManager.publicKey,
      privateKey: config.portfolioManager.privateKey,
      supabaseUrl: config.supabase.url,
      supabaseAnonKey: config.supabase.anonKey,
    });
  }

  async initialize(): Promise<void> {
    console.log('[Orchestrator] Initializing agents...');
    
    await this.riskMonitorAdapter.initialize();
    await this.portfolioManagerAdapter.initialize();
    
    // Subscribe Portfolio Manager to handle risk triggers
    await this.portfolioManagerAdapter.subscribe(async (message) => {
      if (message.type === 'trigger' && message.from === 'risk-monitor') {
        console.log('[Orchestrator] Portfolio Manager received risk trigger');
        await this.handleRiskTrigger(message);
      }
    });

    // Subscribe Risk Monitor to handle rebalance responses
    await this.riskMonitorAdapter.subscribe(async (message) => {
      if (message.type === 'response' && message.from === 'portfolio-manager') {
        console.log('[Orchestrator] Risk Monitor received rebalance response');
        if (this.rebalanceResolver) {
          this.rebalanceResolver(message.payload);
          this.rebalanceResolver = null;
          this.rebalancePromise = null;
        }
      }
    });

    console.log('[Orchestrator] Agents initialized and listening');
  }

  async runTreasuryAnalysis(
    balances: any[],
    prices: Record<string, number>,
    config: any
  ): Promise<{
    metrics: any;
    proposal: RebalanceResponsePayload | null;
  }> {
    console.log('[Orchestrator] Running treasury analysis...');

    // Step 1: Risk Monitor analyzes treasury
    const analysis = analyzeRisk(balances, prices, config);
    
    console.log('[Orchestrator] Analysis complete:', {
      tvl: analysis.tvl,
      stablesRatio: analysis.stablesRatio,
      breached: analysis.breached,
    });

    // Step 2: If thresholds breached, trigger Portfolio Manager
    if (analysis.breached) {
      console.log('[Orchestrator] Thresholds breached! Triggering Portfolio Manager...');
      
      const triggerPayload: RiskTriggerPayload = {
        breached: true,
        metrics: {
          tvl: analysis.tvl,
          stablesRatio: analysis.stablesRatio,
          concentrationRisk: analysis.concentrationRisk,
          runway: analysis.runway,
          riskScore: analysis.riskScore,
        },
        balances,
        prices,
        config,
      };

      // Create promise to wait for response
      this.rebalancePromise = new Promise((resolve) => {
        this.rebalanceResolver = resolve;
      });

      // Send trigger message
      const triggerMessage: AgentMessage = {
        id: `trigger-${Date.now()}`,
        from: 'risk-monitor',
        to: 'portfolio-manager',
        type: 'trigger',
        payload: triggerPayload,
        timestamp: Date.now(),
      };

      await this.riskMonitorAdapter.send(triggerMessage);

      // Wait for Portfolio Manager response (with timeout)
      const response = await Promise.race([
        this.rebalancePromise,
        new Promise<RebalanceResponsePayload>((_, reject) => 
          setTimeout(() => reject(new Error('Rebalance timeout')), 30000)
        ),
      ]);

      return {
        metrics: analysis,
        proposal: response,
      };
    }

    return {
      metrics: analysis,
      proposal: null,
    };
  }

  private async handleRiskTrigger(message: AgentMessage): Promise<void> {
    const payload: RiskTriggerPayload = message.payload;
    
    console.log('[Portfolio Manager] Processing risk trigger...');
    
    // Generate rebalancing recommendation
    const actions = suggestRebalancing(
      payload.balances,
      payload.prices,
      payload.config,
      payload.metrics
    );

    const proposal = generateProposalText(actions, payload.balances, payload.prices);

    const response: RebalanceResponsePayload = {
      actions,
      proposal,
      summary: {
        currentStablesRatio: payload.metrics.stablesRatio,
        targetStablesRatio: payload.config.targetStablesRatio,
        totalMovedUSD: actions.reduce((sum, a) => sum + a.amountUSD, 0),
      },
    };

    // Send response back to Risk Monitor
    const responseMessage: AgentMessage = {
      id: `response-${Date.now()}`,
      from: 'portfolio-manager',
      to: 'risk-monitor',
      type: 'response',
      payload: response,
      timestamp: Date.now(),
    };

    await this.portfolioManagerAdapter.send(responseMessage);
    console.log('[Portfolio Manager] Rebalance response sent');
  }

  async disconnect(): Promise<void> {
    await this.riskMonitorAdapter.disconnect();
    await this.portfolioManagerAdapter.disconnect();
    console.log('[Orchestrator] All agents disconnected');
  }
}