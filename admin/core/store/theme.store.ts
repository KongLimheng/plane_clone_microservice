import { action, makeObservable, observable } from "mobx";
import { CoreRootStore } from "./root.store";

type TTheme = "dark" | "light";

export interface IThemeStore {
  isNewUserPopup: boolean;
  theme: string | undefined;
  isSidebarCollapsed: boolean | undefined;

  // action
  hydrate: (data: any) => void;
  toggleNewUserPopup: () => void;
  toggleSidebar: (collapsed: boolean) => void;
  setTheme: (currentTheme: TTheme) => void;
}

export class ThemeStore implements IThemeStore {
  isNewUserPopup: boolean = false;
  isSidebarCollapsed: boolean | undefined = undefined;
  theme: string | undefined = undefined;

  constructor(private store: CoreRootStore) {
    makeObservable(this, {
      isNewUserPopup: observable.ref,
      isSidebarCollapsed: observable.ref,
      theme: observable.ref,
      // action

      toggleNewUserPopup: action,
      toggleSidebar: action,
      setTheme: action,
    });
  }

  hydrate = (data: any) => {
    if (data) this.theme = data;
  };

  /**
   * @description Toggle the new user popup modal
   */
  toggleNewUserPopup = () => (this.isNewUserPopup = !this.isNewUserPopup);

  /**
   * @description Toggle the sidebar collapsed state
   * @param isCollapsed
   */
  toggleSidebar = (isCollapsed: boolean) => {
    if (isCollapsed === undefined) this.isSidebarCollapsed = !this.isSidebarCollapsed;
    else this.isSidebarCollapsed = isCollapsed;

    localStorage.setItem("god_mode_sidebar_collapsed", isCollapsed.toString());
  };

  setTheme = async (currentTheme: TTheme) => {
    try {
      localStorage.setItem("theme", currentTheme);
      this.theme = currentTheme;
    } catch (error) {
      console.error("setting user theme error", error);
    }
  };
}
