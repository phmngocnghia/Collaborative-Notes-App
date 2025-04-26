import React, { useRef, useState, useEffect, useMemo } from "react";
import { Button } from "@mui/material";
import { FixedSizeList as List } from "react-window";
import { Notes } from "../types";
import useBreakpoint from "use-breakpoint";
import throttle from "lodash.throttle";

interface NotesListProps {
  notes: Notes;
  selectNote: (noteId: string) => void;
  deleteNote: (noteId: string) => void;
}

const BREAKPOINTS = { mobile: 0, tablet: 768, desktop: 1280 };
const getRowWithByBreakPoint = (
  breakpoint: keyof typeof BREAKPOINTS | null
) => {
  switch (breakpoint) {
    case "mobile":
    case "tablet":
      return 110;
    default: // desktop
      return 90;
  }
};

const NotesList: React.FC<NotesListProps> = ({
  notes,
  selectNote,
  deleteNote,
}) => {
  const noteIds = Object.keys(notes);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerHeight, setContainerHeight] = useState(500);
  const { breakpoint } = useBreakpoint(BREAKPOINTS);

  const rowHeight = useMemo(
    () => getRowWithByBreakPoint(breakpoint),
    [breakpoint]
  );

  useEffect(() => {
    // Throttle the height update function
    const updateHeight = throttle(() => {
      if (containerRef.current) {
        setContainerHeight(containerRef.current.offsetHeight);
      }
    }, 100);

    // Set initial height
    updateHeight();

    window.addEventListener("resize", updateHeight);

    return () => {
      window.removeEventListener("resize", updateHeight);
      updateHeight.cancel(); // Cancel any pending throttled calls
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
    const displayTitle = note.title || "Untitled";

    const formattedTimestamp = new Intl.DateTimeFormat("en-GB", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(note.timestamp);

    return (
      <div
        onClick={() => selectNote(noteId)}
        style={style}
        key={noteId}
        className="block w-full"
      >
        <div className="p-2 bg-gray-100 rounded hover:bg-gray-200">
          <div className="flex flex-nowrap">
            <div className="mr-auto w-full lg:w-auto truncate">
              {displayTitle}
            </div>
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
        </div>
      </div>
    );
  };

  return (
    <div
      className="md:w-1/4 h-[300px] md:h-full border-r p-4 pb-8"
      ref={containerRef}
    >
      <List
        // 32 is padding of container
        height={containerHeight - 32}
        itemCount={noteIds.length}
        itemSize={rowHeight}
        width="100%"
      >
        {Row}
      </List>
    </div>
  );
};

export default NotesList;
