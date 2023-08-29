import React, { useCallback, useState } from "react";

export const useDragAndDrop = () => {
  const [dragging, setDragging] = useState(false);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, onDrop: (file: File) => void) => {
      e.preventDefault();
      e.stopPropagation();
      setDragging(false);

      const files = e.dataTransfer.files;

      if (files.length > 0) {
        onDrop(files[0]);
      }
    },
    []
  );

  const handleDragEnd = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		setDragging(false);
  }, []);

  return {
    dragging,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
    handleDragEnd,
  };
};

export function processEMLContent(content: string): string {
  let resultLines: string[] = [];
  let isDKIMOrContent = false;
  let buffer = "";
  
  let DKIM_SIGNATURE_REGEX = 'DKIM-Signature: v=1;';
  let CONTENT_TYPE_REGEX = 'Content-Type: multipart/alternative'

  const lines = content.split('\n');
  for (let line of lines) {

    if (line.startsWith(DKIM_SIGNATURE_REGEX) || line.startsWith(CONTENT_TYPE_REGEX)) {
      if (isDKIMOrContent) {
        // Flush the buffer to the result lines
        resultLines.push(buffer.trim());
        buffer = "";
      }

      // Start or continue the DKIM buffer with the current line
      buffer += line.trim();
      isDKIMOrContent = true;
    } else if (isDKIMOrContent && (line.startsWith('\t') || line.startsWith(' '))) {
      // Append lines belonging to the DKIM signature
      buffer += ' ' + line.trim();
    } else {
      // Flush the DKIM buffer to the result lines
      if (buffer) {
        resultLines.push(buffer.trim());
        buffer = "";
        isDKIMOrContent = false;
      }

      // Intentionally not trimming the line to preserve the original formatting
      resultLines.push(line);
    }
  }

  return resultLines.join('\n').trim();
};
