import type { CSSProperties, ReactNode } from 'react';

export const GameButtonStyle = { Primary: 'Primary', Secondary: 'Secondary' } as const;
export type GameButtonStyle = (typeof GameButtonStyle)[keyof typeof GameButtonStyle];
interface GameButtonProps {
  text?: string;
  children?: ReactNode;
  onClick?: () => void;
  className?: string;
  style?: CSSProperties;
  variant?: GameButtonStyle;
  buttonStyle?: GameButtonStyle;
  enabled?: boolean;
  disabled?: boolean;
  compact?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

export function GameButton({ text, children, onClick, className = '', style, variant, buttonStyle, enabled = true, disabled, compact = false, type = 'button' }: GameButtonProps) {
  const secondary = (variant ?? buttonStyle) === 'Secondary';
  const inactive = disabled ?? !enabled;
  return <button type={type} className={`game-button ${secondary ? 'game-button-secondary' : 'game-button-primary'} ${compact ? 'game-button-compact' : ''} ${className}`.trim()} style={style} disabled={inactive} onClick={onClick}>{children ?? text}</button>;
}
export default GameButton;
