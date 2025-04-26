// Define the structure of a single note
interface Note {
  title: string;
  content: string;
  timestamp: number;
}

// Define the structure of the notes object
export type Notes = Record<string, Note>;
