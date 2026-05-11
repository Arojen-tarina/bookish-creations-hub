import { useEffect, useState } from 'react';

interface CreditsIntroProps {
  onDone: () => void;
}

export const CreditsIntro = ({ onDone }: CreditsIntroProps) => {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 1800);
    const t2 = setTimeout(() => onDone(), 5000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [onDone]);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-amber-950/30 to-slate-950" />
      <div className="relative text-center px-6 max-w-2xl">
        <div
          className={`transition-all duration-1000 ${phase === 0 ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}
          style={{ display: phase === 0 ? 'block' : 'none' }}
        >
          <p className="text-amber-300/70 text-sm uppercase tracking-[0.4em] mb-4">Pelin on keksinyt</p>
          <h1 className="text-5xl md:text-6xl font-bold text-amber-100 drop-shadow-[0_0_30px_rgba(251,191,36,0.4)]">
            Juuso Honkonen
          </h1>
        </div>
        <div
          className={`transition-all duration-1000 ${phase === 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          style={{ display: phase === 1 ? 'block' : 'none' }}
        >
          <p className="text-amber-300/70 text-sm uppercase tracking-[0.4em] mb-4">Peliä on kehittänyt eteenpäin</p>
          <h1 className="text-5xl md:text-6xl font-bold text-amber-100 drop-shadow-[0_0_30px_rgba(251,191,36,0.4)]">
            Vilho Valkeala
          </h1>
          <p className="text-amber-200/60 text-base mt-4">yhdessä Juuson kanssa</p>
        </div>
      </div>
    </div>
  );
};
