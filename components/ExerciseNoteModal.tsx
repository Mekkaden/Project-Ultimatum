"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, MessageSquare, Plus, Trash2, X } from "lucide-react";
import {
  NOTE_MAX_LENGTH,
  addExerciseNote,
  deleteExerciseNote,
  formatNoteDate,
  getExerciseNotes,
  notePreview,
  noteTitle,
  updateExerciseNote,
  type ExerciseNote,
} from "@/lib/exercise-notes";
import { useHardwareBack } from "@/lib/useHardwareBack";

interface ExerciseNoteModalProps {
  exerciseName: string;
  open: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

type View =
  | { kind: "list" }
  | { kind: "note"; id: string }
  | { kind: "editor"; id?: string };

export default function ExerciseNoteModal({
  exerciseName,
  open,
  onClose,
  onSaved,
}: ExerciseNoteModalProps) {
  // The parent remounts this modal with a key when it opens, so the list is
  // read once per open and the first thing shown is what was already saved.
  const [view, setView] = useState<View>({ kind: "list" });
  const [version, setVersion] = useState(0);

  // Clicking the note icon opens this sheet. It leaves on the X, a backdrop
  // tap, or the phone's Back button; only an explicit save keeps the logging
  // page otherwise untouched.
  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeRef.current();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);
  useHardwareBack(open, () => closeRef.current());

  const notes = useMemo(() => {
    void version;
    return getExerciseNotes(exerciseName);
  }, [exerciseName, version]);

  if (!open) return null;

  const activeNote = view.kind === "note" ? notes.find((note) => note.id === view.id) ?? null : null;
  const editingNote =
    view.kind === "editor" && view.id ? notes.find((note) => note.id === view.id) ?? null : null;

  const refresh = () => {
    setVersion((value) => value + 1);
    onSaved?.();
  };

  const backToList = () => setView({ kind: "list" });

  const handleDelete = (note: ExerciseNote) => {
    deleteExerciseNote(exerciseName, note.id);
    refresh();
    backToList();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className="fixed inset-0 z-[220] bg-black/80 backdrop-blur-sm flex items-end md:items-center justify-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        className="w-full md:max-w-md bg-tracker-bg border border-tracker-border rounded-t-[2rem] md:rounded-[2rem] p-6 pb-8 max-h-[85dvh] flex flex-col"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Header: a back arrow only appears once there is somewhere to go back to */}
        <div className="flex items-start justify-between gap-4 mb-5 shrink-0">
          <div className="flex items-start gap-3 min-w-0">
            {(view.kind === "note" || view.kind === "editor") && (
              <button
                onClick={backToList}
                className="w-9 h-9 shrink-0 -ml-1 rounded-full flex items-center justify-center text-tracker-text-soft hover:text-tracker-text-bold transition-colors"
                aria-label="Back to notes"
              >
                <ArrowLeft size={18} />
              </button>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-tracker-accent mb-1">
                <MessageSquare size={14} />
                <span className="text-[9px] font-black uppercase tracking-[0.2em]">
                  {view.kind === "list"
                    ? notes.length === 1
                      ? "1 Note"
                      : `${notes.length} Notes`
                    : "Exercise Note"}
                </span>
              </div>
              <h3 className="text-base font-black uppercase tracking-wider text-tracker-text-bold truncate">
                {exerciseName}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 shrink-0 rounded-full bg-tracker-card flex items-center justify-center text-tracker-text-soft hover:text-tracker-text-bold transition-colors"
            aria-label="Close notes"
          >
            <X size={17} />
          </button>
        </div>

        {view.kind === "list" && (
          <NoteList
            notes={notes}
            onOpen={(note) => setView({ kind: "note", id: note.id })}
            onCreate={() => setView({ kind: "editor" })}
          />
        )}

        {view.kind === "note" && activeNote && (
          <NoteDetail
            note={activeNote}
            onEdit={() => setView({ kind: "editor", id: activeNote.id })}
            onDelete={() => handleDelete(activeNote)}
          />
        )}

        {view.kind === "editor" && (
          <NoteEditor
            key={editingNote?.id ?? "new"}
            note={editingNote}
            onCancel={() => {
              if (editingNote) setView({ kind: "note", id: editingNote.id });
              else backToList();
            }}
            onDelete={editingNote ? () => handleDelete(editingNote) : undefined}
            onSave={(text, title) => {
              if (editingNote) {
                updateExerciseNote(exerciseName, editingNote.id, text, title);
                refresh();
                setView({ kind: "note", id: editingNote.id });
              } else {
                const saved = addExerciseNote(exerciseName, text, title);
                refresh();
                if (saved) setView({ kind: "note", id: saved.id });
                else backToList();
              }
            }}
          />
        )}
      </motion.div>
    </motion.div>
  );
}

function NoteList({
  notes,
  onOpen,
  onCreate,
}: {
  notes: ExerciseNote[];
  onOpen: (note: ExerciseNote) => void;
  onCreate: () => void;
}) {
  return (
    <div className="flex flex-col min-h-0">
      {notes.length === 0 ? (
        <p className="text-sm text-tracker-text-soft leading-relaxed mb-5">
          No notes yet. Save cues, setup reminders, or what worked last time — each one is kept separately.
        </p>
      ) : (
        <div className="-mx-1 px-1 overflow-y-auto custom-scrollbar flex flex-col gap-2 mb-4 min-h-0">
          {notes.map((note) => (
            <button
              key={note.id}
              onClick={() => onOpen(note)}
              className="w-full text-left rounded-xl bg-tracker-card border border-tracker-border hover:border-tracker-accent/60 p-4 transition-colors"
            >
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-[11px] font-black uppercase tracking-[0.14em] text-tracker-text-bold truncate">
                  {noteTitle(note)}
                </span>
                <span className="text-[9px] font-bold tabular-nums uppercase tracking-widest text-tracker-text-soft shrink-0">
                  {formatNoteDate(note.updatedAt)}
                </span>
              </div>
              <p className="mt-1 text-xs text-tracker-text-soft leading-relaxed line-clamp-2 break-words">
                {notePreview(note)}
              </p>
            </button>
          ))}
        </div>
      )}

      <button
        onClick={onCreate}
        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-tracker-accent text-tracker-text-bold text-[11px] font-black uppercase tracking-[0.18em]"
      >
        <Plus size={15} strokeWidth={3} />
        New Note
      </button>
    </div>
  );
}

function NoteDetail({
  note,
  onEdit,
  onDelete,
}: {
  note: ExerciseNote;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex flex-col min-h-0">
      <p className="text-[10px] font-bold uppercase tracking-widest text-tracker-text-soft mb-2">
        {formatNoteDate(note.updatedAt)}
      </p>
      {note.title?.trim() && (
        <h4 className="text-sm font-black uppercase tracking-wider text-tracker-text-bold mb-2">
          {note.title.trim()}
        </h4>
      )}
      <div className="overflow-y-auto custom-scrollbar rounded-xl bg-tracker-card border border-tracker-border p-4 mb-5 min-h-0">
        <p className="text-sm text-tracker-text-bold leading-relaxed whitespace-pre-wrap break-words">{note.text}</p>
      </div>
      <div className="flex gap-3 shrink-0">
        <button
          onClick={onEdit}
          className="flex-1 py-3 rounded-xl bg-tracker-card border border-tracker-border text-tracker-text-bold text-[11px] font-black uppercase tracking-[0.18em] hover:border-tracker-accent/60 transition-colors"
        >
          Edit
        </button>
        <button
          onClick={onDelete}
          className="w-12 flex items-center justify-center rounded-xl border border-tracker-border text-tracker-text-soft hover:text-red-400 hover:border-red-900/60 transition-colors"
          aria-label="Delete note"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}

function NoteEditor({
  note,
  onCancel,
  onSave,
  onDelete,
}: {
  note: ExerciseNote | null;
  onCancel: () => void;
  onSave: (text: string, title: string) => void;
  onDelete?: () => void;
}) {
  const [title, setTitle] = useState(note?.title ?? "");
  const [text, setText] = useState(note?.text ?? "");

  const canSave = text.trim().length > 0;

  return (
    <div className="flex flex-col min-h-0">
      <input
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        maxLength={80}
        autoFocus={!note}
        placeholder="Title (optional)"
        className="w-full rounded-xl bg-tracker-card border border-tracker-border px-4 py-3 text-sm font-bold text-tracker-text-bold placeholder:text-tracker-text-soft/60 placeholder:font-medium outline-none focus:border-tracker-accent transition-colors"
      />
      <textarea
        value={text}
        onChange={(event) => setText(event.target.value)}
        maxLength={NOTE_MAX_LENGTH}
        rows={6}
        autoFocus={!!note}
        placeholder="e.g. Squeeze at the top for a stronger contraction."
        className="mt-3 w-full resize-none rounded-xl bg-tracker-card border border-tracker-border p-4 text-sm text-tracker-text-bold placeholder:text-tracker-text-soft/50 outline-none focus:border-tracker-accent transition-colors"
      />
      <div className="flex items-center justify-between mt-2 mb-5">
        <span className="text-[9px] font-bold uppercase tracking-widest text-tracker-text-soft">
          Saved on this exercise, not this split
        </span>
        <span className="text-[9px] font-bold tabular-nums text-tracker-text-soft">
          {text.length}/{NOTE_MAX_LENGTH}
        </span>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => onSave(text, title)}
          disabled={!canSave}
          className="flex-[2] py-3 rounded-xl bg-tracker-accent text-tracker-text-bold text-[11px] font-black uppercase tracking-[0.18em] disabled:opacity-40 transition-opacity"
        >
          {note ? "Save Changes" : "Save Note"}
        </button>
        {onDelete ? (
          <button
            onClick={onDelete}
            className="w-12 flex items-center justify-center rounded-xl border border-tracker-border text-tracker-text-soft hover:text-red-400 hover:border-red-900/60 transition-colors"
            aria-label="Delete note"
          >
            <Trash2 size={16} />
          </button>
        ) : (
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl border border-tracker-border text-tracker-text-soft hover:text-tracker-text-bold text-[11px] font-black uppercase tracking-[0.18em] transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
