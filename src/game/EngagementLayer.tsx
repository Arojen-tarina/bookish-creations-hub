/**
 * EngagementLayer.tsx — Koukuttavuuskerros
 *
 * Lisää peliin dopamiinikoukkuja muuttamatta itse pelimekaniikkaa:
 * - Kelluvat palkintoponnahdukset (kulta, provinssit, miehet)
 * - Saavutusilmoitukset (milestones)
 * - Putki/streak-laskuri ilman tappioita
 * - Juhliva visuaalinen palaute (konfetti, screen flash) tärkeissä hetkissä
 *
 * Komponentti on puhtaasti reaktiivinen: se tarkkailee pelitilan muutoksia
 * ja näyttää palautetta. Se ei muuta pelin logiikkaa.
 */
import { useEffect, useRef, useState, useCallback } from 'react';

interface MinimalFaction { id: string; name?: string; treasury: number; manpower: number }
interface MinimalProvince { ownerId: string | null }
interface MinimalGameState { factions: MinimalFaction[]; provinces: MinimalProvince[]; turn: number }

interface EngagementLayerProps {
  gameState: MinimalGameState | null;
  playerFaction: string | null;
}

interface FloatingReward {
  id: string;
  text: string;
  color: string;
  x: number;
  y: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  emoji: string;
}

const ACHIEVEMENTS: Record<string, Omit<Achievement, 'id'>> = {
  first_province: { title: 'Ensimmäinen valloitus!', description: 'Sait toisen provinssin haltuusi', emoji: '🏆' },
  five_provinces: { title: 'Khaani nousee', description: '5 provinssia hallinnassasi', emoji: '⚔️' },
  ten_provinces: { title: 'Imperiumi laajenee', description: '10 provinssia hallinnassasi', emoji: '👑' },
  twenty_provinces: { title: 'Suurkhaani', description: '20 provinssia — voitto lähellä!', emoji: '🌟' },
  hundred_gold: { title: 'Vauras kauppias', description: '100 kultaa kassassa', emoji: '💰' },
  three_hundred_gold: { title: 'Kultainen valtaistuin', description: '300 kultaa kassassa', emoji: '🪙' },
  five_turn_streak: { title: '5 vuoron putki!', description: 'Ei menetyksiä viiteen vuoroon', emoji: '🔥' },
  ten_turn_streak: { title: '10 vuoron putki!', description: 'Mahtava sarja jatkuu', emoji: '🔥🔥' },
  twenty_turn_streak: { title: '20 vuoron LEGENDA', description: 'Pysäyttämätön voittokulku', emoji: '⚡' },
};

export const EngagementLayer = ({ gameState, playerFaction }: EngagementLayerProps) => {
  const [rewards, setRewards] = useState<FloatingReward[]>([]);
  const [achievement, setAchievement] = useState<Achievement | null>(null);
  const [streak, setStreak] = useState(0);
  const [showStreakPulse, setShowStreakPulse] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);

  const prevRef = useRef<{
    treasury: number;
    manpower: number;
    provinceCount: number;
    turn: number;
    unlocked: Set<string>;
  } | null>(null);

  const spawnReward = useCallback((text: string, color: string) => {
    const id = Math.random().toString(36).slice(2);
    const x = 30 + Math.random() * 40;
    const y = 35 + Math.random() * 20;
    setRewards((r) => [...r, { id, text, color, x, y }]);
    setTimeout(() => setRewards((r) => r.filter((x) => x.id !== id)), 1800);
  }, []);

  const unlock = useCallback((key: string) => {
    if (!prevRef.current) return;
    if (prevRef.current.unlocked.has(key)) return;
    prevRef.current.unlocked.add(key);
    const def = ACHIEVEMENTS[key];
    if (!def) return;
    setAchievement({ id: key, ...def });
    setConfetti(true);
    setTimeout(() => setAchievement(null), 3500);
    setTimeout(() => setConfetti(false), 2500);
  }, []);

  useEffect(() => {
    if (!gameState || !playerFaction) return;
    const me = gameState.factions.find((f) => f.id === playerFaction);
    if (!me) return;

    const provinceCount = gameState.provinces.filter((p) => p.ownerId === playerFaction).length;
    const snap = {
      treasury: me.treasury,
      manpower: me.manpower,
      provinceCount,
      turn: gameState.turn,
      unlocked: prevRef.current?.unlocked ?? new Set<string>(),
    };

    if (!prevRef.current) {
      prevRef.current = snap;
      return;
    }

    const prev = prevRef.current;

    // Resource gains
    const goldDelta = snap.treasury - prev.treasury;
    if (goldDelta >= 5) spawnReward(`+${goldDelta} 🪙`, 'text-amber-300');
    const manpowerDelta = snap.manpower - prev.manpower;
    if (manpowerDelta >= 3) spawnReward(`+${manpowerDelta} 👥`, 'text-blue-300');

    // Province conquest
    const provDelta = snap.provinceCount - prev.provinceCount;
    if (provDelta > 0) {
      spawnReward(`+${provDelta} 🏰 PROVINSSI!`, 'text-emerald-300');
      setFlash('emerald');
      setTimeout(() => setFlash(null), 400);
    } else if (provDelta < 0) {
      spawnReward(`${provDelta} 💔`, 'text-red-400');
      setStreak(0);
    }

    // Turn-based streak
    if (snap.turn > prev.turn) {
      if (provDelta >= 0) {
        setStreak((s) => {
          const next = s + 1;
          setShowStreakPulse(true);
          setTimeout(() => setShowStreakPulse(false), 600);
          if (next === 5) unlock('five_turn_streak');
          if (next === 10) unlock('ten_turn_streak');
          if (next === 20) unlock('twenty_turn_streak');
          return next;
        });
      }
    }

    // Province milestones
    if (snap.provinceCount >= 2 && prev.provinceCount < 2) unlock('first_province');
    if (snap.provinceCount >= 5 && prev.provinceCount < 5) unlock('five_provinces');
    if (snap.provinceCount >= 10 && prev.provinceCount < 10) unlock('ten_provinces');
    if (snap.provinceCount >= 20 && prev.provinceCount < 20) unlock('twenty_provinces');

    // Gold milestones
    if (snap.treasury >= 100 && prev.treasury < 100) unlock('hundred_gold');
    if (snap.treasury >= 300 && prev.treasury < 300) unlock('three_hundred_gold');

    prevRef.current = snap;
  }, [gameState, playerFaction, spawnReward, unlock]);

  return (
    <>
      {/* Screen flash */}
      {flash && (
        <div
          className={`fixed inset-0 z-[60] pointer-events-none animate-fade-out ${
            flash === 'emerald' ? 'bg-emerald-500/20' : 'bg-amber-500/20'
          }`}
        />
      )}

      {/* Floating rewards */}
      <div className="fixed inset-0 z-[55] pointer-events-none">
        {rewards.map((r) => (
          <div
            key={r.id}
            className={`absolute font-bold text-2xl drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] ${r.color}`}
            style={{
              left: `${r.x}%`,
              top: `${r.y}%`,
              animation: 'reward-float 1.8s ease-out forwards',
            }}
          >
            {r.text}
          </div>
        ))}
      </div>

      {/* Streak counter */}
      {streak >= 3 && (
        <div className="fixed top-[100px] left-3 z-[50] pointer-events-none">
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-orange-600/90 to-red-600/90 border border-amber-300/60 shadow-[0_0_20px_rgba(251,146,60,0.6)] backdrop-blur-sm transition-transform ${
              showStreakPulse ? 'scale-125' : 'scale-100'
            }`}
          >
            <span className="text-lg">🔥</span>
            <span className="text-white font-bold text-sm">{streak} putki</span>
          </div>
        </div>
      )}

      {/* Achievement toast */}
      {achievement && (
        <div className="fixed top-1/3 left-1/2 -translate-x-1/2 z-[70] pointer-events-none animate-scale-in">
          <div className="bg-gradient-to-br from-amber-500 via-amber-600 to-orange-700 text-white px-8 py-5 rounded-2xl shadow-[0_0_60px_rgba(251,191,36,0.8)] border-2 border-amber-200 max-w-md text-center">
            <div className="text-5xl mb-2">{achievement.emoji}</div>
            <div className="text-xs uppercase tracking-[0.3em] text-amber-100/90 mb-1">Saavutus avattu</div>
            <div className="text-xl font-bold">{achievement.title}</div>
            <div className="text-sm text-amber-50/90 mt-1">{achievement.description}</div>
          </div>
        </div>
      )}

      {/* Confetti */}
      {confetti && (
        <div className="fixed inset-0 z-[65] pointer-events-none overflow-hidden">
          {Array.from({ length: 40 }).map((_, i) => {
            const colors = ['bg-amber-400', 'bg-emerald-400', 'bg-rose-400', 'bg-sky-400', 'bg-violet-400'];
            const color = colors[i % colors.length];
            const left = Math.random() * 100;
            const delay = Math.random() * 0.5;
            const duration = 1.5 + Math.random();
            return (
              <div
                key={i}
                className={`absolute w-2 h-3 ${color} rounded-sm`}
                style={{
                  left: `${left}%`,
                  top: '-20px',
                  animation: `confetti-fall ${duration}s ease-in ${delay}s forwards`,
                }}
              />
            );
          })}
        </div>
      )}

      <style>{`
        @keyframes reward-float {
          0% { opacity: 0; transform: translateY(20px) scale(0.6); }
          15% { opacity: 1; transform: translateY(0) scale(1.15); }
          25% { transform: translateY(-4px) scale(1); }
          100% { opacity: 0; transform: translateY(-80px) scale(0.9); }
        }
        @keyframes confetti-fall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </>
  );
};
