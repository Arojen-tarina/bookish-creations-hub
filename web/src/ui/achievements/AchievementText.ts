export interface AchievementText { name: string; description: string; reward: string | null }
export function achievementText(id: string): AchievementText {
  return { name: `achv_${id}_name`, description: `achv_${id}_desc`, reward: `achv_${id}_reward` };
}
export type AchievementCategory='tutorial'|'early_game'|'mid_game'|'end_game'|'skill'|'exploration'|'collection'|'challenge'|'historical'|'campaign'|'daily_weekly'|'lifetime'|'hidden';
export const CATEGORY_ORDER: AchievementCategory[] = ['tutorial','early_game','mid_game','end_game','skill','exploration','collection','challenge','historical','campaign','daily_weekly','lifetime','hidden'];
export function categoryLabel(category: AchievementCategory): string { return `achv_category_${category}`; }
