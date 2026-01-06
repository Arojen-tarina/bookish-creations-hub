import { Layout } from "@/components/Layout";
import { GameOverview } from "@/components/game/GameOverview";
import { GameBoard } from "@/components/game/GameBoard";
import { GameComponents } from "@/components/game/GameComponents";
import { Factions } from "@/components/game/Factions";
import { GameMechanics } from "@/components/game/GameMechanics";
import { CombatSystem } from "@/components/game/CombatSystem";
import { ResourceSystem } from "@/components/game/ResourceSystem";
import { DiplomacySystem } from "@/components/game/DiplomacySystem";
import { VictoryConditions } from "@/components/game/VictoryConditions";
import { SpecialFeatures } from "@/components/game/SpecialFeatures";
import { StrategicConsiderations } from "@/components/game/StrategicConsiderations";

const Lautapeli = () => {
  return (
    <Layout>
      <GameOverview />
      <GameBoard />
      <GameComponents />
      <Factions />
      <GameMechanics />
      <CombatSystem />
      <ResourceSystem />
      <DiplomacySystem />
      <VictoryConditions />
      <SpecialFeatures />
      <StrategicConsiderations />
    </Layout>
  );
};

export default Lautapeli;
