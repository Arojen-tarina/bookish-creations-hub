import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import type { FactionId } from '../../src/game/model/enums';
import { Mulberry32 } from '../../src/game/engine/gameRandom';
import { startGame } from '../../src/game/engine/setup';
import type { GameState } from '../../src/game/model/models';
import { buildStructure, canMoveTo, mergeArmies, moveArmy, playCard, recruitArmy, repairFort } from '../../src/game/engine/playerActions';
import { breakTreaty, declareWar, proposeTreaty } from '../../src/game/engine/diplomacy';
import { endTurn } from '../../src/game/engine/endTurn';
const snapshot=(s:GameState):unknown[]=>[
 s.turn,s.year,s.food,s.artisans,s.influence,s.prestige,s.treasuryStreak,
 Object.entries(s.aiTreasuryStreaks).sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>[k,v]),
 s.gameOver,s.winnerId,s.winCondition,s.chiefLost,s.attackBonus,s.defenseBonus,s.movementBonus,
 s.factions.map(f=>[f.id,f.treasury,f.manpower,f.horses]),
 s.provinces.map(p=>[p.id,p.ownerId,p.fortLevel,p.fortDurability,p.garrison,p.unrest,p.siegeProgress]),
 s.armies.map(a=>[a.id,a.ownerId,a.provinceId,a.cavalry,a.infantry,a.movementLeft]),
 s.hand.map(c=>c.id),s.deck.map(c=>c.id),s.discard.map(c=>c.id),s.playedTechCards.map(c=>c.id),
 s.activeEffects.map(e=>[e.cardId,e.type,e.value,e.remainingTurns]),
 Object.keys(s.buildings).sort().map(k=>[k,s.buildings[k]]),
 s.relations.map(r=>[r.factionA,r.factionB,r.relation,r.trust,r.threat,r.lastProposalTurn,r.treaties.map(t=>[t.type,t.startTurn,t.duration])]),
 s.turnLog.length,s.lastCollection?[s.lastCollection.taxIncome,s.lastCollection.manpowerGain,s.lastCollection.marketBonus,s.lastCollection.silkRoadBonus,s.lastCollection.foodChange,s.lastCollection.artisansGain,s.lastCollection.horsesGain,s.lastCollection.influenceGain,s.lastCollection.prestigeGain]:null,s.resourcesCollected,
];
const digest=(s:GameState)=>createHash('sha256').update(JSON.stringify(snapshot(s))).digest('hex');
function replay(faction:FactionId,difficulty:GameState['difficulty'],rng:Mulberry32,maxTurns:number):{label:string;sha:string}[]{const steps:{label:string;sha:string}[]=[];let s=startGame(faction,difficulty,rng);steps.push({label:'start',sha:digest(s)});const buildOrder=['market','camp','workshop','stable','bridge','fortress'] as const;for(let i=0;i<maxTurns;i++){if(s.gameOver)break;const player=s.playerFactionId,turn=s.turn;if(s.hand.length)s=playCard(s,s.hand[0].id);const capital=s.factions.find(f=>f.id===player)!.capitalId;for(const b of buildOrder)s=buildStructure(s,capital,b);if(turn>=10)s=buildStructure(s,capital,'wonder');s=recruitArmy(s,capital,'infantry');if(turn%3===0)s=recruitArmy(s,capital,'cavalry');const groups=new Map<string,string[]>();for(const a of s.armies.filter(a=>a.ownerId===player))groups.set(a.provinceId,[...(groups.get(a.provinceId)??[]),a.id]);for(const ids of groups.values())for(let k=1;k<ids.length;k++)s=mergeArmies(s,ids[k],ids[0]);for(const id of s.armies.filter(a=>a.ownerId===player).map(a=>a.id)){const army=s.armies.find(a=>a.id===id);if(!army)continue;const p=s.provinces.find(p=>p.id===army.provinceId)!;for(const n of p.neighbors)if(s.provinces.find(p=>p.id===n)!.ownerId!==player&&canMoveTo(s,id,n)){s=moveArmy(s,id,n,rng).state;break;}}const rivals=s.factions.filter(f=>f.id!==player).map(f=>f.id);if(turn===3&&rivals[0])s=proposeTreaty(s,rivals[0],'trade_agreement',rng).state;if(turn===5&&rivals[1])s=proposeTreaty(s,rivals[1],'alliance',rng).state;if(turn===8&&rivals[2])s=proposeTreaty(s,rivals[2],'non_aggression',rng).state;if(turn===12&&rivals[2])s=declareWar(s,rivals[2],false,rng);if(turn===16&&rivals[0])s=breakTreaty(s,rivals[0],'trade_agreement');if(turn===20&&rivals[1])s=declareWar(s,rivals[1],true,rng);for(const p of s.provinces)if(p.ownerId===player&&p.fortLevel>0&&(p.fortDurability??100)<100)s=repairFort(s,p.id,false);steps.push({label:`t${turn}-actions`,sha:digest(s)});s=endTurn(s,rng);steps.push({label:`t${turn}-end`,sha:digest(s)});}return steps;}
describe('engine parity fixtures',()=>{const files=readdirSync('test/parity').filter(f=>f.endsWith('.json'));it.each(files)('replays scripted golden states for %s',file=>{const golden=JSON.parse(readFileSync(`test/parity/${file}`,'utf8')) as {faction:FactionId;seed:number;difficulty:GameState['difficulty'];maxTurns:number;steps:{label:string;sha:string}[]};const actual=replay(golden.faction,golden.difficulty,new Mulberry32(golden.seed),golden.maxTurns);if(process.env.UPDATE_ENGINE_PARITY==='1'){writeFileSync(`test/parity/${file}`,JSON.stringify({...golden,steps:actual},null,1));return;}expect(actual).toEqual(golden.steps);});});
