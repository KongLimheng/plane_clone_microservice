import { useContext } from "react";
import { StoreContext } from "@/lib/store-provider";
import { IInstanceStore } from "@/store/instance.store";

export const useInstance = (): IInstanceStore => {
  const context = useContext(StoreContext);
  if (context === undefined) throw new Error("useInstance must be used within StoreProvider");
  return context.instance;
};
