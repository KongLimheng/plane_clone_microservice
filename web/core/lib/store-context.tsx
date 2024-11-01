"use client";

import { createContext, PropsWithChildren } from "react";
import { RootStore } from "@/plane-web/store/root.store";

export let rootStore = new RootStore();

export const StoreContext = createContext(rootStore);

const initializeStore = () => {
  const newRootStore = rootStore ?? new RootStore();
  if (typeof window === "undefined") return newRootStore;
  if (!rootStore) rootStore = newRootStore;
  return newRootStore;
};

export const store = initializeStore();

export const StoreProvider = ({ children }: PropsWithChildren) => (
  <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
);
