import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { cinzel, inter } from "../fonts";

const Credit = ({ label, name, delay }: { label: string; name: string; delay: number }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 16, stiffness: 100 } });
  const op = interpolate(s, [0, 1], [0, 1]);
  const y = interpolate(s, [0, 1], [40, 0]);
  return (
    <div style={{ textAlign: "center", opacity: op, transform: `translateY(${y}px)`, marginBottom: 70 }}>
      <div style={{ fontFamily: inter, color: "#fbbf24aa", letterSpacing: 8, fontSize: 22, marginBottom: 16 }}>
        {label}
      </div>
      <div
        style={{
          fontFamily: cinzel,
          fontWeight: 700,
          fontSize: 88,
          color: "#fef3c7",
          textShadow: "0 0 40px rgba(251,191,36,0.4)",
        }}
      >
        {name}
      </div>
    </div>
  );
};

export const CreatorsScene = () => {
  const frame = useCurrentFrame();
  const fadeOut = interpolate(frame, [260, 300], [1, 0], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: fadeOut }}>
      <div>
        <Credit label="PELIN ON KEKSINYT" name="Juuso Honkonen" delay={0} />
        <Credit label="KEHITTÄNYT ETEENPÄIN" name="Vilho Valkeala" delay={100} />
      </div>
    </AbsoluteFill>
  );
};
