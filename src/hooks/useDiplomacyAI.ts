/**
 * useDiplomacyAI.ts — Tekoälyn diplomatiajärjestelmä
 *
 * Laskee tekoälyfaktioiden diplomaattiset päätökset:
 * sopimuspyyntöjen arviointi, uhka-analyysit, rajakitka,
 * persoonallisuuspohjaiset strategiat (aggressiivinen, puolustava, kaupallinen).
 */
// AI Diplomacy System - Handles AI faction diplomatic decisions
import { useCallback } from 'react';
import { 
  Faction, 
  DiplomaticRelation, 
  TreatyType, 
  Treaty, 
  Province, 
  FactionId,
  FactionPersonality 
} from '@/types/province';

interface DiplomacyDecision {
  type: 'propose_treaty' | 'break_treaty' | 'improve_relations' | 'threaten' | 'none';
  targetFactionId: FactionId;
  treatyType?: TreatyType;
  reason: string;
}

interface AIState {
  isAtWar: boolean;
  isWinning: boolean;
  isLosing: boolean;
  threatLevel: number;
  economicPressure: number;
}

// Calculate border friction between two factions
const calculateBorderFriction = (
  factionId: FactionId,
  targetFactionId: FactionId,
  provinces: Province[]
): number => {
  let friction = 0;
  
  provinces.forEach(province => {
    if (province.ownerId === factionId) {
      province.neighbors.forEach(neighborId => {
        const neighbor = provinces.find(p => p.id === neighborId);
        if (neighbor?.ownerId === targetFactionId) {
          friction += 5; // Each border province adds friction
          
          // Higher friction for high-value provinces
          if (province.baseTax > 5 || neighbor.baseTax > 5) {
            friction += 3;
          }
        }
      });
    }
  });
  
  return Math.min(friction, 50);
};

// Calculate military strength ratio
const calculateMilitaryStrength = (
  factionId: FactionId,
  factions: Faction[],
  provinces: Province[]
): number => {
  const faction = factions.find(f => f.id === factionId);
  if (!faction) return 0;
  
  const ownedProvinces = provinces.filter(p => p.ownerId === factionId);
  const totalManpower = ownedProvinces.reduce((sum, p) => sum + p.baseManpower, 0);
  const totalForts = ownedProvinces.reduce((sum, p) => sum + p.fortLevel, 0);
  
  return totalManpower + totalForts * 5 + faction.treasury / 10;
};

// Get existing treaty between factions
const getExistingTreaty = (
  relation: DiplomaticRelation | undefined,
  treatyType: TreatyType
): Treaty | undefined => {
  return relation?.treaties.find(t => t.type === treatyType);
};

// Check if treaty is valid to propose
const canProposeTreaty = (
  relation: DiplomaticRelation | undefined,
  treatyType: TreatyType,
  proposerStrength: number,
  targetStrength: number
): { canPropose: boolean; reason: string } => {
  if (!relation) {
    return { canPropose: false, reason: 'Ei diplomaattista suhdetta' };
  }
  
  // Check if already has this treaty
  if (getExistingTreaty(relation, treatyType)) {
    return { canPropose: false, reason: 'Sopimus jo voimassa' };
  }
  
  // Minimum relation requirements
  const minRelation: Record<TreatyType, number> = {
    non_aggression: -20,
    trade_agreement: 0,
    alliance: 30,
    tributary: -50, // Can force this
    truce: -100, // Always possible
    peace: -100,
    war_formal: -100,
    war_surprise: -100,
  };
  
  if (relation.relation < minRelation[treatyType]) {
    return { 
      canPropose: false, 
      reason: `Suhteet liian huonot (vaaditaan ${minRelation[treatyType]})` 
    };
  }
  
  // Trust requirements
  if (treatyType === 'alliance' && relation.trust < 20) {
    return { canPropose: false, reason: 'Luottamus liian matala' };
  }
  
  // Tributary requires significant power advantage
  if (treatyType === 'tributary' && proposerStrength < targetStrength * 2) {
    return { canPropose: false, reason: 'Ei tarpeeksi sotilaallista ylivoimaa' };
  }
  
  return { canPropose: true, reason: '' };
};

// AI decision making based on personality
const makeAIDecision = (
  faction: Faction,
  targetFaction: Faction,
  relation: DiplomaticRelation | undefined,
  aiState: AIState,
  borderFriction: number,
  myStrength: number,
  theirStrength: number
): DiplomacyDecision => {
  const personality = faction.personality || 'balanced';
  
  // If losing a war, try to make peace
  if (aiState.isAtWar && aiState.isLosing) {
    return {
      type: 'propose_treaty',
      targetFactionId: targetFaction.id,
      treatyType: 'truce',
      reason: 'Häviämässä sotaa, ehdotan rauhaa',
    };
  }
  
  // High border friction increases aggression
  const effectiveThreat = (relation?.threat || 0) + borderFriction / 2;
  
  // Personality-based decisions
  switch (personality) {
    case 'aggressive':
      // Aggressive factions prefer to threaten or break treaties
      if (myStrength > theirStrength * 1.3 && relation?.relation < 0) {
        // Break non-aggression if strong enough
        if (getExistingTreaty(relation, 'non_aggression')) {
          return {
            type: 'break_treaty',
            targetFactionId: targetFaction.id,
            treatyType: 'non_aggression',
            reason: 'Olemme vahvempia, aikaa laajentua',
          };
        }
        
        // Demand tribute
        if (canProposeTreaty(relation, 'tributary', myStrength, theirStrength).canPropose) {
          return {
            type: 'propose_treaty',
            targetFactionId: targetFaction.id,
            treatyType: 'tributary',
            reason: 'Vaadin veronmaksua heikommalta',
          };
        }
      }
      break;
      
    case 'trader':
      // Traders prefer trade agreements and avoid conflict
      if (!getExistingTreaty(relation, 'trade_agreement') && (relation?.relation || 0) >= 0) {
        return {
          type: 'propose_treaty',
          targetFactionId: targetFaction.id,
          treatyType: 'trade_agreement',
          reason: 'Kauppa hyödyttää molempia',
        };
      }
      
      // High friction? Propose NAP
      if (borderFriction > 20 && !getExistingTreaty(relation, 'non_aggression')) {
        return {
          type: 'propose_treaty',
          targetFactionId: targetFaction.id,
          treatyType: 'non_aggression',
          reason: 'Rajarauha edistää kauppaa',
        };
      }
      break;
      
    case 'cautious':
      // Cautious factions seek alliances when threatened
      if (effectiveThreat > 30) {
        if (!getExistingTreaty(relation, 'alliance') && 
            canProposeTreaty(relation, 'alliance', myStrength, theirStrength).canPropose) {
          return {
            type: 'propose_treaty',
            targetFactionId: targetFaction.id,
            treatyType: 'alliance',
            reason: 'Yhteinen puolustus uhkaa vastaan',
          };
        }
        
        // At least NAP
        if (!getExistingTreaty(relation, 'non_aggression') &&
            canProposeTreaty(relation, 'non_aggression', myStrength, theirStrength).canPropose) {
          return {
            type: 'propose_treaty',
            targetFactionId: targetFaction.id,
            treatyType: 'non_aggression',
            reason: 'Turvallisuus ensin',
          };
        }
      }
      break;
      
    case 'balanced':
    default:
      // Balanced approach
      // If relations are good and no treaties, propose something
      if ((relation?.relation || 0) > 20 && (relation?.trust || 0) > 10) {
        if (!getExistingTreaty(relation, 'trade_agreement')) {
          return {
            type: 'propose_treaty',
            targetFactionId: targetFaction.id,
            treatyType: 'trade_agreement',
            reason: 'Hyvät suhteet mahdollistavat kaupan',
          };
        }
        
        if (!getExistingTreaty(relation, 'non_aggression')) {
          return {
            type: 'propose_treaty',
            targetFactionId: targetFaction.id,
            treatyType: 'non_aggression',
            reason: 'Vahvistetaan ystävyyttä',
          };
        }
      }
      
      // If threatened, seek protection
      if (effectiveThreat > 40 && myStrength < theirStrength * 0.8) {
        return {
          type: 'improve_relations',
          targetFactionId: targetFaction.id,
          reason: 'Pyrittävä parantamaan suhteita',
        };
      }
      break;
  }
  
  return {
    type: 'none',
    targetFactionId: targetFaction.id,
    reason: 'Ei toimenpiteitä tällä hetkellä',
  };
};

export const useDiplomacyAI = () => {
  // Calculate AI decisions for a faction
  const calculateAIDiplomacy = useCallback((
    aiFaction: Faction,
    allFactions: Faction[],
    relations: DiplomaticRelation[],
    provinces: Province[],
    currentTurn: number
  ): DiplomacyDecision[] => {
    const decisions: DiplomacyDecision[] = [];
    
    // Skip player faction
    if (aiFaction.isPlayer) return decisions;
    
    // Calculate AI state
    const myStrength = calculateMilitaryStrength(aiFaction.id, allFactions, provinces);
    const totalEnemyStrength = allFactions
      .filter(f => f.id !== aiFaction.id)
      .reduce((sum, f) => {
        const rel = relations.find(
          r => (r.factionA === aiFaction.id && r.factionB === f.id) ||
               (r.factionB === aiFaction.id && r.factionA === f.id)
        );
        // Only count hostile factions
        if ((rel?.relation || 0) < -20) {
          return sum + calculateMilitaryStrength(f.id, allFactions, provinces);
        }
        return sum;
      }, 0);
    
    const aiState: AIState = {
      isAtWar: false, // TODO: implement war detection
      isWinning: myStrength > totalEnemyStrength * 1.2,
      isLosing: myStrength < totalEnemyStrength * 0.6,
      threatLevel: Math.min(100, (totalEnemyStrength / Math.max(myStrength, 1)) * 50),
      economicPressure: aiFaction.treasury < 50 ? 30 : 0,
    };
    
    // Make decisions for each other faction
    allFactions
      .filter(f => f.id !== aiFaction.id)
      .forEach(targetFaction => {
        const relation = relations.find(
          r => (r.factionA === aiFaction.id && r.factionB === targetFaction.id) ||
               (r.factionB === aiFaction.id && r.factionA === targetFaction.id)
        );
        
        const borderFriction = calculateBorderFriction(
          aiFaction.id, 
          targetFaction.id, 
          provinces
        );
        
        const theirStrength = calculateMilitaryStrength(
          targetFaction.id, 
          allFactions, 
          provinces
        );
        
        const decision = makeAIDecision(
          aiFaction,
          targetFaction,
          relation,
          aiState,
          borderFriction,
          myStrength,
          theirStrength
        );
        
        if (decision.type !== 'none') {
          decisions.push(decision);
        }
      });
    
    // Limit to max 2 decisions per turn to avoid spam
    return decisions.slice(0, 2);
  }, []);
  
  // Evaluate whether AI should accept a treaty proposal
  const evaluateTreatyProposal = useCallback((
    aiFaction: Faction,
    proposingFaction: Faction,
    treatyType: TreatyType,
    relation: DiplomaticRelation | undefined,
    provinces: Province[],
    allFactions: Faction[]
  ): { accept: boolean; reason: string } => {
    const personality = aiFaction.personality || 'balanced';
    const relationValue = relation?.relation || 0;
    const trust = relation?.trust || 0;
    
    const myStrength = calculateMilitaryStrength(aiFaction.id, allFactions, provinces);
    const theirStrength = calculateMilitaryStrength(proposingFaction.id, allFactions, provinces);
    const borderFriction = calculateBorderFriction(aiFaction.id, proposingFaction.id, provinces);
    
    // Base acceptance thresholds
    let acceptanceChance = 50; // Base 50%
    
    // Relation affects acceptance
    acceptanceChance += relationValue / 2;
    
    // Trust affects acceptance
    acceptanceChance += trust / 2;
    
    // Border friction reduces acceptance
    acceptanceChance -= borderFriction;
    
    // Treaty-specific modifiers
    switch (treatyType) {
      case 'trade_agreement':
        if (personality === 'trader') acceptanceChance += 30;
        if (personality === 'aggressive') acceptanceChance -= 10;
        break;
        
      case 'non_aggression':
        if (personality === 'cautious') acceptanceChance += 20;
        if (personality === 'aggressive' && myStrength > theirStrength) {
          acceptanceChance -= 30;
        }
        break;
        
      case 'alliance':
        // Require good relations and trust
        if (relationValue < 20 || trust < 15) {
          return { accept: false, reason: 'Luottamus ei riitä liittoon' };
        }
        acceptanceChance += 10;
        // Cautious factions like alliances
        if (personality === 'cautious') acceptanceChance += 25;
        if (personality === 'aggressive') acceptanceChance -= 15;
        break;
        
      case 'tributary':
        // Only accept if much weaker
        if (myStrength > theirStrength * 0.5) {
          return { accept: false, reason: 'Olemme liian vahvoja maksaaksemme veroja' };
        }
        acceptanceChance = Math.min(acceptanceChance, 60);
        break;
        
      case 'truce':
      case 'peace':
        // Usually accept truces/peace
        acceptanceChance = Math.max(acceptanceChance, 70);
        break;
    }
    
    // Final decision
    const accept = acceptanceChance > 50;
    
    const reasons = {
      true: [
        'Sopimus on molemminpuolinen etu',
        'Suhteet ovat riittävän hyvät',
        'Strateginen tilanne puoltaa sopimusta',
        'Luotamme tarpeeksi toiseen osapuoleen',
      ],
      false: [
        'Suhteet eivät ole riittävän hyvät',
        'Emme luota toiseen osapuoleen',
        'Strateginen tilanne ei tue sopimusta',
        'Rajakitka on liian korkea',
      ],
    };
    
    const reasonList = accept ? reasons.true : reasons.false;
    const reason = reasonList[Math.floor(Math.random() * reasonList.length)];
    
    return { accept, reason };
  }, []);
  
  return {
    calculateAIDiplomacy,
    evaluateTreatyProposal,
  };
};

export type { DiplomacyDecision };
