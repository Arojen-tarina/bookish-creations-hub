/**
 * retention.ts — D1/D7/D30 -paikallinen laskenta + karkea churn-riski
 *
 * Todellinen kohortti-retentio (montako % KAIKISTA pelaajista palaa D1/D7/D30)
 * lasketaan palvelinpuolella (ks. Supabase-näkymät
 * `supabase/migrations/*_analytics_events.sql`) aggregoimalla `session_start`
 * -tapahtumien clientId+day-parit. Tämä moduuli tuottaa PAIKALLISEN,
 * yhden laitteen näkymän (käytetään dev-dashboardissa ja churn-heuristiikassa)
 * — se ei koskaan ole tarkka korvike palvelinpuolen kohorttiraportille.
 */
import { getPlayerStats } from '@/game/playerStats.ts';

const DAYS_KEY = 'arojen_tarinat_analytics_days_v1';
const FIRST_OPEN_KEY = 'arojen_tarinat_analytics_first_open_v1';
const MAX_DAYS_STORED = 400;

const todayString = () => new Date().toISOString().slice(0, 10);
const daysBetween = (a: string, b: string) => Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86_400_000);

/** Records "the app was opened today" (idempotent per calendar day). Returns whether this is a new day. */
export const recordAppOpenDay = (): { isNewDay: boolean; daysSinceFirstOpen: number; isNewPlayer: boolean } => {
  const today = todayString();
  let firstOpen: string | null = null;
  let days: string[] = [];
  try {
    firstOpen = localStorage.getItem(FIRST_OPEN_KEY);
    days = JSON.parse(localStorage.getItem(DAYS_KEY) ?? '[]');
    if (!Array.isArray(days)) days = [];
  } catch {
    days = [];
  }

  const isNewPlayer = !firstOpen;
  if (!firstOpen) {
    firstOpen = today;
    try { localStorage.setItem(FIRST_OPEN_KEY, firstOpen); } catch { /* ignore */ }
  }

  const isNewDay = !days.includes(today);
  if (isNewDay) {
    days.push(today);
    while (days.length > MAX_DAYS_STORED) days.shift();
    try { localStorage.setItem(DAYS_KEY, JSON.stringify(days)); } catch { /* ignore */ }
  }

  return { isNewDay, daysSinceFirstOpen: daysBetween(firstOpen, today), isNewPlayer };
};

export interface RetentionSummary {
  firstOpenDate: string | null;
  distinctDaysActive: number;
  daysSinceFirstOpen: number;
  daysSinceLastOpen: number;
  activeOnD1: boolean;
  activeOnD7: boolean;
  activeOnD30: boolean;
  /** distinctDaysActive / daysSinceFirstOpen — rough session-frequency proxy (0..1). */
  sessionFrequency: number;
}

/** Local-device retention snapshot — see module docstring for scope/limits. */
export const getRetentionSummary = (): RetentionSummary => {
  const today = todayString();
  let firstOpen: string | null = null;
  let days: string[] = [];
  try {
    firstOpen = localStorage.getItem(FIRST_OPEN_KEY);
    days = JSON.parse(localStorage.getItem(DAYS_KEY) ?? '[]');
    if (!Array.isArray(days)) days = [];
  } catch {
    days = [];
  }
  if (!firstOpen || days.length === 0) {
    return {
      firstOpenDate: firstOpen, distinctDaysActive: days.length, daysSinceFirstOpen: 0,
      daysSinceLastOpen: 0, activeOnD1: false, activeOnD7: false, activeOnD30: false, sessionFrequency: 0,
    };
  }
  const daysSinceFirstOpen = daysBetween(firstOpen, today);
  const lastOpen = days[days.length - 1];
  const daysSinceLastOpen = daysBetween(lastOpen, today);
  return {
    firstOpenDate: firstOpen,
    distinctDaysActive: days.length,
    daysSinceFirstOpen,
    daysSinceLastOpen,
    activeOnD1: days.includes(addDays(firstOpen, 1)),
    activeOnD7: days.includes(addDays(firstOpen, 7)),
    activeOnD30: days.includes(addDays(firstOpen, 30)),
    sessionFrequency: Math.min(1, days.length / Math.max(1, daysSinceFirstOpen + 1)),
  };
};

function addDays(dateStr: string, n: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

export interface ChurnEstimate {
  /** 0 (very unlikely to churn) .. 100 (high churn risk) */
  riskScore: number;
  reasons: string[];
}

/**
 * Rule-based churn heuristic — deliberately NOT a trained ML model (unrealistic
 * infra for a solo dev with no ML pipeline). Combines local retention signal
 * with lifetime PlayerStats. Recompute this server-side from aggregated
 * `analytics_events` once there's enough cross-player volume to justify it.
 */
export const estimateChurnRisk = (): ChurnEstimate => {
  const retention = getRetentionSummary();
  const stats = getPlayerStats();
  const reasons: string[] = [];
  let risk = 0;

  if (retention.daysSinceLastOpen >= 14) { risk += 40; reasons.push('inactive_14d'); }
  else if (retention.daysSinceLastOpen >= 7) { risk += 20; reasons.push('inactive_7d'); }

  if (retention.sessionFrequency < 0.15 && retention.daysSinceFirstOpen > 3) { risk += 15; reasons.push('low_session_frequency'); }

  const winRate = stats.gamesPlayed > 0 ? stats.gamesWon / stats.gamesPlayed : null;
  if (winRate !== null && stats.gamesPlayed >= 3 && winRate < 0.15) { risk += 20; reasons.push('low_win_rate'); }

  if (stats.gamesPlayed <= 1 && retention.daysSinceFirstOpen >= 1) { risk += 15; reasons.push('never_finished_second_game'); }

  if (stats.battlesLost > stats.battlesWon * 3 && stats.battlesLost + stats.battlesWon >= 5) {
    risk += 10; reasons.push('frustrating_combat_ratio');
  }

  return { riskScore: Math.max(0, Math.min(100, risk)), reasons };
};
