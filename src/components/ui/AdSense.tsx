import { useEffect } from 'react';
import type { CSSProperties } from 'react';

declare global {
  interface Window {
    adsbygoogle?: Array<Record<string, unknown>>;
  }
}

interface GoogleAdSenseProps {
  clientId: string;
  slotId: string;
  className?: string;
  style?: CSSProperties;
}

export function GoogleAdSense({ clientId, slotId, className, style }: GoogleAdSenseProps) {
  useEffect(() => {
    const existingScript = document.querySelector('script[src^="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]');

    function pushAd() {
      window.adsbygoogle = window.adsbygoogle || [];
      try {
        window.adsbygoogle.push({});
      } catch (error) {
        console.warn('AdSense push failed:', error);
      }
    }

    if (!existingScript) {
      const script = document.createElement('script');
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`;
      script.async = true;
      script.crossOrigin = 'anonymous';
      script.onload = pushAd;
      document.head.appendChild(script);
    } else {
      pushAd();
    }
  }, [clientId]);

  return (
    <ins
      className={`adsbygoogle ${className ?? ''}`}
      style={style ?? { display: 'block' }}
      data-ad-client={clientId}
      data-ad-slot={slotId}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
}
