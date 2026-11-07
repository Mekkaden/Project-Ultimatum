import { useState, useEffect } from "react";
import { EXERCISE_LIBRARY, LibraryExercise } from "./exercise-library";

export interface CustomExercise extends LibraryExercise {
  isCustom: boolean;
  id: string; // unique identifier
}

export type UnifiedExercise = LibraryExercise & { isCustom?: boolean; id?: string };

const CUSTOM_EXERCISES_KEY = "ultimatum_custom_exercises";

export function useExercises() {
  const [customExercises, setCustomExercises] = useState<CustomExercise[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(CUSTOM_EXERCISES_KEY);
      if (stored) {
        try {
          setCustomExercises(JSON.parse(stored));
        } catch (e) {
          console.error("Failed to parse custom exercises", e);
        }
      }
    }
  }, []);

  const addCustomExercise = (exercise: Omit<CustomExercise, "isCustom" | "id">) => {
    const newExercise: CustomExercise = {
      ...exercise,
      isCustom: true,
      id: `custom_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    };

    const updated = [...customExercises, newExercise];
    setCustomExercises(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem(CUSTOM_EXERCISES_KEY, JSON.stringify(updated));
    }
    return newExercise;
  };

  const removeCustomExercise = (id: string) => {
    const updated = customExercises.filter((ex) => ex.id !== id);
    setCustomExercises(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem(CUSTOM_EXERCISES_KEY, JSON.stringify(updated));
    }
  };

  // Merge system library with custom exercises
  const allExercises: UnifiedExercise[] = [
    ...customExercises,
    ...EXERCISE_LIBRARY.map(ex => ({ ...ex, isCustom: false }))
  ].sort((a, b) => a.slotName.localeCompare(b.slotName));

  return {
    customExercises,
    allExercises,
    addCustomExercise,
    removeCustomExercise
  };
}
