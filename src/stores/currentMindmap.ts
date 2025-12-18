import { atom } from "nanostores";

export const currentMindmap = atom<string | null>(null);

export const appendToCurrentMindmap = (mindmap: string) => {
  const prev = currentMindmap.get();
  currentMindmap.set(prev + mindmap);
};


