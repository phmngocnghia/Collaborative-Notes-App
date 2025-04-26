import { useEffect, useState } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import "quill/dist/quill.snow.css";
import { TextField, Button, List, ListItem } from "@mui/material";
import { Notes } from "./types";

// Helper function to store and get notes from localStorage
const saveNotesToLocalStorage = (notes: Notes) => {
  localStorage.setItem("notes", JSON.stringify(notes));
};

const getNotesFromLocalStorage = () => {
  return JSON.parse(localStorage.getItem("notes") || "") || {};
};

const generateRandomId = () => {
  return Math.random().toString(36).substring(2, 10); // Generate a random string
};

const App = () => {
  const [notes, setNotes] = useState<Notes>(getNotesFromLocalStorage());
  const [currentNoteId, setCurrentNoteId] = useState<string | null>(null);
  const [noteContent, setNoteContent] = useState("");
  const [noteTitle, setNoteTitle] = useState("");

  const onChangeContent = (updatedContent: string) => {
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

  const onChangeTitle = (updatedTitle: string) => {
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
    const handleStorageEvent = (e: StorageEvent) => {
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

  useEffect(() => {
    // Select the first note by default or create a new note if none exist
    if (Object.keys(notes).length > 0) {
      const firstNoteId = Object.keys(notes)[0];
      setCurrentNoteId(firstNoteId);
      const firstNote = notes[firstNoteId];
      setNoteTitle(firstNote.title);
      setNoteContent(firstNote.content);
    } else {
      createNote(); // Create a new note if no notes exist
    }
  }, []); // Run only once on component mount

  const createNote = () => {
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
    saveNotesToLocalStorage(newNotes);
  };

  const deleteNote = (noteId: string) => {
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

  const selectNote = (noteId: string) => {
    setCurrentNoteId(noteId);
    const selectedNote = notes[noteId];
    if (selectedNote) {
      setNoteTitle(selectedNote.title);
      setNoteContent(selectedNote.content);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="p-4 border-b">
        <Button onClick={createNote}>Create New Note</Button>
      </div>
      <div className="flex flex-1">
        {/* Notes List */}
        <div className="w-1/4 border-r p-4 overflow-y-auto">
          <h3 className="text-lg font-bold mb-1">Notes List:</h3>
          <List>
            {Object.keys(notes).map((noteId) => {
              const note = notes[noteId];
              let displayTitle = note.title || "Untitled";

              // Truncate the title to a maximum of 10 characters
              if (displayTitle.length > 10) {
                displayTitle = displayTitle.slice(0, 20) + "...";
              }

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
                <ListItem key={noteId} className="mb-4">
                  <span
                    onClick={() => selectNote(noteId)}
                    className="block w-full text-left p-2 bg-gray-100 rounded hover:bg-gray-200"
                  >
                    <div className="flex">
                      <div className="mr-auto"> {displayTitle} </div>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent the click event from bubbling up to the ListItem
                          deleteNote(noteId);
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                    <small>{formattedTimestamp}</small>
                  </span>
                </ListItem>
              );
            })}
          </List>
        </div>

        {/* Editor */}
        <div className="flex-1 p-4">
          {currentNoteId ? (
            <>
              <div className="mb-4">
                <TextField
                  label="Note Title"
                  type="text"
                  value={noteTitle}
                  onChange={(e) => onChangeTitle(e.target.value)}
                  placeholder="Note Title"
                  className="w-full"
                />
              </div>
              <ReactQuill
                theme="snow"
                value={noteContent}
                onChange={onChangeContent}
                className="h-[calc(100%-50px)]"
              />
            </>
          ) : (
            <p className="text-gray-500">
              Select or create a note to start editing.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
