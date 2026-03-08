/**
 * Lautapeli.tsx — Lautapelin sääntödokumenttisivu
 *
 * Kokoaa kaikki lautapelin osiot yhdelle sivulle:
 * yleiskuvaus, pelilauta, komponentit, heimot, mekaniikka,
 * taistelu, resurssit, diplomatia, voittoehdot, erityissäännöt,
 * strategiat, laajennusideat, visuaaliset mock-upit ja yhteenveto.
 */
import { Layout } from "@/components/Layout";
import { GameOverview } from "@/components/game/GameOverview";
import { GameIntroduction } from "@/components/game/GameIntroduction";
import { GameBoard } from "@/components/game/GameBoard";
import { GameComponents } from "@/components/game/GameComponents";
import { Factions } from "@/components/game/Factions";
import { DetailedFactions } from "@/components/game/DetailedFactions";
import { GameMechanics } from "@/components/game/GameMechanics";
import { CombatSystem } from "@/components/game/CombatSystem";
import { AdvancedCombatRules } from "@/components/game/AdvancedCombatRules";
import { ResourceSystem } from "@/components/game/ResourceSystem";
import { DiplomacySystem } from "@/components/game/DiplomacySystem";
import { AdvancedDiplomacy } from "@/components/game/AdvancedDiplomacy";
import { VictoryConditions } from "@/components/game/VictoryConditions";
import { SpecialFeatures } from "@/components/game/SpecialFeatures";
import { StrategicConsiderations } from "@/components/game/StrategicConsiderations";
import { ExpansionIdeas } from "@/components/game/ExpansionIdeas";
import { VisualMockups } from "@/components/game/VisualMockups";
import { PrototypeSection } from "@/components/game/PrototypeSection";
import { DocumentSummary } from "@/components/game/DocumentSummary";

const Lautapeli = () => {
  return (
    <Layout>
      {/* 1. Pelin yleiskuvaus */}
      <GameOverview />
      <GameIntroduction />
      
      {/* PROTOTYYPPI - Tulostettavat materiaalit */}
      <PrototypeSection />
      
      {/* 2. Pelilauta */}
      <GameBoard />
      
      {/* 3. Pelin osat */}
      <GameComponents />
      
      {/* 4. Heimot - Yleiskatsaus ja yksityiskohtainen */}
      <Factions />
      <DetailedFactions />
      
      {/* 5. Vuoromekaniikka */}
      <GameMechanics />
      
      {/* 6. Taistelujärjestelmä */}
      <CombatSystem />
      <AdvancedCombatRules />
      
      {/* 7. Resurssijärjestelmä */}
      <ResourceSystem />
      
      {/* 8. Diplomatiajärjestelmä */}
      <DiplomacySystem />
      <AdvancedDiplomacy />
      
      {/* 9. Voittotavat */}
      <VictoryConditions />
      
      {/* 10. Erityissäännöt */}
      <SpecialFeatures />
      
      {/* 11. Strategiset näkökulmat */}
      <StrategicConsiderations />
      
      {/* 12. Laajennusideat */}
      <ExpansionIdeas />
      
      {/* 13. Visuaaliset mock-up -tarpeet */}
      <VisualMockups />
      
      {/* Yhteenveto */}
      <DocumentSummary />
    </Layout>
  );
};

export default Lautapeli;
