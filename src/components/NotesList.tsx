import React, { useRef, useState, useEffect } from "react";
import { Button } from "@mui/material";
import { FixedSizeList as List } from "react-window";
import { Notes } from "../types";

interface NotesListProps {
  notes: Notes;
  selectNote: (noteId: string) => void;
  deleteNote: (noteId: string) => void;
}

const NotesList: React.FC<NotesListProps> = ({
  notes,
  selectNote,
  deleteNote,
}) => {
  const noteIds = Object.keys(notes);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerHeight, setContainerHeight] = useState(500);

  useEffect(() => {
    // Update the height of the container dynamically
    const updateHeight = () => {
      if (containerRef.current) {
        setContainerHeight(containerRef.current.offsetHeight);
      }
    };

    // Set initial height
    updateHeight();

    window.addEventListener("resize", updateHeight);

    return () => {
      window.removeEventListener("resize", updateHeight);
    };
  }, []);

  const Row = ({
    index,
    style,
  }: {
    index: number;
    style: React.CSSProperties;
  }) => {
    const noteId = noteIds[index];
    const note = notes[noteId];
    let displayTitle = note.title || "Untitled";

    // Truncate the title to a maximum of 10 characters
    if (displayTitle.length > 10) {
      displayTitle = displayTitle.slice(0, 10) + "...";
    }

    const formattedTimestamp = new Intl.DateTimeFormat("en-GB", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(note.timestamp);

    return (
      <div style={style} key={noteId} className="mb-4">
        <span
          onClick={() => selectNote(noteId)}
          className="block w-full text-left p-2 bg-gray-100 rounded hover:bg-gray-200"
        >
          <div className="flex">
            <div className="mr-auto">{displayTitle}</div>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                deleteNote(noteId);
              }}
            >
              Delete
            </Button>
          </div>
          <small>{formattedTimestamp}</small>
        </span>
      </div>
    );
  };

  return (
    <div className="w-1/4 border-r p-4  pb-8" ref={containerRef}>
      <List
        // 32 is padding of container
        height={containerHeight - 32}
        itemCount={noteIds.length}
        itemSize={80}
        width="100%"
      >
        {Row}
      </List>
    </div>
  );
};

export default NotesList;
