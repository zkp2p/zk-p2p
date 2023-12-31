import React, { useCallback } from "react";


export const useFileBrowser = () => {
  const openFileDialog = useCallback((fileInputRef: React.RefObject<HTMLInputElement>) => {
    fileInputRef.current?.click();
  }, []);

  return { openFileDialog };
};
