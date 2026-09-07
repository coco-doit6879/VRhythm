// engine/utils/pitch.ts

import { Pitch } from "../models/Score";

const STAFF_POSITIONS: Record<Pitch, number> = {
  C4: -2,
  D4: -1,

  E4: 0,
  F4: 1,
  G4: 2,
  A4: 3,
  B4: 4,

  C5: 5,
  D5: 6,
  E5: 7,
  F5: 8,

  G5: 9,
  A5: 10,
  B5: 11,

  C6: 12,
  D6: 13,
  E6: 14,
  F6: 15,
  G6: 16,
  A6: 17,
  B6: 18,
  C7: 19,
};

export function getStaffPosition(pitch: Pitch): number {
  return STAFF_POSITIONS[pitch] ?? 0;
}