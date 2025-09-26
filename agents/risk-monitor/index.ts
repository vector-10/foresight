import { riskMonitorCharacter } from './character';
import { analyzeRiskAction } from './actions/analyzeRisk';

export const riskMonitor = {
  character: riskMonitorCharacter,
  actions: [analyzeRiskAction]
};