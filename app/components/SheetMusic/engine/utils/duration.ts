// engine/utils/duration.ts

import { NoteHeadType } from "../models/Layout";
import { Duration } from "../models/Score";

const DURATION_BEATS: Record<Duration, number> = {
  w: 4,
  h: 2,
  q: 1,
  "8": 0.5,
  "16": 0.25,
};

const DURATION_UNITS: Record<Duration, number> = {
  w: 16,
  h: 8,
  q: 4,
  "8": 2,
  "16": 1,
};

const NOTE_HEADS: Record<Duration, NoteHeadType> = {
  w: "whole",
  h: "half",
  q: "black",
  "8": "black",
  "16": "black",
};

export function getDurationBeats(duration: Duration): number {
  return DURATION_BEATS[duration];
}

export function getDurationUnits(duration: Duration): number {
  return DURATION_UNITS[duration];
}

export function getNoteHead(duration: Duration): NoteHeadType {
  return NOTE_HEADS[duration];
}