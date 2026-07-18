// engine/engines/SpacingEngine.ts

import { LAYOUT } from "../constants";
import { Duration } from "../models/Score";
import { getDurationUnits } from "../utils/duration";

export function getNoteWidth(duration: Duration): number {
  return getDurationUnits(duration) * LAYOUT.NOTE_SPACING_UNIT;
}

export function getInitialX(): number {
  return (
    LAYOUT.START_PADDING
  );
}

export function getNextX(
  currentX: number,
  duration: Duration
): number {
  return currentX + getNoteWidth(duration);
}