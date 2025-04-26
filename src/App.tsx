import { useEffect, useState, useCallback } from "react";
import debounce from "lodash.debounce";
import "react-quill-new/dist/quill.snow.css";
import "quill/dist/quill.snow.css";
import { Button } from "@mui/material";
import { Notes } from "./types";
import NotesList from "./components/NotesList";
import Editor from "./components/Editor";

const saveNotesToLocalStorage = (notes: Notes) => {
  localStorage.setItem("notes", JSON.stringify(notes));
};

const debouncedSaveNotesToLocalStorage = debounce(saveNotesToLocalStorage, 500);

const getNotesFromLocalStorage = (): Notes => {
  return JSON.parse(localStorage.getItem("notes") || "{}") || {};
};

const generateRandomId = () => {
  return Math.random().toString(36).substring(2, 10);
};

const App = () => {
  const [notes, setNotes] = useState<Notes>(getNotesFromLocalStorage());
  const [currentNoteId, setCurrentNoteId] = useState<string | null>(null);
  const [noteContent, setNoteContent] = useState("");
  const [noteTitle, setNoteTitle] = useState("");

  const onChangeContent = useCallback(
    (updatedContent: string) => {
      setNoteContent(updatedContent);

      // shouldn't happen, just guard. currentNoteId = null, quill editor is hidden
      if (currentNoteId) {
        const timestamp = Date.now();
        const updatedNotes = {
          ...notes,
          [currentNoteId]: {
            title: noteTitle,
            content: updatedContent,
            timestamp,
          },
        };
        setNotes(updatedNotes);
        debouncedSaveNotesToLocalStorage(updatedNotes); // Use debounced function
      }
    },
    [currentNoteId, noteTitle, notes]
  );

  const onChangeTitle = useCallback(
    (updatedTitle: string) => {
      setNoteTitle(updatedTitle);

      if (currentNoteId) {
        const timestamp = Date.now();
        const updatedNotes = {
          ...notes,
          [currentNoteId]: {
            title: updatedTitle,
            content: noteContent,
            timestamp,
          },
        };
        setNotes(updatedNotes);
        debouncedSaveNotesToLocalStorage(updatedNotes); // Use debounced function
      }
    },
    [currentNoteId, noteContent, notes]
  );

  const createNote = useCallback(() => {
    const newNoteId = generateRandomId();

    const newNotes = {
      ...notes,
      [newNoteId]: {
        title: "Untitled",
        content: "",
        timestamp: Date.now(),
      },
    };

    setNotes(newNotes);
    setCurrentNoteId(newNoteId);
    setNoteTitle("Untitled");
    setNoteContent("");
    debouncedSaveNotesToLocalStorage(newNotes);
  }, [notes]);

  const deleteNote = useCallback(
    (noteId: string) => {
      if (window.confirm("Are you sure you want to delete this note?")) {
        const newNotes = { ...notes };
        delete newNotes[noteId];
        setNotes(newNotes);
        debouncedSaveNotesToLocalStorage(newNotes);

        // handle delete current opened note
        if (currentNoteId === noteId) {
          const remainingNoteIds = Object.keys(newNotes);

          // focus on the first remaining note
          if (remainingNoteIds.length > 0) {
            // Focus on the first remaining note
            const firstNoteId = remainingNoteIds[0];
            setCurrentNoteId(firstNoteId);
            const firstNote = newNotes[firstNoteId];
            setNoteTitle(firstNote.title);
            setNoteContent(firstNote.content);
          } else {
            // clear editor
            setCurrentNoteId(null);
            setNoteTitle("");
            setNoteContent("");
          }
        }
      }
    },
    [currentNoteId, notes]
  );

  const selectNote = useCallback(
    (noteId: string) => {
      setCurrentNoteId(noteId);
      const selectedNote = notes[noteId];
      if (selectedNote) {
        setNoteTitle(selectedNote.title);
        setNoteContent(selectedNote.content);
      }
    },
    [notes]
  );

  useEffect(() => {
    // Sync data across tabs using localStorage
    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key === "notes" && e.newValue) {
        const updatedNotes = JSON.parse(e.newValue);

        const isCurrentNoteBeingUpdated =
          currentNoteId && updatedNotes[currentNoteId];
        if (isCurrentNoteBeingUpdated) {
          const incomingNote = updatedNotes[currentNoteId];
          const currentNote = notes[currentNoteId];

          // First write wins: Ignore the update if the incoming note is older
          if (incomingNote.timestamp < currentNote.timestamp) {
            return;
          }

          // Update the current note if the incoming note is newer or equal
          setNoteTitle(incomingNote.title);
          setNoteContent(incomingNote.content);
        }

        setNotes(updatedNotes);
      }
    };

    window.addEventListener("storage", handleStorageEvent);

    return () => {
      window.removeEventListener("storage", handleStorageEvent);
    };
  }, [currentNoteId, notes]);

  useEffect(() => {
    if (currentNoteId) {
      return;
    }

    // select note 0 by default
    if (Object.keys(notes).length > 0) {
      const firstNoteId = Object.keys(notes)[0];
      setCurrentNoteId(firstNoteId);
      const firstNote = notes[firstNoteId];
      setNoteTitle(firstNote.title);
      setNoteContent(firstNote.content);
    }
  }, []);

  return (
    <div className="flex flex-col h-screen">
      <div className="p-4 border-b">
        <Button onClick={createNote}>Create New Note</Button>
      </div>
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        <NotesList
          notes={notes}
          selectNote={selectNote}
          deleteNote={deleteNote}
        />

        <Editor
          noteTitle={noteTitle}
          noteContent={noteContent}
          onChangeContent={onChangeContent}
          onChangeTitle={onChangeTitle}
        />
      </div>
    </div>
  );
};

export default App;
