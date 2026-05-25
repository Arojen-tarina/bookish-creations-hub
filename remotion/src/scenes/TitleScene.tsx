import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { cinzel, inter } from "../fonts";

export const TitleScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const titleY = spring({ frame, fps, config: { damping: 18, stiffness: 90 } });
  const subOp = interpolate(frame, [30, 60], [0, 1], { extrapolateRight: "clamp" });
  const yearOp = interpolate(frame, [70, 100], [0, 1], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [260, 300], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const scale = interpolate(frame, [0, 300], [1, 1.08]);
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: fadeOut }}>
      <div style={{ textAlign: "center", transform: `scale(${scale})` }}>
        <div
          style={{
            fontFamily: inter,
            color: "#fbbf24",
            letterSpacing: 24,
            fontSize: 28,
            opacity: yearOp,
            marginBottom: 30,
          }}
        >
          VUOSI 1206
        </div>
        <h1
          style={{
            fontFamily: cinzel,
            fontWeight: 900,
            fontSize: 160,
            color: "#fef3c7",
            margin: 0,
            transform: `translateY(${interpolate(titleY, [0, 1], [80, 0])}px)`,
            opacity: titleY,
            textShadow: "0 0 60px rgba(251,191,36,0.5)",
            letterSpacing: 4,
          }}
        >
          MONGOLIEN
        </h1>
        <h1
          style={{
            fontFamily: cinzel,
            fontWeight: 900,
            fontSize: 160,
            color: "#fbbf24",
            margin: 0,
            transform: `translateY(${interpolate(titleY, [0, 1], [80, 0])}px)`,
            opacity: titleY,
            textShadow: "0 0 60px rgba(251,191,36,0.5)",
            letterSpacing: 4,
          }}
        >
          VALTAKUNTA
        </h1>
        <div
          style={{
            fontFamily: inter,
            color: "#fde68a",
            fontSize: 32,
            marginTop: 40,
            opacity: subOp,
            fontStyle: "italic",
          }}
        >
          Strategiapeli aroilta
        </div>
      </div>
    </AbsoluteFill>
  );
};
