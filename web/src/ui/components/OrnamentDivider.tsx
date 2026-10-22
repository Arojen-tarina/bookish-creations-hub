import { useId, type CSSProperties } from 'react';
interface OrnamentDividerProps { className?: string; color?: string; style?: CSSProperties }
export function OrnamentDivider({ className = '', color = '#E0A944', style }: OrnamentDividerProps) {
  const id = useId().replace(/:/g, '');
  return <svg className={`ornament-divider ${className}`.trim()} style={{ color, ...style }} viewBox="0 0 200 10" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id={`ornament-left-${id}`}><stop stopColor="currentColor" stopOpacity="0"/><stop offset="1" stopColor="currentColor"/></linearGradient><linearGradient id={`ornament-right-${id}`}><stop stopColor="currentColor"/><stop offset="1" stopColor="currentColor" stopOpacity="0"/></linearGradient></defs><path d="M0 5H95" stroke={`url(#ornament-left-${id})`}/><path d="M105 5H200" stroke={`url(#ornament-right-${id})`}/><path d="M100 0L105 5 100 10 95 5Z" fill="currentColor"/></svg>;
}
export default OrnamentDivider;
