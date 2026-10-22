import type { FactionId, TreatyType } from '../model/enums';
import type { GameState, Treaty } from '../model/models';
import type { GameRandom } from './gameRandom';
export const isActiveWar=(t:Treaty,turn:number)=>t.type==='war_surprise'||(t.type==='war_formal'&&t.startTurn<=turn);
export interface TreatyResult {state:GameState;accepted:boolean}
export function proposeTreaty(state:GameState,target:FactionId,treatyType:TreatyType,rng:GameRandom):TreatyResult {
 const player=state.playerFactionId, rel=state.relations.find(r=>(r.factionA===player&&r.factionB===target)||(r.factionB===player&&r.factionA===target)); if(!rel)return {state,accepted:false};
 const war=treatyType==='war_surprise'||treatyType==='war_formal'; if(!war&&rel.lastProposalTurn===state.turn)return {state,accepted:false};
 const accepts=war||rng.nextDouble()<((rel.relation+100)/200)*(rel.trust/100)+.2;
 if(!accepts)return {state:{...state,relations:state.relations.map(r=>r===rel?{...r,lastProposalTurn:state.turn,relation:Math.max(-100,r.relation-3),trust:Math.max(0,r.trust-2)}:r)},accepted:false};
 const relations=state.relations.map(r=>{const involves=r.factionA===player||r.factionB===player, withTarget=(r.factionA===target||r.factionB===target);
 if(treatyType==='war_surprise'&&involves)return {...r,treaties:[...r.treaties.filter(t=>!['non_aggression','peace','truce','alliance'].includes(t.type)),{type:treatyType,startTurn:state.turn,duration:-1}],relation:-100,trust:0,threat:Math.min(100,r.threat+30)};
 if(involves&&withTarget)return {...r,treaties:[...r.treaties,{type:treatyType,startTurn:treatyType==='war_formal'?state.turn+1:state.turn,duration:-1}],relation:!war?Math.min(100,r.relation+10):treatyType==='war_surprise'?-100:Math.max(-100,r.relation-40),trust:war?0:Math.min(100,r.trust+5),threat:war?Math.min(100,r.threat+30):r.threat,lastProposalTurn:war?r.lastProposalTurn:state.turn}; return r;});
 return {state:{...state,relations},accepted:true};
}
export const declareWar=(state:GameState,target:FactionId,surprise:boolean,rng:GameRandom)=>proposeTreaty(state,target,surprise?'war_surprise':'war_formal',rng).state;
export function breakTreaty(state:GameState,target:FactionId,type:TreatyType):GameState {const rel=state.relations.find(r=>(r.factionA===state.playerFactionId&&r.factionB===target)||(r.factionB===state.playerFactionId&&r.factionA===target));return rel?{...state,relations:state.relations.map(r=>r===rel?{...r,treaties:r.treaties.filter(t=>t.type!==type),relation:r.relation-30,trust:Math.max(0,r.trust-20)}:r)}:state;}
export function activatePendingWars(state:GameState):GameState{return {...state,relations:state.relations.map(r=>r.treaties.some(t=>t.type==='war_formal'&&t.startTurn<=state.turn)?{...r,relation:-90,trust:0,threat:Math.min(100,r.threat+30)}:r)};}
