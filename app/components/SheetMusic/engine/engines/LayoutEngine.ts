import {
  CLEF,
  LAYOUT,
  NOTE,
  STAFF,
  TIME_SIGNATURE,
} from "../constants";

import {
  LayoutMeasure,
  LayoutNote,
  LayoutScore,
} from "../models/Layout";

import { Score } from "../models/Score";

import { getNoteHead } from "../utils/duration";

import { getStaffPosition } from "../utils/pitch";

import {
  getLedgerLines,
  getNoteY,
} from "./CoordinateEngine";

import {
  createMeasures,
} from "./MeasureEngine";

import {
  getInitialX,
  getNextX,
  getNoteWidth,
} from "./SpacingEngine";

import {
  createStem,
} from "./StemEngine";

export function createLayout(
  score: Score,
  currentNoteIndex: number = -1
): LayoutScore {

  const measures = createMeasures(
    score.notes,
    score.metadata.timeSignature.beats
  );

  let highestPosition = 8;
  let lowestPosition = 0;
  score.notes.forEach(note => {
    const pos = getStaffPosition(note.pitch);
    if (pos > highestPosition) highestPosition = pos;
    if (pos < lowestPosition) lowestPosition = pos;
  });

  const extraTopMargin = Math.max(0, highestPosition - 8) * (STAFF.LINE_SPACING / 2);
  const extraBottomMargin = Math.max(0, 0 - lowestPosition) * (STAFF.LINE_SPACING / 2);

  const dynamicStaffTop = STAFF.TOP + extraTopMargin;
  const dynamicHeight = dynamicStaffTop + STAFF.HEIGHT + 80 + extraBottomMargin;

  const layoutMeasures: LayoutMeasure[] = [];

  let currentMeasure: LayoutMeasure | null = null as LayoutMeasure | null;

  let currentX =
    STAFF.LEFT +
    CLEF.WIDTH +
    TIME_SIGNATURE.WIDTH +
    getInitialX();

  score.notes.forEach((note, index) => {

    const measureInfo = measures[index];

    if (
      currentMeasure === null ||
      currentMeasure.index !== measureInfo.measureIndex
    ) {

      if (currentMeasure) {
        currentMeasure.endX = currentX;
        currentMeasure.width =
          currentMeasure.endX -
          currentMeasure.startX;
      }

      currentMeasure = {
        index: measureInfo.measureIndex,

        startX: currentX,

        endX: currentX,

        width: 0,

        notes: [],
      };

      layoutMeasures.push(currentMeasure);

      currentX += LAYOUT.MEASURE_PADDING;
    }

    const noteWidth = getNoteWidth(note.duration);

    const noteY = getNoteY(note.pitch, dynamicStaffTop);

    const layoutNote: LayoutNote = {
      id: note.id,

      pitch: note.pitch,

      duration: note.duration,

      accidental: note.accidental,

      noteHead: getNoteHead(note.duration),

      x: currentX,

      y: noteY,

      width: noteWidth,

      measureIndex: measureInfo.measureIndex,

      noteIndex: index,

      stem: createStem(
        note.pitch,
        currentX,
        noteY
      ),

      ledgerLines: getLedgerLines(
        note.pitch,
        currentX,
        NOTE.LEDGER_LENGTH,
        dynamicStaffTop
      ),

      highlighted:
        index === currentNoteIndex,
    };

    currentMeasure.notes.push(layoutNote);

    currentX = getNextX(
      currentX,
      note.duration
    );
  });

  if (currentMeasure !== null)  {
    currentMeasure.endX = currentX;

    currentMeasure.width =
      currentMeasure.endX -
      currentMeasure.startX;
  }

  return {
    width:
      currentX +
      LAYOUT.END_PADDING,

    height: dynamicHeight,
    staffTop: dynamicStaffTop,

    measures: layoutMeasures,
  };
}