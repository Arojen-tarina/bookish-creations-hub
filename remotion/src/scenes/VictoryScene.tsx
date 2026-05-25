import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { cinzel, inter } from "../fonts";

const GOALS = [
  { icon: "🗺️", value: "30", label: "PROVINSSIA", sub: "Sotilasvoitto", color: "#ef4444" },
  { icon: "💰", value: "500", label: "KULTAA", sub: "Talousvoitto", color: "#f59e0b" },
  { icon: "🔬", value: "5", label: "TEKNOLOGIAA", sub: "Tiedevoitto", color: "#3b82f6" },
];

const Goal = ({ g, i }: { g: typeof GOALS[0]; i: number }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const delay = 40 + i * 30;
  const s = spring({ frame: frame - delay, fps, config: { damping: 12, stiffness: 90 } });
  const num = Math.floor(interpolate(s, [0, 1], [0, parseInt(g.value)]));
  return (
    <div
      style={{
        opacity: s,
        transform: `scale(${interpolate(s, [0, 1], [0.7, 1])})`,
        background: "rgba(10,10,25,0.9)",
        border: `2px solid ${g.color}`,
        borderRadius: 24,
        padding: "40px 50px",
        textAlign: "center",
        width: 360,
        boxShadow: `0 0 60px ${g.color}55`,
      }}
    >
      <div style={{ fontSize: 70, marginBottom: 12 }}>{g.icon}</div>
      <div style={{ fontFamily: cinzel, fontSize: 100, fontWeight: 900, color: g.color, lineHeight: 1 }}>{num}</div>
      <div style={{ fontFamily: cinzel, fontSize: 24, color: "#fef3c7", letterSpacing: 4, marginTop: 10 }}>
        {g.label}
      </div>
      <div style={{ fontFamily: inter, fontSize: 18, color: "#94a3b8", marginTop: 8 }}>{g.sub}</div>
    </div>
  );
};

export const VictoryScene = () => {
  const frame = useCurrentFrame();
  const titleS = spring({ frame, fps: 30, config: { damping: 16 } });
  const fadeOut = interpolate(frame, [260, 300], [1, 0], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: fadeOut }}>
      <h2
        style={{
          fontFamily: cinzel,
          fontSize: 64,
          color: "#fbbf24",
          marginBottom: 60,
          opacity: titleS,
          letterSpacing: 6,
        }}
      >
        KOLME TIETÄ VOITTOON
      </h2>
      <div style={{ display: "flex", gap: 40 }}>
        {GOALS.map((g, i) => (
          <Goal key={g.label} g={g} i={i} />
        ))}
      </div>
    </AbsoluteFill>
  );
};
