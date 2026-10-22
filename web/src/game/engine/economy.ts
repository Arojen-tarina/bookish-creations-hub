import { BUILDING_INFO } from '../model/enums';
import type { BuildingType, FactionId, Terrain, TradeGood, TreatyType } from '../model/enums';
import type { GameState, Province, ResourceCollection } from '../model/models';
const floor = Math.floor;
export function silkRoadBonus(ownedProvinces: Province[]): number {
  const hubs = ownedProvinces.filter(p => p.hasSilkRoad); if (!hubs.length) return 0;
  const hubById = new Map(hubs.map(p => [p.id, p])); const visited = new Set<string>(); let chainBonus = 0;
  for (const hub of hubs) {
    if (visited.has(hub.id)) continue;
    const queue = [hub.id]; visited.add(hub.id); let clusterSize = 0;
    while (queue.length) { const current = hubById.get(queue.shift()!); if (!current) continue; clusterSize++;
      for (const id of current.neighbors) if (hubById.has(id) && !visited.has(id)) { visited.add(id); queue.push(id); }
    }
    if (clusterSize > 1) chainBonus += Math.floor(clusterSize ** 1.45 * 1.6 + .5);
  }
  return hubs.reduce((n,p)=>n+p.baseTax,0) + hubs.filter(p=>p.tradeGood==='silk').length*2 + chainBonus;
}
const provincesWithBuilding = (s: GameState, faction: FactionId, type: BuildingType, extra: (p: Province)=>boolean = ()=>true) => Object.entries(s.buildings).filter(([id,list])=>s.provinces.find(p=>p.id===id)?.ownerId===faction && list.includes(type) && extra(s.provinces.find(p=>p.id===id)!)).length;
export function calculateResourceCollection(state: GameState, factionId: FactionId): ResourceCollection {
  const owned=state.provinces.filter(p=>p.ownerId===factionId), tax=owned.reduce((n,p)=>n+p.baseTax,0), manpowerGain=floor(owned.reduce((n,p)=>n+p.baseManpower,0)*.3), silkBonus=silkRoadBonus(owned);
  const marketBonus=provincesWithBuilding(state,factionId,'market')*3, bridgeBonus=provincesWithBuilding(state,factionId,'bridge',p=>p.hasSilkRoad)*2;
  const faction=state.factions.find(f=>f.id===factionId), capital=faction&&state.provinces.find(p=>p.id===faction.capitalId), penalty=capital&&capital.ownerId!==factionId?.5:1;
  const taxIncome=floor((tax+silkBonus+marketBonus+bridgeBonus)*penalty);
  const foodChange=-state.armies.filter(a=>a.ownerId===factionId).length+floor(owned.filter(p=>p.terrain==='farmland'||p.terrain==='grassland').length*.5)+provincesWithBuilding(state,factionId,'camp')*2;
  const horsesGain=owned.filter(p=>p.terrain==='steppe'||p.tradeGood==='horses').length+provincesWithBuilding(state,factionId,'stable');
  let artisansGain=floor(owned.filter(p=>p.terrain==='farmland'||p.terrain==='hills').length*.5)+provincesWithBuilding(state,factionId,'workshop'); if(owned.length>=3) artisansGain=Math.max(1,artisansGain);
  const silkHubs=owned.filter(p=>p.hasSilkRoad).length, capitalHeld=capital?.ownerId===factionId?1:0;
  const alliances=state.relations.filter(r=>(r.factionA===factionId||r.factionB===factionId)&&r.treaties.some(t=>t.type==='alliance')).length;
  const wonders=provincesWithBuilding(state,factionId,'wonder');
  return { taxIncome:taxIncome+(state.turn<=4?4:0), manpowerGain, marketBonus, silkRoadBonus:silkBonus, foodChange, artisansGain, horsesGain, influenceGain:silkHubs+capitalHeld*2+alliances*2+wonders*2, prestigeGain:wonders*3 };
}
export function applyResourceCollection(state: GameState, factionId: FactionId, c: ResourceCollection): GameState {
 return {...state, factions:state.factions.map(f=>f.id===factionId?{...f,treasury:f.treasury+c.taxIncome,manpower:f.manpower+c.manpowerGain,horses:f.horses+c.horsesGain}:f), food:Math.max(0,state.food+c.foodChange), artisans:state.artisans+c.artisansGain, influence:state.influence+c.influenceGain, prestige:state.prestige+c.prestigeGain, resourcesCollected:true,lastCollection:c};
}
