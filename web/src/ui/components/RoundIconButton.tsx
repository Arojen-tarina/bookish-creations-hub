import type { CSSProperties, ReactNode } from 'react';
interface RoundIconButtonProps { icon?: ReactNode; contentDescription?: string; onClick?: () => void; className?: string; size?: number; style?: CSSProperties; disabled?: boolean }
export function RoundIconButton({ icon, contentDescription, onClick, className = '', size = 44, style, disabled = false }: RoundIconButtonProps) {
  return <button aria-label={contentDescription} title={contentDescription} type="button" className={`round-icon-button ${className}`.trim()} style={{ width: size, height: size, ...style }} onClick={onClick} disabled={disabled}>{icon}</button>;
}
export default RoundIconButton;
