// engine/engines/MeasureEngine.ts

import { ScoreNote } from "../models/Score";
import { getDurationBeats } from "../utils/duration";

export interface MeasureResult {
  measureIndex: number;

  beat: number;

  isFirst: boolean;

  isLast: boolean;
}

export function createMeasures(
  notes: ScoreNote[],
  beatsPerMeasure: number
): MeasureResult[] {
  const result: MeasureResult[] = [];

  let measureIndex = 0;

  let beat = 0;

  let measureStart = 0;

  for (let i = 0; i < notes.length; i++) {
    const value = getDurationBeats(notes[i].duration);

    if (beat === 0) {
      measureStart = i;
    }

    beat += value;

    const isLast = beat >= beatsPerMeasure;

    result.push({
      measureIndex,

      beat,

      isFirst: i === measureStart,

      isLast,
    });

    if (isLast) {
      beat = 0;
      measureIndex++;
    }
  }

  return result;
}