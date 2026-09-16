/**
 * useAchievementTracking.ts — Kytkee saavutukset pelitapahtumiin
 *
 * Tarkkailee pelitilaa (provinssit, taistelut, voittoehdot) ja avaa
 * vastaavat saavutukset AchievementManagerin kautta. Toteutettu reaktiivisena
 * efektinä, jotta monimutkaista pelitilan reduceria (useProvinceGameState.ts)
 * ei tarvitse muuttaa.
 */
import { useCallback, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { achievementManager, ACHIEVEMENT_DEFINITIONS } from '@/game/achievements.ts';
import { useLanguage } from '@/lib/i18n.tsx';
import type { MVPGameState } from '@/hooks/useProvinceGameState.ts';
import type { BattleResult } from '@/game/BattleDisplay.tsx';
import type { FactionId } from '@/types/province.ts';

const VICTORY_ACHIEVEMENT_BY_CONDITION: Record<string, string> = {
  military: 'military_victory',
  economic: 'economic_victory',
  technology: 'technology_victory',
  diplomatic: 'diplomatic_victory',
  cultural: 'cultural_victory',
};

export const useAchievementTracking = (
  gameState: MVPGameState | null,
  playerFaction: FactionId | null,
  pendingBattle: BattleResult | null,
) => {
  const { lang } = useLanguage();
  const seenBattleIds = useRef<Set<string>>(new Set());

  const unlock = useCallback(async (id: string) => {
    const unlockedNow = await achievementManager.unlockAchievement(id);
    if (!unlockedNow) return;
    const def = ACHIEVEMENT_DEFINITIONS.find(d => d.id === id);
    if (def) toast.success(`🏆 ${def.name[lang]}`, { description: def.description[lang] });
  }, [lang]);

  // First province captured (starting province doesn't count; needs 2+ owned).
  useEffect(() => {
    if (!gameState || !playerFaction) return;
    const ownedCount = gameState.provinces.filter(p => p.ownerId === playerFaction).length;
    if (ownedCount >= 2) unlock('first_province');
  }, [gameState, playerFaction, unlock]);

  // First battle won by the player.
  useEffect(() => {
    if (!pendingBattle || !playerFaction) return;
    if (pendingBattle.attackerFaction !== playerFaction || pendingBattle.winner !== 'attacker') return;
    if (seenBattleIds.current.has(pendingBattle.attacker.id)) return;
    seenBattleIds.current.add(pendingBattle.attacker.id);
    unlock('first_battle_won');
  }, [pendingBattle, playerFaction, unlock]);

  // Victory achievements.
  useEffect(() => {
    if (!gameState?.gameOver || gameState.winnerId !== playerFaction || !gameState.winCondition) return;
    const achievementId = VICTORY_ACHIEVEMENT_BY_CONDITION[gameState.winCondition];
    if (achievementId) unlock(achievementId);
  }, [gameState, playerFaction, unlock]);
};

