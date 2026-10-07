import { renderSaoTrucPcm, SAO_TRUC_SAMPLE_RATE } from './PhysicalFluteEngine.ts';

type Voice = { stop: () => void };
const pitches: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
export function noteFrequency(note: string) {
  const match = /^([A-G])([#b]?)([0-8])$/.exec(note);
  if (!match) throw new Error(`Invalid note: ${note}`);
  const midi = (Number(match[3]) + 1) * 12 + pitches[match[1]] + (match[2] === '#' ? 1 : match[2] === 'b' ? -1 : 0);
  return 440 * 2 ** ((midi - 69) / 12);
}

/** One instance per landing page. No context, requests or sound before opt-in. */
export class InstrumentSynth {
  private context: AudioContext | null = null;
  private enabled = false;
  private disposed = false;
  private voices = new Set<Voice>();
  private samples = new Map<string, AudioBuffer | null>();
  private pending = new Set<string>();
  private abort = new AbortController();

  async setEnabled(enabled: boolean): Promise<boolean> {
    this.enabled = enabled;
    if (!enabled) { this.stopAll(); return false; }
    try {
      if (this.disposed) return false;
      this.context ??= new AudioContext();
      await this.context.resume();
      return !this.disposed && this.enabled && this.context.state === 'running';
    } catch { this.enabled = false; return false; }
  }

  playNote(instrumentId: string, note: string) {
    const ctx = this.context;
    if (!this.enabled || this.disposed || !ctx || ctx.state !== 'running' || !/^[a-z]+$/.test(instrumentId)) return;
    let frequency: number;
    try { frequency = noteFrequency(note); } catch { return; }
    if (instrumentId === 'sao') {
      if (frequency < noteFrequency('C4') || frequency > noteFrequency('C7')) return;
      // The Vietnamese flute is wholly procedural; never probe /audio/sao for recordings.
      const pcm = renderSaoTrucPcm([{ note, duration: 1.1 }]);
      const buffer = ctx.createBuffer(1, pcm.length, SAO_TRUC_SAMPLE_RATE);
      buffer.copyToChannel(new Float32Array(pcm), 0);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      if (this.voices.size >= 8) this.voices.values().next().value?.stop();
      let stopped = false;
      const voice: Voice = { stop: () => {
        if (stopped) return;
        stopped = true;
        source.onended = null;
        try { source.stop(); } catch { /* already ended */ }
        source.disconnect();
        this.voices.delete(voice);
      } };
      this.voices.add(voice);
      source.onended = voice.stop;
      source.start(ctx.currentTime);
      return;
    }
    // Preserve immediate response; a discovered sample is used on subsequent notes.
    const key = `${instrumentId}/${note}`;
    const sample = this.samples.get(key);
    if (!this.samples.has(key) && !this.pending.has(key) && this.samples.size + this.pending.size < 64) void this.loadSample(key, ctx);
    if (this.voices.size >= 8) this.voices.values().next().value?.stop();
    const now = ctx.currentTime;
    const gain = ctx.createGain();
    const nodes: AudioNode[] = [gain];
    const sources: AudioScheduledSourceNode[] = [];
    const bowed = instrumentId === 'nhi';
    const duration = sample ? Math.min(sample.duration, 5) : bowed ? 1.35 : 1.9;
    const attack = bowed ? .09 : .006;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(.12, now + attack);
    gain.gain.exponentialRampToValueAtTime(.0001, now + duration);
    gain.gain.linearRampToValueAtTime(0, now + duration + .03);
    gain.connect(ctx.destination);
    if (sample) {
      const source = ctx.createBufferSource(); source.buffer = sample; source.connect(gain); sources.push(source); nodes.push(source);
    } else {
      const osc = ctx.createOscillator();
      osc.type = instrumentId === 'bau' ? 'sine' : 'triangle';
      osc.frequency.value = frequency;
      const filter = ctx.createBiquadFilter(); filter.type = 'lowpass';
      filter.frequency.setValueAtTime(frequency * 7, now);
      filter.frequency.exponentialRampToValueAtTime(frequency * 1.2, now + duration);
      osc.connect(filter); filter.connect(gain); nodes.push(osc, filter); sources.push(osc);
      if (bowed) {
        const vibrato = ctx.createOscillator(); const depth = ctx.createGain();
        vibrato.frequency.value = 5; depth.gain.value = frequency * .004;
        vibrato.connect(depth); depth.connect(osc.frequency); nodes.push(vibrato, depth); sources.push(vibrato);
      }
    }
    let stopped = false;
    const voice: Voice = { stop: () => {
      if (stopped) return;
      stopped = true;
      sources.forEach(source => { source.onended = null; try { source.stop(); } catch { /* Already ended. */ } });
      nodes.forEach(node => node.disconnect()); this.voices.delete(voice);
    } };
    this.voices.add(voice);
    sources[0].onended = voice.stop;
    sources.forEach(source => { source.start(now); source.stop(now + duration + .04); });
  }

  private async loadSample(key: string, ctx: AudioContext) {
    this.pending.add(key);
    try {
      const response = await fetch(`/audio/${key.split('/').map(encodeURIComponent).join('/')}.mp3`, { signal: this.abort.signal });
      // SPA hosts may return index.html with a 200 status for missing files.
      const contentType = response.headers.get('content-type') ?? '';
      if (!response.ok || contentType.includes('text/html')) throw new Error('No sample');
      const buffer = await ctx.decodeAudioData(await response.arrayBuffer());
      if (!this.disposed) this.samples.set(key, buffer);
    } catch { if (!this.disposed) this.samples.set(key, null); }
    finally { this.pending.delete(key); }
  }
  stopAll() { [...this.voices].forEach(voice => voice.stop()); }
  dispose() { this.disposed = true; this.enabled = false; this.abort.abort(); this.stopAll(); this.samples.clear(); if (this.context) void this.context.close().catch(() => {}); }
}
