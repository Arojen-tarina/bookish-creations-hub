import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
interface WordFitTextProps { text?: string; children?: ReactNode; className?: string; style?: CSSProperties; maxLines?: number }

/** Shrinks long words just enough to fit the available width without inserting mid-word breaks. */
export function WordFitText({ text, children, className = '', style, maxLines = 2 }: WordFitTextProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [fontSize, setFontSize] = useState<number | null>(null);
  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    const fit = () => {
      const width = element.clientWidth;
      if (!width) return;
      const computed = getComputedStyle(element);
      const size = parseFloat(computed.fontSize);
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context || !size) return;
      context.font = computed.font;
      const widest = (element.textContent ?? '').split(/\s+/).reduce((max, word) => Math.max(max, context.measureText(word).width), 0);
      setFontSize(widest > width * 0.92 ? size * (width * 0.92 / widest) : null);
    };
    fit();
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(fit) : null;
    observer?.observe(element);
    window.addEventListener('resize', fit);
    return () => { observer?.disconnect(); window.removeEventListener('resize', fit); };
  }, [text, children, style]);
  return <span ref={ref} className={`word-fit-text ${className}`.trim()} style={{ ...style, ...(fontSize ? { fontSize: `${fontSize}px` } : {}), display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: maxLines, overflow: 'hidden', overflowWrap: 'normal', wordBreak: 'normal' } as CSSProperties}>{children ?? text}</span>;
}
export default WordFitText;
