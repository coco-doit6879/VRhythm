import { noteTransition, transitionDuration, type NoteTransitionKind } from "./fluteTransition.ts";

const semitones: Record<string, number> = {
  C: 0,
  D: 2,
  E: 4,
  F: 5,
  G: 7,
  A: 9,
  B: 11,
};
function pitchFrequency(pitch: string): number {
  const match = /^([A-G])([#b]?)([0-8])$/.exec(pitch);
  if (!match) throw new Error(`Cao độ không hợp lệ: ${pitch}`);
  const midi =
    (Number(match[3]) + 1) * 12 +
    semitones[match[1]] +
    (match[2] === "#" ? 1 : match[2] === "b" ? -1 : 0);
  return 440 * 2 ** ((midi - 69) / 12);
}
const G5_FREQUENCY = pitchFrequency("G5");

/** Controls are normalized to 0–1 unless a unit is stated explicitly. */
export type FluteArticulation =
  | "normal"
  | "tongued"
  | "legato"
  | "accent"
  | "vibrato"
  | "bend"
  | "overblow";
export type FluteNoteOptions = {
  breathPressure?: number;
  vibrato?: number;
  articulation?: FluteArticulation;
  bendCents?: number;
  toneHoleOpenness?: number;
  attack?: number;
  release?: number;
  /** End the phrase at this note's sounding duration (used for staccato gaps). */
  detached?: boolean;
};
export type FluteSequenceNote = {
  note: string;
  duration: number;
  start?: number;
  options?: FluteNoteOptions;
};
export type FlutePlayback = { startTime: number; duration: number };
export type FlutePhraseDynamics = {
  fromNote: number;
  toNote: number;
  /** Four relative breath-pressure multipliers from phrase onset to release. */
  pressure: [number, number, number, number];
};
export type FluteSequenceOptions = { phraseDynamics?: FlutePhraseDynamics[] };
/** Optional measurement hook for A/B renders; omitted in normal playback. */
export type FluteRenderTrace = {
  sampleIndex: number;
  time: number;
  currentNote: string;
  sourceNote: string | null;
  destinationNote: string | null;
  transitionKind: NoteTransitionKind | null;
  transitionDuration: number;
  pitchProgress: number;
  overshootCents: number;
  targetFrequency: number;
  soundingFrequency: number;
  naturalBreathTarget: number;
  breathTarget: number;
  smoothedBreath: number;
  breathFactor: number;
  effectiveBreath: number;
  envelope: number;
  phrasePressure: number;
  boreReturn: number;
  edgeFlow: number;
  destinationTransient: number;
  radiation: number;
  outputGainMultiplier: number;
  rawSample: number;
  pcmSample: number;
  limiterGain: number;
};
export type FluteRenderProbe = {
  transitionEnabled?: boolean;
  /** Diagnostic A/B only: bypasses the added low/mid-register body partials. */
  harmonicBodyEnabled?: boolean;
  /** Diagnostic A/B only: bypasses the narrow G5 bore-body emphasis. */
  g5ResonanceEnabled?: boolean;
  captureSamples?: ReadonlySet<number>;
  onSample?: (sample: FluteRenderTrace) => void;
};

/** Vietnamese transverse bamboo flute: deliberately no dimo/membrane resonator. */
export const VietnameseSaoTrucPreset = Object.freeze({
  instrument: "VietnameseSaoTruc",
  excitation: "edge_tone_air_jet",
  bore: "approximately_cylindrical_bamboo",
  membrane: false,
  reflection: -0.90,
  boreCutoffHarmonics: 5,
  breathNoise: 0.1,
});

type PreparedNote = Required<
  Pick<FluteSequenceNote, "note" | "duration" | "start">
> & {
  index: number;
  frequency: number;
  options: Required<FluteNoteOptions>;
};

function transitionKind(from: PreparedNote, to: PreparedNote): NoteTransitionKind {
  if (from.frequency === to.frequency) return "repeated";
  if (to.options.articulation === "tongued" || to.options.articulation === "accent" ||
    Math.abs(12 * Math.log2(to.frequency / from.frequency)) > 7) return "leap";
  return "connected";
}

const DEFAULT_OPTIONS: Required<FluteNoteOptions> = {
  breathPressure: 0.45,
  vibrato: 0.1,
  articulation: "normal",
  bendCents: 0,
  toneHoleOpenness: 0,
  attack: 0.045,
  release: 0.07,
  detached: false,
};
const MAX_SECONDS = 120;
export const SAO_TRUC_SAMPLE_RATE = 44100;
const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

function prepare(notes: FluteSequenceNote[]): {
  notes: PreparedNote[];
  duration: number;
} {
  if (!Array.isArray(notes) || notes.length === 0)
    throw new Error("Cần ít nhất một nốt sáo.");
  let cursor = 0;
  let repeated = 0;
  const prepared = notes.map((event, index) => {
    const frequency = pitchFrequency(event.note);
    if (frequency < pitchFrequency("C4") || frequency > pitchFrequency("C7")) {
      throw new Error(`Nốt ${event.note} nằm ngoài âm vực C4–C7.`);
    }
    if (!Number.isFinite(event.duration) || event.duration <= 0)
      throw new Error(`Trường độ nốt ${index + 1} không hợp lệ.`);
    const start = event.start ?? cursor;
    if (!Number.isFinite(start) || start < 0)
      throw new Error(`Thời điểm nốt ${index + 1} không hợp lệ.`);
    const previous = index > 0 ? notes[index - 1] : undefined;
    repeated = previous?.note === event.note && start - cursor <= 0.09 ? repeated + 1 : 0;
    const automaticArticulation: FluteArticulation = repeated === 0 ? "normal" :
      repeated % 4 === 1 ? "tongued" : repeated % 4 === 2 ? "legato" :
      repeated % 4 === 3 ? "accent" : "normal";
    const options = { ...DEFAULT_OPTIONS, articulation: automaticArticulation, ...event.options };
    for (const key of [
      "breathPressure",
      "vibrato",
      "toneHoleOpenness",
    ] as const) {
      if (
        !Number.isFinite(options[key]) ||
        options[key] < 0 ||
        options[key] > 1
      )
        throw new Error(`${key} phải nằm trong khoảng 0–1.`);
    }
    if (
      !Number.isFinite(options.bendCents) ||
      Math.abs(options.bendCents) > 200
    )
      throw new Error("bendCents phải nằm trong khoảng ±200.");
    if (
      !Number.isFinite(options.attack) ||
      options.attack < 0 ||
      options.attack > 1 ||
      !Number.isFinite(options.release) ||
      options.release < 0 ||
      options.release > 1
    )
      throw new Error("Attack/release không hợp lệ.");
    if (typeof options.detached !== "boolean")
      throw new Error("detached phải là boolean.");
    if (
      !(
        ["normal", "tongued", "legato", "accent", "vibrato", "bend", "overblow"] as const
      ).includes(options.articulation)
    ) {
      throw new Error("Kiểu thổi không hợp lệ.");
    }
    cursor = Math.max(cursor, start + event.duration);
    return {
      index,
      note: event.note,
      duration: event.duration,
      start,
      frequency,
      options,
    };
  });
  const duration = Math.max(
    ...prepared.map(
      (note) => note.start + note.duration + note.options.release,
    ),
  );
  if (duration > MAX_SECONDS)
    throw new Error(`Bản thử không được dài quá ${MAX_SECONDS} giây.`);
  return { notes: prepared, duration };
}

type PreparedPhrase = {
  fromNote: number;
  toNote: number;
  start: number;
  end: number;
  pressure: [number, number, number, number];
};
const DEFAULT_PHRASE_PRESSURE: [number, number, number, number] = [
  0.86, 1, 1.07, 0.82,
];

function preparePhrases(
  notes: PreparedNote[],
  options: FluteSequenceOptions,
): PreparedPhrase[] {
  const overrides = [...(options.phraseDynamics ?? [])].sort(
    (a, b) => a.fromNote - b.fromNote,
  );
  for (const [index, curve] of overrides.entries()) {
    if (
      !Number.isInteger(curve.fromNote) ||
      !Number.isInteger(curve.toNote) ||
      curve.fromNote < 0 ||
      curve.toNote < curve.fromNote ||
      curve.toNote >= notes.length ||
      !Array.isArray(curve.pressure) ||
      curve.pressure.length !== 4 ||
      curve.pressure.some(
        (value) => !Number.isFinite(value) || value < 0 || value > 1.5,
      )
    ) {
      throw new Error(`Đường hơi thở của câu ${index + 1} không hợp lệ.`);
    }
    if (index > 0 && curve.fromNote <= overrides[index - 1].toNote)
      throw new Error("Các câu trong phraseDynamics không được chồng nhau.");
  }
  const phrases: PreparedPhrase[] = [];
  let first = 0;
  while (first < notes.length) {
    const override = overrides.find((curve) => curve.fromNote === first);
    const nextOverride = overrides.find((curve) => curve.fromNote > first);
    let last = override?.toNote ?? first;
    if (!override) {
      while (
        last + 1 < notes.length &&
        last - first < 7 &&
        last + 1 !== nextOverride?.fromNote &&
        !notes[last].options.detached &&
        notes[last + 1].start - (notes[last].start + notes[last].duration) <=
          0.09 &&
        notes[last + 1].start - notes[first].start < 3.5
      )
        last++;
    }
    phrases.push({
      fromNote: first,
      toNote: last,
      start: notes[first].start,
      end: notes[last].start + notes[last].duration,
      pressure: override?.pressure ?? DEFAULT_PHRASE_PRESSURE,
    });
    first = last + 1;
  }
  return phrases;
}

function phrasePressure(phrase: PreparedPhrase, time: number): number {
  const progress =
    clamp(
      (time - phrase.start) / Math.max(0.001, phrase.end - phrase.start),
      0,
      1,
    ) * 3;
  const index = Math.min(2, Math.floor(progress));
  return (
    phrase.pressure[index] +
    (phrase.pressure[index + 1] - phrase.pressure[index]) * (progress - index)
  );
}

class FractionalDelay {
  private readonly buffer: Float32Array;
  private cursor = 0;
  constructor(maxLength: number) {
    this.buffer = new Float32Array(Math.ceil(maxLength) + 4);
  }
  read(delay: number): number {
    const position =
      (this.cursor -
        clamp(delay, 1, this.buffer.length - 3) +
        this.buffer.length) %
      this.buffer.length;
    const first = Math.floor(position);
    const fraction = position - first;
    return (
      this.buffer[first] * (1 - fraction) +
      this.buffer[(first + 1) % this.buffer.length] * fraction
    );
  }
  write(value: number) {
    this.buffer[this.cursor] = value;
    this.cursor = (this.cursor + 1) % this.buffer.length;
  }
}

/** One self-oscillating jet/bore voice. All sound is generated here; there are no sample assets or wavetable oscillators. */
class WaveguideVoice {
  private readonly bore: FractionalDelay;
  private readonly sampleRate: number;
  private reflectionMemory = 0;
  private dcInput = 0;
  private dcOutput = 0;
  private noiseState = 0x126ab21;
  private noiseMemory = 0;
  private noiseLow = 0;
  private radiationOne = 0;
  private radiationTwo = 0;
  private harmonicDc = 0;
  private frequencyMemory: number;
  private breathMemory = 0;
  private driftTarget = 0;
  private driftMemory = 0;
  private breathDriftTarget = 0;
  private breathDriftMemory = 0;
  private activeNote: PreparedNote | undefined;
  private transitionBreath = 0;
  private lastEnvelope = 0;
  private connectedEnvelope: number | undefined;

  constructor(sampleRate: number, note: PreparedNote) {
    this.sampleRate = sampleRate;
    this.frequencyMemory = note.frequency;
    this.bore = new FractionalDelay(sampleRate / pitchFrequency("C4") + 8);
  }

  tick(
    sampleIndex: number,
    note: PreparedNote,
    phrase: PreparedPhrase,
    previous: PreparedNote | undefined,
    next: PreparedNote | undefined,
    probe: FluteRenderProbe | undefined,
  ): number {
    const { options, frequency } = note;
    const time = sampleIndex / this.sampleRate;
    const noteTime = Math.max(0, time - note.start);
    if (this.activeNote !== note) {
      this.transitionBreath = this.breathMemory;
      this.connectedEnvelope = previous && note.index > phrase.fromNote &&
        note.start - (previous.start + previous.duration) <= 0.02 &&
        probe?.transitionEnabled !== false && transitionKind(previous, note) === "connected"
        ? this.lastEnvelope : undefined;
      this.activeNote = note;
    }
    const incomingDuration = previous && note.index > phrase.fromNote &&
      note.start - (previous.start + previous.duration) <= 0.02
      ? transitionDuration(Math.min(previous.duration, note.duration)) : 0;
    const outgoingDuration = next && next.index <= phrase.toNote &&
      next.start - (note.start + note.duration) <= 0.02
      ? transitionDuration(Math.min(note.duration, next.duration)) : 0;
    const incomingKind = previous && incomingDuration > 0 &&
      probe?.transitionEnabled !== false ? transitionKind(previous, note) : undefined;
    const incoming = previous && noteTime < incomingDuration *
      (incomingKind === "connected" ? 5 / 6 : 0.6)
      ? { from: previous, to: note, elapsed: noteTime, duration: incomingDuration }
      : undefined;
    const outgoing = next && time >= next.start - outgoingDuration * 0.4
      ? { from: note, to: next, elapsed: time - next.start, duration: outgoingDuration }
      : undefined;
    const gesture = probe?.transitionEnabled === false ? undefined : incoming ?? outgoing;
    const kind = gesture && transitionKind(gesture.from, gesture.to);
    const transition = gesture && kind
      ? noteTransition(kind, gesture.elapsed, gesture.duration) : undefined;
    const register = clamp(Math.log2(frequency / pitchFrequency("C4")), 0, 3);
    const lowRegister = clamp(1 - register, 0, 1);
    const highRegister = clamp(register - 1.55, 0, 1);
    const firstInPhrase = note.start === phrase.start;
    const articulation = options.articulation;
    const attack = (articulation === "tongued" ? Math.min(options.attack, 0.018) :
      articulation === "accent" ? Math.min(options.attack, 0.028) : options.attack) *
      (1 - 0.25 * highRegister);
    const release = clamp(
      1 - (time - phrase.end) / Math.max(0.002, options.release),
      0,
      1,
    );
    const attackTime = Math.max(0.008, attack);
    const peak = articulation === "accent" ? 1.24 : articulation === "tongued" ? 1.17 : 1.12;
    const sustain = articulation === "legato" ? 0.9 : articulation === "accent" ? 0.79 : 0.82;
    const startLevel = firstInPhrase ? 0 : articulation === "legato" ? 0.93 :
      articulation === "tongued" ? 0.48 : 0.72;
    const rise = clamp(noteTime / attackTime, 0, 1);
    const riseSmooth = rise * rise * (3 - 2 * rise);
    const decay = clamp((noteTime - attackTime) / 0.12, 0, 1);
    const decaySmooth = decay * decay * (3 - 2 * decay);
    const noteEnvelope = this.connectedEnvelope ?? ((incoming && kind === "repeated") ||
      (articulation === "legato" && !firstInPhrase) ?
      0.93 + 0.04 * Math.exp(-noteTime * 18) :
      noteTime < attackTime ? startLevel + (peak - startLevel) * riseSmooth :
      peak + (sustain - peak) * decaySmooth);
    const envelope = noteEnvelope * release;
    this.lastEnvelope = envelope;
    const vibratoDepth =
      options.articulation === "vibrato"
        ? Math.max(0.35, options.vibrato)
        : options.vibrato;
    const vibratoEntrance = clamp((noteTime - 0.13) / 0.3, 0, 1);
    const vibrato =
      Math.sin(
        2 * Math.PI * 5.1 * noteTime +
          0.13 * Math.sin(2 * Math.PI * 0.67 * time),
      ) *
      vibratoDepth *
      vibratoEntrance;
    if (sampleIndex % Math.round(this.sampleRate / 16) === 0) {
      this.driftTarget = (this.nextNoise() * 2 - 1) * 3;
      this.breathDriftTarget = (this.nextNoise() * 2 - 1) * 0.045;
    }
    this.breathDriftMemory +=
      (1 - Math.exp(-1 / (this.sampleRate * 0.24))) *
      (this.breathDriftTarget - this.breathDriftMemory);
    const naturalBreath =
      options.breathPressure *
      phrasePressure(phrase, time) *
      envelope *
      (1 + 0.025 * vibrato + this.breathDriftMemory);
    const targetBreath = incoming && transition
      ? this.transitionBreath +
        (naturalBreath - this.transitionBreath) * clamp(noteTime / (incoming.duration * 0.6), 0, 1)
      : naturalBreath;
    this.breathMemory +=
      (1 - Math.exp(-1 / (this.sampleRate * 0.016))) *
      (targetBreath - this.breathMemory);
    const breath = this.breathMemory * (transition?.breathFactor ?? 1);
    this.driftMemory +=
      (1 - Math.exp(-1 / (this.sampleRate * 0.22))) *
      (this.driftTarget - this.driftMemory);
    const pressureCents = (breath - 0.65) * 22;
    const pitchCents =
      options.bendCents + pressureCents + vibrato * 18 + this.driftMemory;
    const targetFrequency = frequency * 2 ** (pitchCents / 1200);
    if (gesture && kind === "connected" && transition) {
      const sharedCents = pitchCents - options.bendCents;
      const fromFrequency = gesture.from.frequency *
        2 ** ((sharedCents + gesture.from.options.bendCents) / 1200);
      const toFrequency = gesture.to.frequency *
        2 ** ((sharedCents + gesture.to.options.bendCents + transition.overshootCents) / 1200);
      this.frequencyMemory = fromFrequency +
        (toFrequency - fromFrequency) * transition.pitchProgress;
    } else if (gesture && kind === "leap" && gesture.elapsed >= 0 &&
      gesture.elapsed < 1 / this.sampleRate) {
      this.frequencyMemory = targetFrequency;
    } else {
      this.frequencyMemory +=
        (1 - Math.exp(-1 / (this.sampleRate * 0.013))) *
        (targetFrequency - this.frequencyMemory);
    }
    const soundingFrequency = this.frequencyMemory;
    const overblown = options.articulation === "overblow";
    // A lossy, sign-inverting round trip selects the fundamental rather than a shorter upper mode.
    const phaseCompensation =
      2.12 - 0.05 * clamp((soundingFrequency - 1000) / 1093, 0, 1);
    const boreLength =
      this.sampleRate /
      (soundingFrequency * phaseCompensation * (overblown ? 2 : 1));
    // An open hole shortens the effective column and leaks energy. It is not a membrane resonator.
    const hole = options.toneHoleOpenness;
    const delayLength = boreLength * (1 - 0.055 * hole);

    // Broadband air turbulence plus a short tongued transient at the embouchure.
    const white = this.nextNoise() * 2 - 1;
    this.noiseMemory += 0.5 * (white - this.noiseMemory);
    this.noiseLow += 0.045 * (this.noiseMemory - this.noiseLow);
    const noise =
      (this.noiseMemory - this.noiseLow) *
      VietnameseSaoTrucPreset.breathNoise *
      breath * (1 + 0.25 * lowRegister - 0.1 * highRegister);
    const transientPhase = incoming && kind === "connected"
      ? (noteTime / incoming.duration - 2 / 15) / (23 / 45)
      : -1;
    const destinationTransient = transientPhase > 0 && transientPhase < 1
      ? 0.07 * Math.sin(Math.PI * transientPhase) ** 2 : 0;
    const returning = this.bore.read(delayLength);
    const destinationFeedback = 0.5 * clamp((0.04 - noteTime) / 0.015, 0, 1);
    // A brief, feedback-coupled jet disturbance brightens the destination
    // without a DC shove; its feedback component fades after the onset so
    // the destination resonance can carry the note instead of notching it.
    const transient =
      this.connectedEnvelope !== undefined
        ? destinationTransient * (this.noiseMemory - this.noiseLow + destinationFeedback * returning) :
      articulation === "tongued" && kind === "repeated" ?
        Math.exp(-noteTime * 70) * 0.005 :
      articulation === "tongued" ? Math.exp(-noteTime * 65) * 0.16 :
      articulation === "accent" ? Math.exp(-noteTime * 42) * 0.18 :
      articulation === "legato" ? Math.exp(-noteTime * 70) * 0.005 :
      Math.exp(-noteTime * 35) * 0.08;
    const reflection =
      VietnameseSaoTrucPreset.reflection * returning * (1 - 0.12 * hole);
    // Keep the jet offset inside its oscillating range. Larger pressure still
    // changes drive, turbulence, pitch and radiation, without quenching the bore.
    const jetBias = 0.3 * Math.min(breath, 0.65);
    const edgeInput = jetBias + reflection + 0.12 * noise + transient;
    const edgeFlow = Math.tanh(3 * edgeInput) - Math.tanh(3 * jetBias);
    // Frequency-dependent wall/radiation loss discourages shrill upper bore modes.
    const cutoff = Math.min(
      VietnameseSaoTrucPreset.boreCutoffHarmonics *
        soundingFrequency *
        (0.92 + 0.15 * breath) *
        (1 - 0.16 * lowRegister + 0.1 * highRegister + 0.12 * this.breathDriftMemory),
      9000,
    );
    const loss = 1 - Math.exp((-2 * Math.PI * cutoff) / this.sampleRate);
    this.reflectionMemory += loss * (edgeFlow - this.reflectionMemory);
    this.bore.write(
      (0.35 + 0.26 * breath) * this.reflectionMemory + 0.018 * noise,
    );
    const radiated = returning;
    // Remove DC generated by asymmetric jet pressure without flattening the waveform.
    const signal = radiated + 0.12 * noise;
    const highPassed = signal - this.dcInput + 0.995 * this.dcOutput;
    this.dcInput = signal;
    this.dcOutput = highPassed;
    const radiationCutoff = clamp(
      soundingFrequency * (3.1 + 0.6 * breath) *
        (1 - 0.13 * lowRegister + 0.1 * highRegister),
      2200,
      5000,
    );
    const radiationLoss =
      1 - Math.exp((-2 * Math.PI * radiationCutoff) / this.sampleRate);
    this.radiationOne += radiationLoss * (highPassed - this.radiationOne);
    this.radiationTwo +=
      radiationLoss * (this.radiationOne - this.radiationTwo);
    const radiatedFlow = clamp(breath / 0.65, 0, 1.5) ** 1.5;
    const radiation = 0.65 * this.radiationOne + 0.35 * this.radiationTwo;
    const squared = radiation * radiation;
    this.harmonicDc += (1 - Math.exp(-2 * Math.PI * 60 / this.sampleRate)) *
      (squared - this.harmonicDc);
    const bodyFocus = probe?.harmonicBodyEnabled === false ? 0 :
      clamp((2 - register) / 0.55, 0, 1);
    // A narrow, smooth fingering-dependent body emphasis: G5 opens up without
    // applying the same spectrum to F5/A5 or raising broadband brightness.
    const g5Distance = Math.abs(12 * Math.log2(soundingFrequency / G5_FREQUENCY));
    const g5Proximity = clamp(1 - g5Distance / 1.5, 0, 1);
    const g5Focus = probe?.g5ResonanceEnabled === false || bodyFocus === 0 ? 0 :
      g5Proximity * g5Proximity * (3 - 2 * g5Proximity);
    const harmonicDrive = 0.4 * (1 - lowRegister) +
      3.1 * Math.max(0, 1 - Math.abs(register - 2)) + 5.5 * highRegister +
      2.5 * bodyFocus + 1.0 * g5Focus;
    const thirdBodyFocus = clamp(1 - Math.abs(register - 1.58) / 0.32, 0, 1);
    const cubicDrive = 5.5 * bodyFocus * (1 + 3 * thirdBodyFocus) + 4.0 * g5Focus;
    const cubicBody = -cubicDrive *
      (radiation * squared - 1.5 * this.harmonicDc * radiation);
    const registerHarmonics = harmonicDrive * (squared - this.harmonicDc) + cubicBody;
    const attackContour = Math.exp(-(((noteTime - 0.14) / 0.09) ** 2));
    const attackLift = articulation === "legato" && !firstInPhrase ? 0 :
      (firstInPhrase ? 0.45 + 0.3 * lowRegister - 0.18 * highRegister :
        articulation === "accent" ? 0.35 : 0.2) * attackContour;
    const accentLift = articulation === "accent" ?
      0.4 * Math.exp(-(((noteTime - 0.07) / 0.055) ** 2)) : 0;

    const outputGainMultiplier = 0.9 * radiatedFlow *
      (1 + 0.08 * lowRegister - 0.13 * highRegister) *
      (1 + attackLift + accentLift);
    // Redistribute a little core energy into bore-derived partials rather than
    // making connected-note accents louder just because the spectrum is fuller.
    const coreTrim = 0.06 * bodyFocus *
      (1 - clamp((noteTime - 0.025) / 0.055, 0, 1));
    const boreCore = radiation * (1 - coreTrim);
    const rawSample = (boreCore + registerHarmonics) * outputGainMultiplier;
    if (probe?.captureSamples?.has(sampleIndex) && probe.onSample) {
      const storedRaw = Math.fround(rawSample);
      const pcmSample = Math.fround(Math.tanh(storedRaw));
      probe.onSample({
        sampleIndex, time, currentNote: note.note,
        sourceNote: gesture?.from.note ?? null,
        destinationNote: gesture?.to.note ?? null,
        transitionKind: kind ?? null,
        transitionDuration: gesture?.duration ?? 0,
        pitchProgress: transition?.pitchProgress ?? 0,
        overshootCents: transition?.overshootCents ?? 0,
        targetFrequency, soundingFrequency,
        naturalBreathTarget: naturalBreath, breathTarget: targetBreath,
        smoothedBreath: this.breathMemory,
        breathFactor: transition?.breathFactor ?? 1,
        effectiveBreath: breath, envelope,
        phrasePressure: phrasePressure(phrase, time),
        boreReturn: returning, edgeFlow, radiation, destinationTransient,
        outputGainMultiplier, rawSample: storedRaw, pcmSample,
        limiterGain: storedRaw === 0 ? 1 : pcmSample / storedRaw,
      });
    }
    return rawSample;
  }

  private nextNoise(): number {
    this.noiseState ^= this.noiseState << 13;
    this.noiseState ^= this.noiseState >>> 17;
    this.noiseState ^= this.noiseState << 5;
    return (this.noiseState >>> 0) / 0xffffffff;
  }
}

export function renderSaoTrucPcm(
  notes: FluteSequenceNote[],
  sampleRate = SAO_TRUC_SAMPLE_RATE,
  options: FluteSequenceOptions = {},
  probe?: FluteRenderProbe,
): Float32Array {
  if (!Number.isInteger(sampleRate) || sampleRate < 8000 || sampleRate > 96000)
    throw new Error("Sample rate phải nằm trong 8000–96000 Hz.");
  const score = prepare(notes);
  const phrases = preparePhrases(score.notes, options);
  const output = new Float32Array(Math.ceil(score.duration * sampleRate));
  const voice = new WaveguideVoice(sampleRate, score.notes[0]);
  let noteIndex = 0;
  let phraseIndex = 0;
  for (let i = 0; i < output.length; i++) {
    const time = i / sampleRate;
    while (
      noteIndex + 1 < score.notes.length &&
      time >= score.notes[noteIndex + 1].start
    )
      noteIndex++;
    while (
      phraseIndex + 1 < phrases.length &&
      time >= phrases[phraseIndex + 1].start
    )
      phraseIndex++;
    output[i] = voice.tick(
      i, score.notes[noteIndex], phrases[phraseIndex],
      score.notes[noteIndex - 1], score.notes[noteIndex + 1],
      probe,
    );
  }
  // Mild final safety limiting; the tonal waveform is shaped inside the bore and radiation stages.
  for (let i = 0; i < output.length; i++) output[i] = Math.tanh(output[i]);
  return output;
}

export function renderToWav(
  notes: FluteSequenceNote[],
  sampleRate = SAO_TRUC_SAMPLE_RATE,
  options: FluteSequenceOptions = {},
): Blob {
  const pcm = renderSaoTrucPcm(notes, sampleRate, options);
  const bytes = new ArrayBuffer(44 + pcm.length * 2);
  const view = new DataView(bytes);
  const fourcc = (offset: number, value: string) => {
    for (let i = 0; i < 4; i++) view.setUint8(offset + i, value.charCodeAt(i));
  };
  fourcc(0, "RIFF");
  view.setUint32(4, 36 + pcm.length * 2, true);
  fourcc(8, "WAVE");
  fourcc(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  fourcc(36, "data");
  view.setUint32(40, pcm.length * 2, true);
  for (let i = 0; i < pcm.length; i++)
    view.setInt16(44 + i * 2, Math.round(clamp(pcm[i], -1, 1) * 32767), true);
  return new Blob([bytes], { type: "audio/wav" });
}

export class PhysicalFluteEngine {
  private context: AudioContext | null = null;
  private source: AudioBufferSourceNode | null = null;

  async playNote(
    note: string,
    duration: number,
    options: FluteNoteOptions = {},
  ): Promise<FlutePlayback> {
    return this.playSequence([{ note, duration, options }]);
  }

  async playSequence(
    notes: FluteSequenceNote[],
    options: FluteSequenceOptions = {},
  ): Promise<FlutePlayback> {
    this.stop();
    const score = prepare(notes);
    this.context ??= new AudioContext();
    await this.context.resume();
    const context = this.context;
    const pcm = renderSaoTrucPcm(notes, SAO_TRUC_SAMPLE_RATE, options);
    const buffer = context.createBuffer(1, pcm.length, SAO_TRUC_SAMPLE_RATE);
    buffer.copyToChannel(new Float32Array(pcm), 0);
    const source = context.createBufferSource();
    source.buffer = buffer;
    source.connect(context.destination);
    const startTime = context.currentTime + 0.04;
    source.start(startTime);
    source.onended = () => {
      if (this.source === source) this.source = null;
      source.disconnect();
    };
    this.source = source;
    return { startTime, duration: score.duration };
  }

  renderToWav(
    notes: FluteSequenceNote[],
    sampleRate = SAO_TRUC_SAMPLE_RATE,
    options: FluteSequenceOptions = {},
  ): Blob {
    return renderToWav(notes, sampleRate, options);
  }
  get currentTime(): number {
    return this.context?.currentTime ?? 0;
  }
  stop(): void {
    if (this.source) {
      this.source.onended = null;
      try {
        this.source.stop();
      } catch {
        /* source already ended */
      }
      this.source.disconnect();
      this.source = null;
    }
  }
  async dispose(): Promise<void> {
    this.stop();
    await this.context?.close();
    this.context = null;
  }
}
