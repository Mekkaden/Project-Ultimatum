// Per-exercise user notes ("squeeze at the top", "elbows 45°", ...).
// Keyed by canonical movement name so a cue follows the exercise across splits
// and survives a split change. An exercise can hold several separate notes; they
// are stored as one JSON map alongside the other settings for cloud sync and
// backup. The raw protocol cue in `exercise.notes` is separate and never
// overwritten.
//
// The first version of this feature stored a single note per exercise
// (`{ text, updatedAt, exerciseName }`). That shape is still read and is folded
// into a one-item list, so nothing written before this change is lost.

import { resolveMovementName } from "./exercise-aliases";

export const EXERCISE_NOTES_KEY = "ultimatum_exercise_notes";
export const NOTE_MAX_LENGTH = 500;

export type ExerciseNote = {
  /** Distinguishes the notes of one exercise. */
  id: string;
  title: string;
  text: string;
  createdAt: number;
  updatedAt: number;
  /** Display name the note was written against. */
  exerciseName: string;
};

type NoteList = ExerciseNote[];
type NoteMap = Record<string, NoteList>;

export function noteKey(exerciseName: string): string {
  const canonical = resolveMovementName(exerciseName) || exerciseName;
  return canonical.trim().toLowerCase();
}

let noteIdFallback = 0;

function newId(): string {
  try {
    return `note-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  } catch {
    noteIdFallback += 1;
    return `note-${Date.now()}-${noteIdFallback}`;
  }
}

function isLegacyNote(value: unknown): value is { text: string; updatedAt?: number; exerciseName?: string } {
  return (
    !!value &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    typeof (value as { text?: unknown }).text === "string"
  );
}

/**
 * Turns whatever the stored JSON holds into notes. `dirty` is true when the
 * entry was in the legacy single-note shape (or was otherwise repaired), which
 * tells the store to write the upgraded form back.
 */
function normalizeEntry(raw: unknown, exerciseName: string): { notes: NoteList; dirty: boolean } {
  if (Array.isArray(raw)) {
    const now = Date.now();
    const notes: NoteList = [];
    let dirty = false;
    for (const item of raw) {
      const value = item as Partial<ExerciseNote> | null;
      if (!value || typeof value !== "object" || typeof value.text !== "string") {
        dirty = true;
        continue;
      }
      const text = value.text.trim();
      if (!text) {
        dirty = true;
        continue;
      }
      const updatedAt = Number(value.updatedAt) || now;
      const id = typeof value.id === "string" && value.id ? value.id : newId();
      if (id !== value.id) dirty = true;
      notes.push({
        id,
        title: typeof value.title === "string" ? value.title : "",
        text: text.slice(0, NOTE_MAX_LENGTH),
        createdAt: Number(value.createdAt) || updatedAt,
        updatedAt,
        exerciseName:
          typeof value.exerciseName === "string" && value.exerciseName ? value.exerciseName : exerciseName,
      });
    }
    return { notes, dirty };
  }

  if (isLegacyNote(raw)) {
    const text = raw.text.trim();
    if (!text) return { notes: [], dirty: true };
    const updatedAt = Number(raw.updatedAt) || Date.now();
    return {
      notes: [
        {
          id: newId(),
          title: "",
          text: text.slice(0, NOTE_MAX_LENGTH),
          createdAt: updatedAt,
          updatedAt,
          exerciseName: raw.exerciseName || exerciseName,
        },
      ],
      dirty: true,
    };
  }

  return { notes: [], dirty: true };
}

function readMap(): { map: NoteMap; needsWrite: boolean } {
  if (typeof window === "undefined") return { map: {}, needsWrite: false };
  let parsed: unknown;
  try {
    const raw = localStorage.getItem(EXERCISE_NOTES_KEY);
    if (!raw) return { map: {}, needsWrite: false };
    parsed = JSON.parse(raw);
  } catch {
    return { map: {}, needsWrite: false };
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return { map: {}, needsWrite: false };
  }

  const map: NoteMap = {};
  let needsWrite = false;
  for (const [key, raw] of Object.entries(parsed as Record<string, unknown>)) {
    const { notes, dirty } = normalizeEntry(raw, key);
    if (dirty) needsWrite = true;
    if (notes.length > 0) map[key] = notes;
  }
  return { map, needsWrite };
}

function writeMap(map: NoteMap): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(EXERCISE_NOTES_KEY, JSON.stringify(map));
  } catch {}
}

/**
 * Most recent first: the newest cue is the one the lifter needs in the gym.
 * Two notes saved within the same millisecond keep their insertion order with
 * the later one first, so a fast double-save never shows the older note on top.
 */
function sortNotes(notes: NoteList): NoteList {
  return notes
    .map((note, index) => ({ note, index }))
    .sort((a, b) => b.note.updatedAt - a.note.updatedAt || b.index - a.index)
    .map(({ note }) => note);
}

/** Every saved note for an exercise, newest first. Reads upgrade legacy entries. */
export function getExerciseNotes(exerciseName: string | undefined | null): NoteList {
  if (!exerciseName) return [];
  const { map, needsWrite } = readMap();
  if (needsWrite) writeMap(map);
  return sortNotes(map[noteKey(exerciseName)] ?? []);
}

/** Convenience for places that show a single cue: the most recent note. */
export function getExerciseNote(exerciseName: string | undefined | null): ExerciseNote | null {
  return getExerciseNotes(exerciseName)[0] ?? null;
}

/**
 * Adds a new note. Existing notes for the exercise are left untouched, so
 * saving twice never overwrites the first one.
 */
export function addExerciseNote(
  exerciseName: string,
  text: string,
  title: string = "",
): ExerciseNote | null {
  if (!exerciseName) return null;
  const trimmed = text.trim();
  if (!trimmed) return null;
  const { map } = readMap();
  const key = noteKey(exerciseName);
  const now = Date.now();
  const note: ExerciseNote = {
    id: newId(),
    title: title.trim().slice(0, 80),
    text: trimmed.slice(0, NOTE_MAX_LENGTH),
    createdAt: now,
    updatedAt: now,
    exerciseName: resolveMovementName(exerciseName) || exerciseName,
  };
  map[key] = [...(map[key] ?? []), note];
  writeMap(map);
  return note;
}

export function updateExerciseNote(
  exerciseName: string,
  id: string,
  text: string,
  title: string = "",
): ExerciseNote | null {
  if (!exerciseName || !id) return null;
  const trimmed = text.trim();
  if (!trimmed) return null;
  const { map } = readMap();
  const key = noteKey(exerciseName);
  const notes = map[key];
  if (!notes) return null;
  const index = notes.findIndex((note) => note.id === id);
  if (index === -1) return null;
  const updated: ExerciseNote = {
    ...notes[index],
    title: title.trim().slice(0, 80),
    text: trimmed.slice(0, NOTE_MAX_LENGTH),
    updatedAt: Date.now(),
  };
  map[key] = notes.map((note, i) => (i === index ? updated : note));
  writeMap(map);
  return updated;
}

export function deleteExerciseNote(exerciseName: string, id: string): ExerciseNote | null {
  if (!exerciseName || !id) return null;
  const { map } = readMap();
  const key = noteKey(exerciseName);
  const notes = map[key];
  if (!notes) return null;
  const removed = notes.find((note) => note.id === id) ?? null;
  if (!removed) return null;
  const remaining = notes.filter((note) => note.id !== id);
  if (remaining.length > 0) {
    map[key] = remaining;
  } else {
    delete map[key];
  }
  writeMap(map);
  return removed;
}

/** Puts a deleted note back exactly as it was (used by the undo action). */
export function restoreExerciseNote(exerciseName: string, note: ExerciseNote): void {
  if (!exerciseName || !note?.id) return;
  const { map } = readMap();
  const key = noteKey(exerciseName);
  const notes = map[key] ?? [];
  if (notes.some((entry) => entry.id === note.id)) return;
  map[key] = [...notes, note];
  writeMap(map);
}

export function getAllExerciseNotes(): Record<string, NoteList> {
  return readMap().map;
}

function firstLine(text: string): string {
  return text.split("\n").map((line) => line.trim()).find(Boolean) ?? "";
}

/** The label shown for a note in the list: the user's title, else its opening words. */
export function noteTitle(note: ExerciseNote): string {
  if (note.title?.trim()) return note.title.trim();
  const words = firstLine(note.text).split(/\s+/);
  return words.slice(0, 6).join(" ") || "Note";
}

/** A single-line body summary for the row under the title. */
export function notePreview(note: ExerciseNote): string {
  return note.text.replace(/\s+/g, " ").trim();
}

export function formatNoteDate(timestamp: number): string {
  try {
    const date = new Date(timestamp);
    if (date.toDateString() === new Date().toDateString()) {
      return date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
    }
    return date.toLocaleDateString(undefined, { day: "numeric", month: "short" });
  } catch {
    return "";
  }
}
