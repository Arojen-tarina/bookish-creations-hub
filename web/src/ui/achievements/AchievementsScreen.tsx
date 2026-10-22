import { useMemo, useState } from 'react';
import { hasString, t, useLocale } from '../../i18n';
import { ACHIEVEMENTS } from '../../game/achievements/achievementCatalog';
import { Progression, type AchievementDef, type PlayerStats } from '../../game/achievements/achievementModel';
import type { AchievementRepository } from '../../data/AchievementRepository';
import { createStore, useStore, type Store } from '../../lib/store';
import { achievementText, CATEGORY_ORDER, categoryLabel, type AchievementCategory } from './AchievementText';
import '../screens/screens.css';
const EMPTY_UNLOCKS = createStore<Record<string, number>>({});
const EMPTY_STATS = createStore<PlayerStats | null>(null);
export interface AchievementDefinition { id:string; category:AchievementCategory; points:number; hidden?:boolean; legendary?:boolean; reward?:string|null; progress?:{current:number;target:number}|null }
export interface AchievementsScreenProps { repo?: Pick<AchievementRepository,'unlocked'|'stats'>; achievements?: AchievementDefinition[]; unlocked?: Record<string,number>; stats?: PlayerStats; onBack:()=>void }
export function AchievementsScreen({repo,achievements:givenAchievements,unlocked:givenUnlocks,stats:givenStats,onBack}:AchievementsScreenProps){
  useLocale();
  const repoUnlocks=useStore(repo?.unlocked??EMPTY_UNLOCKS);
  const repoStats=useStore<PlayerStats|null>((repo?.stats as Store<PlayerStats|null>|undefined)??EMPTY_STATS);
  const unlocked=givenUnlocks??repoUnlocks;
  const stats=givenStats??repoStats;
  const [filter,setFilter]=useState<AchievementCategory|null>(null);
  const visibleAchievements=givenAchievements??ACHIEVEMENTS.map((def:AchievementDef)=>({id:def.id,category:def.category.toLowerCase() as AchievementCategory,points:def.points,hidden:def.hidden,legendary:def.legendary,reward:def.reward?.toLowerCase()??null,progress:stats?def.check.progress?.(stats)??null:null}));
  const points=visibleAchievements.filter(a=>a.id in unlocked).reduce((n,a)=>n+a.points,0);
  const level=Progression.level(points),start=Progression.pointsForLevel(level),end=Progression.pointsForLevel(level+1),rank=Progression.rankLevel(level);
  const shown=useMemo(()=>visibleAchievements.filter(a=>!filter||a.category===filter).sort((a,b)=>CATEGORY_ORDER.indexOf(a.category)-CATEGORY_ORDER.indexOf(b.category)||Number(!(a.id in unlocked))-Number(!(b.id in unlocked))),[visibleAchievements,filter,unlocked]);
  return <main className="screen-root" style={{padding:'10px 16px',display:'flex',flexDirection:'column'}}>
    <header className="screen-header"><button className="screen-button secondary" onClick={onBack}>‹</button><div style={{flex:1}}><h2 className="screen-title">{t('achv_title')}</h2><small className="screen-muted">{t('achv_summary',Object.keys(unlocked).length,visibleAchievements.length)}</small></div>
      <section className="screen-panel" style={{minWidth:260,maxWidth:340,padding:'8px 14px',flex:1}}><div style={{display:'flex',justifyContent:'space-between'}}><b>{t('achv_level_line',level,t(`rank_${rank}`))}</b><b style={{color:'#E0A944'}}>{t('achv_points_line',points)}</b></div><div style={{height:6,background:'#35404a',borderRadius:8,margin:'7px 0'}}><div style={{height:6,width:`${Math.max(0,Math.min(100,(points-start)/(end-start)*100))}%`,background:'#E0A944',borderRadius:8}}/></div><small className="screen-muted">{t('achv_next_level',end-points,level+1)}</small></section>
    </header>
    <nav style={{display:'flex',gap:8,overflowX:'auto',paddingBottom:6}}><button className={`screen-chip ${filter===null?'selected':''}`} onClick={()=>setFilter(null)}>{t('achv_all')}　{Object.keys(unlocked).length}/{visibleAchievements.length}</button>{CATEGORY_ORDER.map(cat=>{const members=visibleAchievements.filter(a=>a.category===cat);return <button key={cat} className={`screen-chip ${filter===cat?'selected':''}`} onClick={()=>setFilter(cat)}>{t(categoryLabel(cat))}　{members.filter(a=>a.id in unlocked).length}/{members.length}</button>})}</nav>
    <div className="screen-scroll" style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(250px,1fr))',gap:10,alignContent:'start',flex:1,padding:'8px 0'}}>{shown.map(def=><AchievementCard key={def.id} def={def} unlockedAt={unlocked[def.id]}/>)}</div>
  </main>;
}
function AchievementCard({def,unlockedAt}:{def:AchievementDefinition;unlockedAt?:number}){
  const done=unlockedAt!==undefined,secret=!!def.hidden&&!done,accent=done?(def.legendary?'#c084fc':'#E0A944'):'#56616b',text=achievementText(def.id),progress=def.progress;
  return <article className="screen-panel" style={{height:150,padding:12,display:'flex',flexDirection:'column',background:done?`linear-gradient(130deg,${accent}30,#120F0Cee)`:'#1B1612ee',borderColor:accent}}>
    <div style={{display:'flex',alignItems:'center',gap:9}}><span style={{borderRadius:'50%',background:`${accent}44`,padding:8}}>{done?'🏆':'🔒'}</span><strong style={{flex:1}}>{secret?t('achv_category_hidden'):t(text.name)}</strong><small style={{color:accent}}>{t('achv_points_badge',def.points)}</small></div>
    <p style={{fontSize:13,color:'#C4B496',margin:'8px 0'}}>{secret?t('achv_hidden_desc'):t(text.description)}</p>
    {!secret&&text.reward&&hasString(text.reward)&&<small style={{color:done?'#F2C46B':'#8f8a7f'}}>{t('achv_reward_line',t(text.reward))}</small>}
    <div style={{flex:1}}/>{done?<small className="screen-muted">{t('achv_unlocked_on',new Date(unlockedAt!).toLocaleDateString())}</small>:progress&&<div style={{display:'flex',alignItems:'center',gap:8}}><div style={{height:5,background:'#34404b',flex:1,borderRadius:5}}><div style={{height:5,width:`${Math.min(100,progress.current/progress.target*100)}%`,background:'#E0A944'}}/></div><small>{progress.current} / {progress.target}</small></div>}
  </article>;
}
export default AchievementsScreen;

import { useEffect } from 'react';
import { useStore as useStoreForToast } from '../../lib/store';
interface ToastRepository {unannounced:AchievementRepository['unannounced'];markAnnounced:(def:AchievementDef)=>void}
export function AchievementToast({repo}:{repo:ToastRepository}){const queue=useStoreForToast(repo.unannounced);const current=queue[0];useEffect(()=>{if(!current)return;const timer=window.setTimeout(()=>repo.markAnnounced(current),3900);return()=>window.clearTimeout(timer)},[current,repo]);if(!current)return null;return <div role="status" style={{position:'fixed',top:14,left:'50%',transform:'translateX(-50%)',zIndex:50,display:'flex',gap:10,alignItems:'center',padding:'8px 16px',borderRadius:30,background:'#161d27f5',border:`1px solid ${current.legendary?'#c084fc':'#E0A944'}`,boxShadow:'0 5px 20px #0009',whiteSpace:'nowrap'}}><span>🏆</span><strong style={{color:current.legendary?'#c084fc':'#F2C46B'}}>{t('achv_banner_title')}</strong><span>{t(achievementText(current.id).name)}</span><b style={{color:current.legendary?'#c084fc':'#F2C46B'}}>{t('achv_points_badge',current.points)}</b></div>}
