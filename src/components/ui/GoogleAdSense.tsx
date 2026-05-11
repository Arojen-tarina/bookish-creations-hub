import { useEffect } from 'react';

interface GoogleAdSenseProps {
  slotId: string;
  clientId?: string;
  className?: string;
}

export function GoogleAdSense({ slotId, clientId, className }: GoogleAdSenseProps) {
  useEffect(() => {
    const win = window as any;
    win.adsbygoogle = win.adsbygoogle || [];
    if (Array.isArray(win.adsbygoogle)) {
      win.adsbygoogle.push({});
    }
  }, []);

  return (
    <div className={className}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={clientId}
        data-ad-slot={slotId}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
