import type { GameState } from '../model/models';
export const canTakeSecondChance=(s:GameState):boolean=>s.gameOver&&s.winnerId!==s.playerFactionId&&!s.secondChanceUsed;
export const takeSecondChance=(turnStart:GameState):GameState=>({...turnStart,secondChanceUsed:true});
