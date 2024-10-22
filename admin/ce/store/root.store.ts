import { enableStaticRendering } from "mobx-react";
import { CoreRootStore } from "@/store/root.store";

enableStaticRendering(typeof window === "undefined");

export class RootStore extends CoreRootStore {
  constructor() {
    super();
  }

  hydrate(initialData: any): void {
    super.hydrate(initialData);
  }

  resetOnSignOut(): void {
    super.resetOnSignOut();
  }
}
