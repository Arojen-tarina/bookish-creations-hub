import { AbsoluteFill, useCurrentFrame } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { TitleScene } from "./scenes/TitleScene";
import { CreatorsScene } from "./scenes/CreatorsScene";
import { FactionsScene } from "./scenes/FactionsScene";
import { PhasesScene } from "./scenes/PhasesScene";
import { VictoryScene } from "./scenes/VictoryScene";
import { OutroScene } from "./scenes/OutroScene";

const Background = () => {
  const frame = useCurrentFrame();
  const drift = Math.sin(frame / 90) * 30;
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse at ${30 + drift}% ${20 + drift / 2}%, rgba(251,191,36,0.18) 0%, transparent 55%),
                     radial-gradient(ellipse at ${70 - drift}% ${80 - drift / 2}%, rgba(180,83,9,0.15) 0%, transparent 55%),
                     linear-gradient(135deg, #0a0a1a 0%, #1a0f05 50%, #0a0a1a 100%)`,
      }}
    />
  );
};

const Vignette = () => (
  <AbsoluteFill
    style={{
      pointerEvents: "none",
      background: "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.7) 100%)",
    }}
  />
);

export const MainVideo = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0a1a", fontFamily: "sans-serif" }}>
      <Background />
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={300}>
          <TitleScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 20 })} />
        <TransitionSeries.Sequence durationInFrames={300}>
          <CreatorsScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 20 })} />
        <TransitionSeries.Sequence durationInFrames={330}>
          <FactionsScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 20 })} />
        <TransitionSeries.Sequence durationInFrames={360}>
          <PhasesScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 20 })} />
        <TransitionSeries.Sequence durationInFrames={300}>
          <VictoryScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 20 })} />
        <TransitionSeries.Sequence durationInFrames={310}>
          <OutroScene />
        </TransitionSeries.Sequence>
      </TransitionSeries>
      <Vignette />
    </AbsoluteFill>
  );
};
