import { useContext } from "react";
// mobx store
import { StoreContext } from "@/lib/store-context";
import { IWorkspaceRootStore } from "@/store/workspace";
// types

export const useWorkspace = (): IWorkspaceRootStore => {
  const context = useContext(StoreContext);
  if (context === undefined) throw new Error("useWorkspace must be used within StoreProvider");
  return context.workspaceRoot;
};
