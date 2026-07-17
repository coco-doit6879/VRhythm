// engine/engines/StemEngine.ts

import { NOTE } from "../constants";
import { LayoutStem, StemDirection } from "../models/Layout";
import { Pitch } from "../models/Score";
import { getStaffPosition } from "../utils/pitch";

export function getStemDirection(
  pitch: Pitch
): StemDirection {
  const position = getStaffPosition(pitch);

  return position >= 4 ? "down" : "up";
}

export function createStem(
  pitch: Pitch,
  noteX: number,
  noteY: number
): LayoutStem | undefined {
  const direction = getStemDirection(pitch);

  if (direction === "up") {
    return {
      direction,

      x: noteX + 8,

      y1: noteY,

      y2: noteY - NOTE.STEM_HEIGHT,
    };
  }

  return {
    direction,

    x: noteX - 8,

    y1: noteY,

    y2: noteY + NOTE.STEM_HEIGHT,
  };
}