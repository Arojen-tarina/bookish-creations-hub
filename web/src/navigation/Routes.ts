import type { Difficulty, FactionId } from '../game/model/enums';
export type Route =
  | { screen: 'Splash' }
  | { screen: 'Menu' }
  | { screen: 'FactionSelect' }
  | { screen: 'Game'; faction: FactionId; difficulty: Difficulty; loadSlot: number }
  | { screen: 'Load' }
  | { screen: 'Achievements' }
  | { screen: 'Codex' }
  | { screen: 'Rulebook' }
  | { screen: 'Settings' };
export const NEW_GAME = -1;
export const SplashRoute: Route = { screen: 'Splash' };
export const MenuRoute: Route = { screen: 'Menu' };
export const FactionSelectRoute: Route = { screen: 'FactionSelect' };
export const LoadGameRoute: Route = { screen: 'Load' };
export const AchievementsRoute: Route = { screen: 'Achievements' };
export const CodexRoute: Route = { screen: 'Codex' };
export const RulebookRoute: Route = { screen: 'Rulebook' };
export const SettingsRoute: Route = { screen: 'Settings' };
export function GameRoute(faction: FactionId, difficulty: Difficulty, loadSlot = NEW_GAME): Route { return { screen: 'Game', faction, difficulty, loadSlot }; }

export function routeToHash(route: Route): string {
  if (route.screen !== 'Game') return `#/${route.screen.toLowerCase().replace('factionselect', 'faction-select')}`;
  const query = new URLSearchParams({ faction: route.faction, difficulty: route.difficulty, loadSlot: String(route.loadSlot) });
  return `#/game?${query.toString()}`;
}
export function routeFromHash(hash: string): Route | null {
  const [path, query = ''] = hash.replace(/^#\/?/, '').split('?');
  const name = path.toLowerCase();
  if (name === 'splash') return SplashRoute;
  if (name === 'menu' || !name) return MenuRoute;
  if (name === 'faction-select') return FactionSelectRoute;
  if (name === 'load') return LoadGameRoute;
  if (name === 'achievements') return AchievementsRoute;
  if (name === 'codex') return CodexRoute;
  if (name === 'rulebook') return RulebookRoute;
  if (name === 'settings') return SettingsRoute;
  if (name === 'game') {
    const params = new URLSearchParams(query);
    const faction = params.get('faction') ?? 'mongol';
    const difficulty = params.get('difficulty') ?? 'normal';
    const loadSlot = Number(params.get('loadSlot') ?? NEW_GAME);
    if (!['mongol','jin','song','xixia','khwarezm','rus','kipchak'].includes(faction) || !['easy','normal','hard'].includes(difficulty) || !Number.isInteger(loadSlot)) return null;
    return GameRoute(faction as FactionId, difficulty as Difficulty, loadSlot);
  }
  return null;
}
