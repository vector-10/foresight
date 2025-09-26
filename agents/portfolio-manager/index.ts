import { portfolioManagerCharacter } from './character';
import { rebalanceAction } from './actions/rebalance';

export const portfolioManager = {
  character: portfolioManagerCharacter,
  actions: [rebalanceAction]
};