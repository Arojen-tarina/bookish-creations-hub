import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { cinzel, inter } from "../fonts";

const FACTIONS = [
  { name: "Mongolit", ruler: "Tšingis-kaani", color: "#f59e0b" },
  { name: "Jin", ruler: "Wanyan Yongji", color: "#ef4444" },
  { name: "Song", ruler: "Ningzong", color: "#22c55e" },
  { name: "Länsi-Xia", ruler: "Li Anquan", color: "#3b82f6" },
  { name: "Khwarezm", ruler: "Muhammad II", color: "#8b5cf6" },
  { name: "Kiptšakit", ruler: "Köten-kaani", color: "#ec4899" },
  { name: "Rus", ruler: "Mstislav", color: "#94a3b8" },
];

const Card = ({ f, i }: { f: typeof FACTIONS[0]; i: number }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const delay = 20 + i * 10;
  const s = spring({ frame: frame - delay, fps, config: { damping: 14, stiffness: 110 } });
  const float = Math.sin((frame + i * 20) / 30) * 4;
  return (
    <div
      style={{
        opacity: s,
        transform: `translateY(${interpolate(s, [0, 1], [60, float])}px) scale(${interpolate(s, [0, 1], [0.85, 1])})`,
        background: "rgba(15,15,30,0.85)",
        border: `2px solid ${f.color}`,
        borderRadius: 20,
        padding: "28px 24px",
        width: 220,
        textAlign: "center",
        boxShadow: `0 0 40px ${f.color}55`,
      }}
    >
      <div
        style={{
          width: 70,
          height: 70,
          borderRadius: "50%",
          background: f.color,
          margin: "0 auto 16px",
          boxShadow: `0 0 30px ${f.color}`,
        }}
      />
      <div style={{ fontFamily: cinzel, fontSize: 26, fontWeight: 700, color: "#fef3c7", marginBottom: 6 }}>
        {f.name}
      </div>
      <div style={{ fontFamily: inter, fontSize: 16, color: "#cbd5e1" }}>{f.ruler}</div>
    </div>
  );
};

export const FactionsScene = () => {
  const frame = useCurrentFrame();
  const titleS = spring({ frame, fps: 30, config: { damping: 16 } });
  const fadeOut = interpolate(frame, [290, 330], [1, 0], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", padding: 60, opacity: fadeOut }}>
      <h2
        style={{
          fontFamily: cinzel,
          fontSize: 64,
          color: "#fbbf24",
          marginBottom: 50,
          opacity: titleS,
          transform: `translateY(${interpolate(titleS, [0, 1], [-30, 0])}px)`,
          letterSpacing: 6,
        }}
      >
        SEITSEMÄN VALTAKUNTAA
      </h2>
      <div style={{ display: "flex", gap: 22, flexWrap: "wrap", justifyContent: "center", maxWidth: 1700 }}>
        {FACTIONS.map((f, i) => (
          <Card key={f.name} f={f} i={i} />
        ))}
      </div>
    </AbsoluteFill>
  );
};
