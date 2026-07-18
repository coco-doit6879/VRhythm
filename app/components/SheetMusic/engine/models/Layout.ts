// engine/models/Layout.ts

import { Accidental, Duration, Pitch } from "./Score";

export type StemDirection = "up" | "down";

export type NoteHeadType =
  | "whole"
  | "half"
  | "black";

export interface LayoutLedgerLine {
  x1: number;
  x2: number;
  y: number;
}

export interface LayoutStem {
  direction: StemDirection;

  x: number;

  y1: number;

  y2: number;
}

export interface LayoutNote {
  /**
   * Original score data
   */
  id: string;

  pitch: Pitch;

  duration: Duration;

  accidental?: Accidental;

  /**
   * Render data
   */
  noteHead: NoteHeadType;

  x: number;

  y: number;

  width: number;

  /**
   * Measure info
   */
  measureIndex: number;

  noteIndex: number;

  /**
   * Render helpers
   */
  stem?: LayoutStem;

  ledgerLines: LayoutLedgerLine[];

  highlighted: boolean;
}

export interface LayoutMeasure {
  index: number;

  startX: number;

  endX: number;

  width: number;

  notes: LayoutNote[];
}

export interface LayoutScore {
  width: number;

  height: number;

  measures: LayoutMeasure[];
}