import { IRouterStore, RouterStore } from "./router.store";
import { IThemeStore, ThemeStore } from "./theme.store";
import { IUserStore, UserStore } from "./user";

export class CoreRootStore {
  router: IRouterStore;
  theme: IThemeStore;
  user: IUserStore;

  constructor() {
    this.router = new RouterStore();
    this.theme = new ThemeStore();
    this.user = new UserStore(this);
  }

  resetOnSignOut() {
    // handling the system theme when user logged out from the app
    localStorage.setItem("theme", "system");

    this.router = new RouterStore();
    this.theme = new ThemeStore();
    this.user = new UserStore(this);
  }
}
