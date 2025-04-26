import React from "react";
import { TextField } from "@mui/material";
import ReactQuill from "react-quill-new";

interface EditorProps {
  noteTitle: string;
  noteContent: string;
  onChangeTitle: (title: string) => void;
  onChangeContent: (content: string) => void;
}

const Editor: React.FC<EditorProps> = ({
  noteTitle,
  noteContent,
  onChangeTitle,
  onChangeContent,
}) => {
  return (
    <div className="flex-1 px-4 py-7 h-full flex flex-col flex-wrap">
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
        className="flex flex-col flex-1"
      />
    </div>
  );
};

export default Editor;
