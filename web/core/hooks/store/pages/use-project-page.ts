import { useContext } from "react";
// context
import { StoreContext } from "@/lib/store-context";
import { IProjectPageStore } from "@/store/pages/project-page.store";
// mobx store

export const useProjectPages = (): IProjectPageStore => {
  const context = useContext(StoreContext);
  if (context === undefined) throw new Error("useProjectPage must be used within StoreProvider");
  return context.projectPages;
};
