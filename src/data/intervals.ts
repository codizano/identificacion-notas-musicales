import type { NoteData } from "../types";
import { getOptions, NOTES } from "./notes";

export type IntervalClef = "treble" | "bass";

export interface IntervalQuestion {
  lowerNote: NoteData;
  upperNote: NoteData;
  lowerOptions: NoteData[];
  upperOptions: NoteData[];
  answer: string;
  options: string[];
}

const INTERVAL_NAMES: Record<number, string> = {
  1: "Unísono",
  2: "Segunda",
  3: "Tercera",
  4: "Cuarta",
  5: "Quinta",
  6: "Sexta",
  7: "Séptima",
  8: "Octava",
};

const AVAILABLE_INTERVALS = Object.values(INTERVAL_NAMES);
const UNISON_INTERVAL = INTERVAL_NAMES[1];

function getIntervalName(
  lowerNote: NoteData,
  upperNote: NoteData,
  clefNotes: NoteData[]
): string {
  const lowerIndex = clefNotes.findIndex((note) => note.id === lowerNote.id);
  const upperIndex = clefNotes.findIndex((note) => note.id === upperNote.id);
  const diatonicNumber = upperIndex - lowerIndex + 1;

  return INTERVAL_NAMES[diatonicNumber];
}

function shuffle<T>(values: T[]): T[] {
  return [...values].sort(() => Math.random() - 0.5);
}

export function getRandomIntervalQuestion(clef: IntervalClef, isUnison: boolean): IntervalQuestion {
  const clefNotes = clef === "treble"
    ? NOTES.filter((note) => note.vexKey.endsWith("/4") || note.vexKey === "c/5")
    : NOTES.filter((note) => note.vexKey.endsWith("/3"));
  const possibleFirstNotes = isUnison ? clefNotes : clefNotes.slice(0, -1);
  const firstNote = possibleFirstNotes[Math.floor(Math.random() * possibleFirstNotes.length)];
  const firstIndex = clefNotes.findIndex((note) => note.id === firstNote.id);
  const secondNote = isUnison
    ? firstNote
    : clefNotes[firstIndex + 1 + Math.floor(Math.random() * (clefNotes.length - firstIndex - 1))];
  const answer = getIntervalName(firstNote, secondNote, clefNotes);
  const distractors = shuffle(
    AVAILABLE_INTERVALS.filter((name) => name !== answer && (isUnison || name !== UNISON_INTERVAL))
  ).slice(0, 2);

  return {
    lowerNote: firstNote,
    upperNote: secondNote,
    lowerOptions: getOptions(firstNote),
    upperOptions: getOptions(secondNote),
    answer,
    options: shuffle([answer, ...distractors]),
  };
}
