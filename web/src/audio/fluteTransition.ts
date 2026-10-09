export type NoteTransitionKind = "connected" | "repeated" | "leap";

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));
const ease = (value: number) => {
  const t = clamp01(value);
  return t * t * (3 - 2 * t);
};
const blend = (from: number, to: number, fraction: number) =>
  from + (to - from) * ease(fraction);

export function transitionDuration(noteDuration: number): number {
  return Math.min(0.09, Math.max(0.02, noteDuration * 0.15));
}

/** Short fingering and airflow gestures; the bore itself stays in the same voice. */
export function noteTransition(kind: NoteTransitionKind, elapsed: number, duration: number) {
  const dip = kind === "leap" ? 0.65 : 0.7;
  const phase = elapsed / duration;
  const breathFactor = kind === "connected"
    ? phase <= -2 / 9 ? 1
      : phase <= -1 / 9 ? blend(1, 0.85, (phase + 2 / 9) * 9)
      : phase <= 0 ? blend(0.85, 0.825, (phase + 1 / 9) * 9)
      : phase <= 1 / 6 ? blend(0.825, 1, phase * 6)
      : phase <= 11 / 30 ? blend(1, 1.28, (phase - 1 / 6) * 5)
      : phase <= 4 / 9 ? blend(1.28, 1.19, (phase - 11 / 30) * 90 / 7)
      : phase <= 5 / 9 ? 1.19
      : phase <= 2 / 3 ? blend(1.19, 1.14, (phase - 5 / 9) * 9)
      : blend(1.14, 1, (phase - 2 / 3) * 6)
    : elapsed < -0.2 * duration
    ? blend(1, dip, (elapsed + 0.4 * duration) / (0.2 * duration))
    : elapsed < 0
      ? blend(dip, 1.05, (elapsed + 0.2 * duration) / (0.2 * duration))
      : elapsed < 0.1 * duration
        ? blend(1.05, 1.08, elapsed / (0.1 * duration))
        : elapsed < 0.4 * duration
          ? blend(1.08, 0.9, (elapsed - 0.1 * duration) / (0.3 * duration))
          : blend(0.9, 1, (elapsed - 0.4 * duration) / (0.2 * duration));
  const pitchProgress = kind === "connected"
    ? ease((elapsed + 0.4 * duration) / (0.75 * duration))
    : elapsed < 0 ? 0 : 1;
  const overshootCents = kind !== "connected" || elapsed < 0.25 * duration
    ? 0 : elapsed < 0.35 * duration
      ? blend(0, 6.5, (elapsed - 0.25 * duration) / (0.1 * duration))
      : blend(6.5, 0, (elapsed - 0.35 * duration) / (0.25 * duration));
  return {
    pitchProgress,
    overshootCents,
    breathFactor,
  };
}
