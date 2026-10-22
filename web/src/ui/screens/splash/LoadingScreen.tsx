import { useEffect, useRef, useState } from 'react';
import { t, useLocale } from '../../../i18n';
import { asset } from '../../../assets';
import { Emblem } from '../Emblem';
import '../screens.css';

export interface LoadingScreenProps { onFinished: () => void; preload?: () => Promise<void> }
const EMPTY_PRELOAD = async () => {}; 
export function LoadingScreen({ onFinished, preload = EMPTY_PRELOAD }: LoadingScreenProps) {
  const locale = useLocale();
  const finishedRef = useRef(onFinished);
  const preloadRef = useRef(preload);
  finishedRef.current = onFinished;
  preloadRef.current = preload;
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    let active = true;
    const started = Date.now();
    const timer = window.setInterval(() => { if (active) setProgress(Math.min(.85, (Date.now() - started) / 1600 * .85)); }, 30);
    Promise.all([preloadRef.current(), new Promise(resolve => window.setTimeout(resolve, 700))]).then(() => {
      const remaining = Math.max(0, 1600 - (Date.now() - started));
      window.setTimeout(() => { if (active) { setProgress(1); finishedRef.current(); } }, remaining);
    }).catch(() => { if (active) { setProgress(1); finishedRef.current(); } });
    return () => { active = false; window.clearInterval(timer); };
  }, []);
  return <main className="screen-root" data-locale={locale} style={{display:'grid',placeItems:'center',textAlign:'center',backgroundImage:`linear-gradient(#120F0Cb8,#120F0Ce6),url(${asset('board_map.jpg')})`}}>
    <section style={{padding:24}}><Emblem size={96} style={{animation:'screen-spin 24s linear infinite'}}/><h1 className="screen-title" style={{fontSize:'clamp(28px,5vw,52px)',letterSpacing:3,margin:'8px 0'}}>{t('app_name').toUpperCase()}</h1><div style={{color:'#A8772A'}}>✦ ━━━━━━━━━━━━━ ✦</div><p className="screen-muted">{t('splash_subtitle')}</p><div style={{width:240,maxWidth:'70vw',height:6,background:'#26313b',borderRadius:8,margin:'28px auto 8px',overflow:'hidden'}}><div style={{height:'100%',width:`${progress*100}%`,background:'linear-gradient(90deg,#89651f,#F2C46B)',transition:'width .15s'}}/></div><small className="screen-muted">{t('common_loading')}</small></section>
    <style>{'@keyframes screen-spin{to{transform:rotate(360deg)}}'}</style>
  </main>;
}
