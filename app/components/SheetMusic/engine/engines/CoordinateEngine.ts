// engine/engines/CoordinateEngine.ts

import { STAFF } from "../constants";
import { LayoutLedgerLine } from "../models/Layout";
import { Pitch } from "../models/Score";
import { getStaffPosition } from "../utils/pitch";

export function getNoteY(pitch: Pitch, staffTop: number): number {
  const position = getStaffPosition(pitch);

  const bottomLineY =
    staffTop + (STAFF.LINE_COUNT - 1) * STAFF.LINE_SPACING;

  return bottomLineY - position * (STAFF.LINE_SPACING / 2);
}

export function getLedgerLines(
  pitch: Pitch,
  noteX: number,
  ledgerLength: number,
  staffTop: number
): LayoutLedgerLine[] {
  const lines: LayoutLedgerLine[] = [];

  const position = getStaffPosition(pitch);

  const bottomLineY =
    staffTop + (STAFF.LINE_COUNT - 1) * STAFF.LINE_SPACING;

  // Below staff
  if (position < 0) {
    for (let p = position; p < 0; p++) {
      if (p % 2 === 0) {
        lines.push({
          x1: noteX - ledgerLength / 2,
          x2: noteX + ledgerLength / 2,
          y: bottomLineY - p * (STAFF.LINE_SPACING / 2),
        });
      }
    }
  }

  // Above staff
  if (position > 8) {
    for (let p = 10; p <= position; p++) {
      if (p % 2 === 0) {
        lines.push({
          x1: noteX - ledgerLength / 2,
          x2: noteX + ledgerLength / 2,
          y: bottomLineY - p * (STAFF.LINE_SPACING / 2),
        });
      }
    }
  }

  return lines;
}