import { useContext } from "react";
// mobx store
import { StoreContext } from "@/lib/store-context";
import { ICommandPaletteStore } from "@/store/base-command-palette.store";
// types

export const useCommandPalette = (): ICommandPaletteStore => {
  const context = useContext(StoreContext);
  if (context === undefined) throw new Error("useCommandPalette must be used within StoreProvider");
  return context.commandPalette;
};
