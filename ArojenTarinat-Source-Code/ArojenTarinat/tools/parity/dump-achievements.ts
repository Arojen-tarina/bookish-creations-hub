// Generates the native achievement catalog from the original game:
//   <kotlinDir>/AchievementCatalog.kt          definitions + unlock checks
//   ui/achievements/AchievementText.kt          id -> string resource ids
//   <resDir>/values[-fi]/strings_achievements.xml  names, descriptions, rewards, rank titles (en, fi)
// Usage: node dump-achievements.mjs <achievementDefinitions.ts path> <kotlinDir> <resDir>
import { ACHIEVEMENT_DEFINITIONS } from '@/game/achievementDefinitions.ts';
import { RANK_TITLES } from '@/game/achievementTypes.ts';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const [sourcePath, kotlinDir, resDir] = process.argv.slice(2);
const source = readFileSync(sourcePath, 'utf8');

const E = (s: string) => s.toUpperCase();
const kstr = (s: string) => '"' + s.split('\\').join('\\\\').split('"').join('\\"').split('$').join('\\$') + '"';
const xml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/'/g, "\\'").replace(/"/g, '\\"').replace(/\n/g, '\\n')
  .replace(/^([@?])/, '\\$1');
// Rewards carried an emoji "icon"; the app draws vector icons per reward kind instead.
const EMOJI = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{2300}-\u{23FF}\u{FE0F}\u{200D}]/gu;
const clean = (s: string) => s.replace(EMOJI, '').trim();

/** Source text of the definition with this id (up to the next definition). */
const blockOf = (id: string): string => {
  const start = source.indexOf(`id: '${id}'`);
  if (start < 0) throw new Error(`definition ${id} not found in source`);
  const next = source.indexOf("id: '", start + 5);
  return source.slice(start, next < 0 ? undefined : next);
};

const toKotlinCheck = (id: string): string => {
  const block = blockOf(id);
  let m = block.match(/\.\.\.atLeast\('(\w+)', (\d+)\)/);
  if (m) return `atLeast(${m[2]}) { it.${m[1]} }`;
  m = block.match(/\.\.\.atLeastUnique\('(\w+)', (\d+)\)/);
  if (m) return `atLeast(${m[2]}) { it.${m[1]}.size }`;
  m = block.match(/\.\.\.atMost\('(\w+)', (\d+)\)/);
  if (m) return `atMost(${m[2]}) { it.${m[1]} }`;
  m = block.match(/check: victoryByFaction\('(\w+)'\)/);
  if (m) return `victoryWith(FactionId.${E(m[1])})`;
  if (/check: \(s\) => \(\['mongol', 'song', 'rus', 'khwarezm'\] as FactionId\[\]\)\.every/.test(block)) {
    return 'custom { s -> ACTIVE_FACTIONS.all { (s.victoriesByFaction[it] ?: 0) > 0 } }';
  }
  m = block.match(/check: \(s\) => ([^\n]+?),?\n/);
  if (m && /^[\w.\s&|><=!0-9]+$/.test(m[1])) {
    return `custom { s -> ${m[1].replace(/===/g, '==').replace(/!==/g, '!=')} }`;
  }
  throw new Error(`unsupported check in ${id}: ${block.slice(0, 300)}`);
};

let kt = `// GENERATED from bookish-creations-hub src/game/achievementDefinitions.ts by tools/parity. Do not edit by hand.
package fi.bookish.creations.arojen.tarinat.game.achievements

import fi.bookish.creations.arojen.tarinat.game.data.ACTIVE_FACTIONS
import fi.bookish.creations.arojen.tarinat.game.model.FactionId

/** Every achievement in display order. Text lives in strings_achievements.xml as achv_<id>_name / _desc / _reward. */
val ACHIEVEMENTS: List<AchievementDef> = listOf(
`;
const en: string[] = [];
const fi: string[] = [];
for (const d of ACHIEVEMENT_DEFINITIONS) {
  const args = [
    kstr(d.id),
    `AchievementCategory.${E(d.category)}`,
    `AchievementDifficulty.${E(d.difficulty)}`,
    `points = ${d.points}`,
  ];
  if (d.hidden || d.category === 'hidden') args.push('hidden = true');
  if (d.legendary) args.push('legendary = true');
  if (d.reward) args.push(`reward = RewardKind.${E(d.reward.kind)}`);
  args.push(`check = ${toKotlinCheck(d.id)}`);
  kt += `    AchievementDef(${args.join(', ')}),\n`;
  const key = d.id.toLowerCase();
  en.push(`    <string name="achv_${key}_name">${xml(clean(d.name.en))}</string>`);
  en.push(`    <string name="achv_${key}_desc">${xml(clean(d.description.en))}</string>`);
  fi.push(`    <string name="achv_${key}_name">${xml(clean(d.name.fi))}</string>`);
  fi.push(`    <string name="achv_${key}_desc">${xml(clean(d.description.fi))}</string>`);
  if (d.reward) {
    en.push(`    <string name="achv_${key}_reward">${xml(clean(d.reward.name.en))}</string>`);
    fi.push(`    <string name="achv_${key}_reward">${xml(clean(d.reward.name.fi))}</string>`);
  }
}
kt += ')\n\n/** Rank titles unlocked at these player levels (pointsForLevel). Text: rank_<level>. */\nval RANK_LEVELS: List<Int> = listOf(' +
  RANK_TITLES.map(r => r.level).join(', ') + ')\n';
for (const r of RANK_TITLES) {
  en.push(`    <string name="rank_${r.level}">${xml(r.title.en)}</string>`);
  fi.push(`    <string name="rank_${r.level}">${xml(r.title.fi)}</string>`);
}

mkdirSync(kotlinDir, { recursive: true });
writeFileSync(`${kotlinDir}/AchievementCatalog.kt`, kt);

// Android string resources for each achievement, looked up without reflection.
let res = `// GENERATED from bookish-creations-hub src/game/achievementDefinitions.ts by tools/parity. Do not edit by hand.
package fi.bookish.creations.arojen.tarinat.ui.achievements

import fi.bookish.creations.arojen.tarinat.R

class AchievementText(val name: Int, val description: Int, val reward: Int?)

val ACHIEVEMENT_TEXT: Map<String, AchievementText> = mapOf(
`;
for (const d of ACHIEVEMENT_DEFINITIONS) {
  const key = d.id.toLowerCase();
  res += `    ${kstr(d.id)} to AchievementText(R.string.achv_${key}_name, R.string.achv_${key}_desc, ${d.reward ? `R.string.achv_${key}_reward` : 'null'}),
`;
}
res += ')\n\nval RANK_TITLE: Map<Int, Int> = mapOf(' + RANK_TITLES.map(r => `${r.level} to R.string.rank_${r.level}`).join(', ') + ')\n';
const uiDir = kotlinDir.replace(/game[\\/]achievements$/, 'ui/achievements');
mkdirSync(uiDir, { recursive: true });
writeFileSync(`${uiDir}/AchievementText.kt`, res);
const header = '<?xml version="1.0" encoding="utf-8"?>\n<!-- GENERATED from bookish-creations-hub achievementDefinitions.ts by tools/parity. Do not edit by hand. -->\n<resources>\n';
for (const [folder, lines] of [['values', en], ['values-fi', fi]] as const) {
  mkdirSync(`${resDir}/${folder}`, { recursive: true });
  writeFileSync(`${resDir}/${folder}/strings_achievements.xml`, header + lines.join('\n') + '\n</resources>\n');
}
console.log(`achievements: ${ACHIEVEMENT_DEFINITIONS.length}, rank titles: ${RANK_TITLES.length}`);
