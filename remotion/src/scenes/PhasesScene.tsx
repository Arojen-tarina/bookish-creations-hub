import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { cinzel, inter } from "../fonts";

const PHASES = [
  { n: "1", icon: "🪙", title: "Resurssit", desc: "Kerää kultaa ja miehiä alueiltasi", color: "#f59e0b" },
  { n: "2", icon: "🃏", title: "Kortit", desc: "Nosta ja pelaa strategiakortteja", color: "#a855f7" },
  { n: "3", icon: "🐴", title: "Liikuta", desc: "Siirrä armeijoita kartalla", color: "#22c55e" },
  { n: "4", icon: "⚔️", title: "Taistelu", desc: "Hyökkää ja valloita alueita", color: "#ef4444" },
  { n: "5", icon: "🏗️", title: "Rakenna", desc: "Pystytä leirejä ja linnoituksia", color: "#3b82f6" },
  { n: "6", icon: "🏁", title: "Päätä vuoro", desc: "AI-vastustajat siirtävät", color: "#94a3b8" },
];

const Phase = ({ p, i }: { p: typeof PHASES[0]; i: number }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const delay = 30 + i * 18;
  const s = spring({ frame: frame - delay, fps, config: { damping: 15, stiffness: 100 } });
  return (
    <div
      style={{
        opacity: s,
        transform: `translateX(${interpolate(s, [0, 1], [-100, 0])}px)`,
        display: "flex",
        alignItems: "center",
        gap: 24,
        background: `linear-gradient(90deg, ${p.color}22 0%, transparent 100%)`,
        border: `1px solid ${p.color}66`,
        borderLeft: `6px solid ${p.color}`,
        borderRadius: 14,
        padding: "20px 28px",
        width: 700,
      }}
    >
      <div style={{ fontSize: 50 }}>{p.icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: cinzel, fontSize: 30, color: "#fef3c7", fontWeight: 700 }}>
          {p.n}. {p.title}
        </div>
        <div style={{ fontFamily: inter, fontSize: 20, color: "#cbd5e1", marginTop: 4 }}>{p.desc}</div>
      </div>
    </div>
  );
};

export const PhasesScene = () => {
  const frame = useCurrentFrame();
  const titleS = spring({ frame, fps: 30, config: { damping: 16 } });
  const fadeOut = interpolate(frame, [320, 360], [1, 0], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", padding: 60, opacity: fadeOut }}>
      <h2
        style={{
          fontFamily: cinzel,
          fontSize: 60,
          color: "#fbbf24",
          marginBottom: 30,
          opacity: titleS,
          letterSpacing: 6,
        }}
      >
        KUUSI VUOROVAIHETTA
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {PHASES.map((p, i) => (
          <Phase key={p.n} p={p} i={i} />
        ))}
      </div>
    </AbsoluteFill>
  );
};
