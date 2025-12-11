import { atom } from "nanostores";

type FileLoaded = {
  id: string;
  name: string;
};

export type IndexFile = {
  indexes: string[];
  stagedIndexes: string[];
  files: {
    [id: string]: File | FileLoaded | null;
  };
};

export const fileStore = atom<IndexFile>({
  indexes: [],
  stagedIndexes: [],
  files: {},
});

export const setFiles = (files: any) => {
  const prevState = fileStore.get();
  const newFiles = { ...prevState.files, ...files };
  const newIndexes = [...prevState.indexes, ...Object.keys(files)];
  fileStore.set({
    indexes: newIndexes,
    stagedIndexes: prevState.stagedIndexes,
    files: newFiles,
  });
};

export const setStagedFiles = (stagedIndexes: any) => {
  const prevState = fileStore.get();
  fileStore.set({
    indexes: prevState.indexes,
    stagedIndexes: stagedIndexes,
    files: prevState.files,
  });
};
