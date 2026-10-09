import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildScoreTimeline, pitchFrequency } from '../src/audio/fluteScore.ts';
import { renderSaoTrucPcm } from '../src/audio/PhysicalFluteEngine.ts';

for (const path of ['../../app/components/lesson/lycayxanh.json', '../src/data/scores/bac-kim-thang.json', '../src/audio/sheets/beoDatMayTroi.json']) {
  test(`Library sheet produces playable finite production audio: ${path}`, () => {
    const score = JSON.parse(readFileSync(new URL(path, import.meta.url)));
    assert.equal(new Set(score.notes.map(note => note.id)).size, score.notes.length);
    const timeline = buildScoreTimeline(score);
    assert.ok(timeline.totalDuration > 5 && timeline.totalDuration < 120);
    for (const event of timeline.sequence) assert.ok(pitchFrequency(event.note) >= pitchFrequency('C4') && pitchFrequency(event.note) <= pitchFrequency('C7'));
    const pcm = renderSaoTrucPcm(timeline.sequence, 8000, timeline.sequenceOptions);
    let peak = 0;
    for (const sample of pcm) { assert.ok(Number.isFinite(sample)); peak = Math.max(peak, Math.abs(sample)); }
    assert.ok(peak > .001 && peak <= 1);
    if (score.notes[0].rest) assert.ok(pcm.slice(0, 1000).every(sample => sample === 0), 'Initial rest must be silent');
  });
}
