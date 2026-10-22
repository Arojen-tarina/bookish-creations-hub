import type { CSSProperties, ReactNode } from 'react';
import { asset } from '../../assets';
interface BoardBackdropProps { children?: ReactNode; className?: string; style?: CSSProperties; overlay?: string; }
export function BoardBackdrop({ children, className = '', style, overlay }: BoardBackdropProps) {
  return <div className={`board-backdrop ${className}`.trim()} style={{ '--board-overlay': overlay ?? 'radial-gradient(ellipse at center, rgb(18 15 12 / 55%), rgb(18 15 12 / 92%))', ...style } as CSSProperties}>{children}</div>;
}
export default BoardBackdrop;
