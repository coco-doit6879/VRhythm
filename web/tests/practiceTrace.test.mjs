import { test } from 'node:test';
import assert from 'node:assert/strict';
import { appendPitchSample, frequencyToMidi, microphoneLevel, tracePath } from '../src/components/practiceTrace.ts';

test('C4 and C5 stay one octave apart and RMS distinguishes sound from silence', () => {
  assert.ok(Math.abs(frequencyToMidi(523.2511306) - frequencyToMidi(261.6255653) - 12) < 1e-6);
  const sine = Float32Array.from({ length: 4800 }, (_, index) => .2 * Math.sin(index * 2 * Math.PI * 440 / 48000));
  assert.ok(Math.abs(microphoneLevel(sine) - .2 / Math.sqrt(2)) < .001);
  assert.equal(microphoneLevel(new Float32Array(4096)), 0);
});

test('Silence and suspended frames break the pitch line instead of inventing notes', () => {
  const samples = [
    { time: 0, frequency: 261, target: 261 }, { time: 100, frequency: 262, target: 261 },
    { time: 200, frequency: null, target: 261 }, { time: 300, frequency: 523, target: 261 },
    { time: 1000, frequency: 524, target: 261 },
  ];
  const path = tracePath(samples, 'frequency', time => time, frequency => frequency);
  assert.equal((path.match(/M/g) || []).length, 3);
  assert.equal((path.match(/L/g) || []).length, 1);
});

test('Long recording retains only the latest ten seconds and bounded samples', () => {
  let samples = [];
  for (let time = 0; time < 120000; time += 100) samples = appendPitchSample(samples, { time, frequency: 440, target: 440 });
  assert.equal(samples.length, 101);
  assert.equal(samples.at(-1).time - samples[0].time, 10000);
});
