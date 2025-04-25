// src/App.jsx
import React, { useEffect, useState } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import "quill/dist/quill.snow.css";

// Helper function to store and get notes from localStorage
const saveNotesToLocalStorage = (notes) => {
  localStorage.setItem("notes", JSON.stringify(notes));
};

const getNotesFromLocalStorage = () => {
  return JSON.parse(localStorage.getItem("notes")) || {};
};

const generateRandomId = () => {
  return Math.random().toString(36).substring(2, 10); // Generate a random string
};

const App = () => {
  const [notes, setNotes] = useState(getNotesFromLocalStorage());
  const [currentNoteId, setCurrentNoteId] = useState(null);
  const [noteContent, setNoteContent] = useState("");
  const [noteTitle, setNoteTitle] = useState("");

  const onChangeContent = (updatedContent) => {
    setNoteContent(updatedContent);

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
      saveNotesToLocalStorage(updatedNotes);
    }
  };

  const onChangeTitle = (updatedTitle) => {
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
      saveNotesToLocalStorage(updatedNotes);
    }
  };

  useEffect(() => {
    // Sync data across tabs using localStorage
    const handleStorageEvent = (e) => {
      if (e.key === "notes" && e.newValue) {
        const updatedNotes = JSON.parse(e.newValue);
        setNotes(updatedNotes);
        if (currentNoteId && updatedNotes[currentNoteId]) {
          const { title, content, timestamp } = updatedNotes[currentNoteId];
          if (timestamp > Date.now() - 1000) {
            setNoteTitle(title);
            setNoteContent(content);
          }
        }
      }
    };

    window.addEventListener("storage", handleStorageEvent);

    return () => {
      window.removeEventListener("storage", handleStorageEvent);
    };
  }, [currentNoteId, notes]);

  const createNote = () => {
    const newNoteId = generateRandomId();

    // Format the current date and time

    const newNotes = {
      ...notes,
      [newNoteId]: { title: noteTitle, content: "", timestamp: Date.now() },
    };

    setNotes(newNotes);
    setCurrentNoteId(newNoteId);
    setNoteTitle(noteTitle);
    setNoteContent("");
    saveNotesToLocalStorage(newNotes);
  };

  const deleteNote = (noteId) => {
    if (window.confirm("Are you sure you want to delete this note?")) {
      const newNotes = { ...notes };
      delete newNotes[noteId];
      setNotes(newNotes);
      saveNotesToLocalStorage(newNotes);
      if (currentNoteId === noteId) {
        setCurrentNoteId(null);
        setNoteTitle("");
        setNoteContent("");
      }
    }
  };

  const selectNote = (noteId) => {
    setCurrentNoteId(noteId);
    const selectedNote = notes[noteId];
    if (selectedNote) {
      setNoteTitle(selectedNote.title);
      setNoteContent(selectedNote.content);
    }
  };

  return (
    <div>
      <h1>Collaborative Notes</h1>
      <div>
        <button onClick={createNote}>Create New Note</button>
      </div>
      <div>
        <h3>Notes List:</h3>
        <ul>
          {Object.keys(notes).map((noteId) => {
            const note = notes[noteId];
            const displayTitle = note.title || "Untitled";

            // Format the timestamp for display
            const formattedTimestamp = new Intl.DateTimeFormat("en-GB", {
              weekday: "long",
              day: "2-digit",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }).format(note.timestamp);

            return (
              <li key={noteId}>
                <button onClick={() => selectNote(noteId)}>
                  {`${displayTitle} - ${formattedTimestamp}`}
                </button>
                <button onClick={() => deleteNote(noteId)}>Delete</button>
              </li>
            );
          })}
        </ul>
      </div>
      {currentNoteId && (
        <div>
          <input
            type="text"
            value={noteTitle}
            onChange={(e) => onChangeTitle(e.target.value)}
            placeholder="Note Title"
            style={{
              width: "100%",
              marginBottom: "10px",
              padding: "5px",
              fontSize: "16px",
            }}
          />
          <ReactQuill
            theme="snow"
            value={noteContent}
            onChange={onChangeContent}
          />
        </div>
      )}
    </div>
  );
};

export default App;
