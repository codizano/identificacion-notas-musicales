import type { NoteData } from "../types";

export const NOTES: NoteData[] = [
  { id: "c3", vexKey: "c/3", name: "Do (grave)", solfeo: "Do" },
  { id: "d3", vexKey: "d/3", name: "Re (grave)", solfeo: "Re" },
  { id: "e3", vexKey: "e/3", name: "Mi (grave)", solfeo: "Mi" },
  { id: "f3", vexKey: "f/3", name: "Fa (grave)", solfeo: "Fa" },
  { id: "g3", vexKey: "g/3", name: "Sol (grave)", solfeo: "Sol" },
  { id: "a3", vexKey: "a/3", name: "La (grave)", solfeo: "La" },
  { id: "c4", vexKey: "c/4", name: "Do", solfeo: "Do" },
  { id: "d4", vexKey: "d/4", name: "Re", solfeo: "Re" },
  { id: "e4", vexKey: "e/4", name: "Mi", solfeo: "Mi" },
  { id: "f4", vexKey: "f/4", name: "Fa", solfeo: "Fa" },
  { id: "g4", vexKey: "g/4", name: "Sol", solfeo: "Sol" },
  { id: "a4", vexKey: "a/4", name: "La", solfeo: "La" },
  { id: "b4", vexKey: "b/4", name: "Si", solfeo: "Si" },
  { id: "c5", vexKey: "c/5", name: "Do (agudo)", solfeo: "Do" },
];

const BASS_NOTE_KEYS = ["c/3", "d/3", "e/3", "f/3", "g/3", "a/3"];
const TREBLE_NOTE_KEYS = ["c/4", "d/4", "e/4", "f/4", "g/4", "a/4", "b/4", "c/5"];

export function getRandomNote(): NoteData {
  return NOTES[Math.floor(Math.random() * NOTES.length)];
}

export function getRandomBassNote(): NoteData {
  const bassNotes = NOTES.filter((note) => BASS_NOTE_KEYS.includes(note.vexKey));
  return bassNotes[Math.floor(Math.random() * bassNotes.length)];
}

export function getRandomTrebleNote(): NoteData {
  const trebleNotes = NOTES.filter((note) => TREBLE_NOTE_KEYS.includes(note.vexKey));
  return trebleNotes[Math.floor(Math.random() * trebleNotes.length)];
}

export function getOptions(correct: NoteData): NoteData[] {
  const candidates = NOTES.filter((n) => n.solfeo !== correct.solfeo);
  const shuffledCandidates = candidates.sort(() => Math.random() - 0.5);
  const uniqueBySolfeo = Array.from(
    shuffledCandidates.reduce((map, note) => {
      if (!map.has(note.solfeo)) map.set(note.solfeo, note);
      return map;
    }, new Map<string, NoteData>()).values()
  );
  const shuffled = uniqueBySolfeo.slice(0, 2);
  const all = [correct, ...shuffled].sort(() => Math.random() - 0.5);
  return all;
}
