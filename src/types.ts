export interface NoteData {
  id: string;
  // VexFlow key notation e.g. "c/4", "g/4"
  vexKey: string;
  // Nombre en español
  name: string;
  // Nombre alternativo (Do, Re, Mi...)
  solfeo: string;
}

export type AnswerState = "idle" | "correct" | "wrong";

export interface QuizQuestion {
  note: NoteData;
  options: NoteData[];
}
