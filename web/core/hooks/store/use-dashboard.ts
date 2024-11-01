import { useContext } from "react";
// mobx store
import { StoreContext } from "@/lib/store-context";
import { IDashboardStore } from "@/store/dashboard.store";
// types

export const useDashboard = (): IDashboardStore => {
  const context = useContext(StoreContext);
  if (context === undefined) throw new Error("useDashboard must be used within StoreProvider");
  return context.dashboard;
};
