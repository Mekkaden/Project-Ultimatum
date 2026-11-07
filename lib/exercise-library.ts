import { CATALOGUE_MOVEMENTS, getActionForMovement } from "./exercise-catalogue";

export interface LibraryExercise {
  /** Joint action the movement belongs to (e.g. "Vertical Pull"). */
  slotName: string;
  /** The movement itself (e.g. "Wide-Grip Lat Pulldown"). */
  prescribedEquipment: string;
  category: string;
  videoUrl?: string;
  substitutions: string[];
  /** Primary muscles, for the picker subtitle. */
  muscles?: string[];
}

// One entry per catalogue movement. The campaign label used to decide the list
// contents is irrelevant here: the catalogue is the source of truth, and
// lib/exercise-aliases maps stored campaigns back onto these names.
export const EXERCISE_LIBRARY: LibraryExercise[] = CATALOGUE_MOVEMENTS.map((m) => ({
  slotName: getActionForMovement(m.name) ?? "Other",
  prescribedEquipment: m.name,
  category: getActionForMovement(m.name) ?? "Other",
  videoUrl: m.videoUrl,
  substitutions: [],
  muscles: m.muscles,
}));
