import { atom } from "nanostores";

type entry = {
  state: "loading" | "success" | "error";
};
type spinnerDictionary = {
  [id: string]: entry;
};

export const spinnersStore = atom<spinnerDictionary>({});

export const changeSpinnerState = (id: string, state: "loading" | "success" | "error") => {
  console.log(id, state);
  const prev = spinnersStore.get();
  prev[id] = { state };
  spinnersStore.set(prev);
};

export function addSpinner(id: string) {
  const prev = spinnersStore.get();
  prev[id] = { state: "loading" };
  spinnersStore.set(prev);
}

export function removeSpinner(id: string) {
  const prev = spinnersStore.get();
  delete prev[id];
  spinnersStore.set(prev);
}
