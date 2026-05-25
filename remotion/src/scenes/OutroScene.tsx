import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { cinzel, inter } from "../fonts";

export const OutroScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s1 = spring({ frame, fps, config: { damping: 16 } });
  const s2 = spring({ frame: frame - 40, fps, config: { damping: 16 } });
  const s3 = spring({ frame: frame - 90, fps, config: { damping: 14 } });
  const pulse = 1 + Math.sin(frame / 8) * 0.03;
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            fontFamily: inter,
            color: "#fbbf24aa",
            letterSpacing: 12,
            fontSize: 26,
            opacity: s1,
            marginBottom: 30,
          }}
        >
          ARMEIJASI ODOTTAA
        </div>
        <h1
          style={{
            fontFamily: cinzel,
            fontWeight: 900,
            fontSize: 180,
            color: "#fef3c7",
            margin: 0,
            opacity: s2,
            transform: `translateY(${interpolate(s2, [0, 1], [40, 0])}px) scale(${pulse})`,
            textShadow: "0 0 80px rgba(251,191,36,0.6)",
            letterSpacing: 8,
          }}
        >
          ALOITA
        </h1>
        <div
          style={{
            fontFamily: inter,
            color: "#fde68a",
            fontSize: 28,
            marginTop: 50,
            opacity: s3,
            fontStyle: "italic",
          }}
        >
          Pelin keksi Juuso Honkonen — kehittänyt Vilho Valkeala
        </div>
      </div>
    </AbsoluteFill>
  );
};
