import type { GameState } from '../model/models';
import { shuffled, type GameRandom } from './gameRandom';
export type TributeKind='GOLD'|'CARD';
export const TRIBUTE_MIN_GOLD=40;
export const tributeGold=(s:GameState)=>Math.max(TRIBUTE_MIN_GOLD,s.lastCollection?.taxIncome??0);
export const canTakeTribute=(s:GameState)=>!s.gameOver&&s.tributeTurn!==s.turn;
export const canDrawTributeCard=(s:GameState)=>s.deck.length>0||s.discard.length>0;
export function takeTribute(state:GameState,kind:TributeKind,rng:GameRandom):GameState {if(!canTakeTribute(state))return state;const paid={...state,tributeTurn:state.turn};if(kind==='GOLD')return {...paid,factions:paid.factions.map(f=>f.id===paid.playerFactionId?{...f,treasury:f.treasury+tributeGold(state)}:f)};let deck=paid.deck,discard=paid.discard;if(!deck.length&&discard.length){deck=shuffled(rng,discard);discard=[];}return deck.length?{...paid,deck:deck.slice(1),discard,hand:[...paid.hand,deck[0]]}:paid;}
