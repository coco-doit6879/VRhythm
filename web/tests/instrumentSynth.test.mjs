import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { InstrumentSynth, noteFrequency } from '../src/audio/instrumentSynth.ts';

const originalContext = globalThis.AudioContext;
const originalFetch = globalThis.fetch;
let contexts;
let requests;
const parameter = () => ({ value: 0, setValueAtTime() {}, linearRampToValueAtTime() {}, exponentialRampToValueAtTime() {} });
class Node {
  gain = parameter(); frequency = parameter(); Q = parameter();
  disconnected = false; stopped = false; onended = null;
  connect() {} disconnect() { this.disconnected = true; }
  start() {} stop(when) { if (when === undefined) this.stopped = true; }
}
class Context {
  currentTime = 0; sampleRate = 8000; state = 'suspended'; destination = {};
  nodes = []; oscillators = []; buffers = [];
  constructor() { contexts.push(this); }
  node() { const node = new Node(); this.nodes.push(node); return node; }
  createGain() { return this.node(); }
  createBiquadFilter() { return this.node(); }
  createOscillator() { const node = this.node(); this.oscillators.push(node); return node; }
  createBufferSource() { const node = this.node(); this.buffers.push(node); return node; }
  createBuffer(_channels, size) { return { getChannelData: () => new Float32Array(size), copyToChannel(data) { assert.ok(data.some(value => value !== 0)); } }; }
  async resume() { this.state = 'running'; }
  async close() { this.state = 'closed'; }
  async decodeAudioData() { return { duration: 1 }; }
}
beforeEach(() => {
  contexts = []; requests = [];
  globalThis.AudioContext = Context;
  globalThis.fetch = async (url, options) => { requests.push({ url, options }); return new Response('', { status: 404 }); };
});
afterEach(() => { globalThis.AudioContext = originalContext; globalThis.fetch = originalFetch; });
const flush = () => new Promise(resolve => setImmediate(resolve));

test('silent until explicit opt-in; mute stops and disconnects every voice', async () => {
  const synth = new InstrumentSynth(); synth.playNote('tranh', 'C4');
  assert.equal(contexts.length, 0); assert.equal(requests.length, 0);
  assert.equal(await synth.setEnabled(true), true);
  synth.playNote('sao', 'A4');
  assert.equal(contexts[0].oscillators.length, 0, 'flute does not use an oscillator');
  assert.equal(contexts[0].buffers.length, 1, 'flute renders a procedural waveguide buffer');
  assert.equal(requests.length, 0, 'flute does not request recorded samples');
  await synth.setEnabled(false);
  assert.ok(contexts[0].nodes.every(node => node.disconnected));
  const count = contexts[0].nodes.length; synth.playNote('tranh', 'C4');
  assert.equal(contexts[0].nodes.length, count);
  synth.dispose(); assert.equal(contexts[0].state, 'closed');
});
test('limits simultaneous notes to eight and releases natural endings', async () => {
  const synth = new InstrumentSynth(); await synth.setEnabled(true);
  for (let index = 0; index < 12; index++) synth.playNote('tranh', 'C4');
  const oscillators = contexts[0].oscillators;
  assert.equal(oscillators.filter(node => !node.disconnected).length, 8);
  assert.ok(oscillators.slice(0, 4).every(node => node.stopped));
  oscillators[4].onended();
  assert.equal(oscillators.filter(node => !node.disconnected).length, 7);
  synth.dispose(); assert.ok(contexts[0].nodes.every(node => node.disconnected));
});
test('missing or SPA fallback samples are cached and use synthesis immediately', async () => {
  const synth = new InstrumentSynth(); await synth.setEnabled(true);
  globalThis.fetch = async url => { requests.push(url); return new Response('<html/>', { headers: { 'content-type': 'text/html' } }); };
  synth.playNote('tranh', 'C4'); assert.equal(contexts[0].oscillators.length, 1);
  await flush(); synth.playNote('tranh', 'C4');
  assert.deepEqual(requests, ['/audio/tranh/C4.mp3']);
  assert.equal(contexts[0].oscillators.length, 2); synth.dispose();
});
test('discovered recordings replace synthesis on subsequent notes', async () => {
  globalThis.fetch = async () => new Response(new Uint8Array([1]), { headers: { 'content-type': 'audio/mpeg' } });
  const synth = new InstrumentSynth(); await synth.setEnabled(true);
  synth.playNote('nguyet', 'D4'); await flush(); synth.playNote('nguyet', 'D4');
  assert.equal(contexts[0].oscillators.length, 1);
  assert.equal(contexts[0].buffers.length, 1); synth.dispose();
});
test('dispose aborts pending sample loads and cannot restart audio', async () => {
  let signal;
  globalThis.fetch = (_url, options) => { signal = options.signal; return new Promise((_resolve, reject) => signal.addEventListener('abort', () => reject(new Error('aborted')))); };
  const synth = new InstrumentSynth(); await synth.setEnabled(true);
  synth.playNote('tranh', 'E5'); synth.dispose();
  assert.equal(signal.aborted, true); assert.equal(await synth.setEnabled(true), false);
  await flush(); assert.equal(contexts[0].state, 'closed');
});
test('note parsing validates pitches and octave frequency relationships', () => {
  assert.equal(noteFrequency('A4'), 440);
  assert.equal(noteFrequency('C5'), noteFrequency('C4') * 2);
  assert.equal(noteFrequency('C#4'), noteFrequency('Db4'));
  assert.throws(() => noteFrequency('../bad'));
});
