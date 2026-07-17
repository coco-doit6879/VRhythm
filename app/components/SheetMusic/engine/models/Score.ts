// engine/models/Score.ts

export type Duration =
  | "w"
  | "h"
  | "q"
  | "8"
  | "16";

export type Pitch =
  | "C4"
  | "D4"
  | "E4"
  | "F4"
  | "G4"
  | "A4"
  | "B4"
  | "C5"
  | "D5"
  | "E5"
  | "F5"
  | "G5"
  | "A5"
  | "B5"
  | "C6";

export type Accidental =
  | "#"
  | "b"
  | "n";

export interface TimeSignature {
  beats: number;

  beatType: number;
}

export interface ScoreMetadata {
  title?: string;

  composer?: string;

  tempo: number;

  keySignature: string;

  timeSignature: TimeSignature;
}

export interface ScoreNote {
  id: string;

  pitch: Pitch;

  duration: Duration;

  accidental?: Accidental;
}

export interface Score {
  metadata: ScoreMetadata;

  notes: ScoreNote[];
}