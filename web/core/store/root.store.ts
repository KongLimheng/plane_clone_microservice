import { CommandPaletteStore, ICommandPaletteStore } from "./command-palette.store";
import { DashboardStore, IDashboardStore } from "./dashboard.store";
import { IInstanceStore, InstanceStore } from "./instance.store";
import { IRouterStore, RouterStore } from "./router.store";
import { IThemeStore, ThemeStore } from "./theme.store";
import { IUserStore, UserStore } from "./user";
import { IWorkspaceRootStore, WorkspaceRootStore } from "./workspace";

export class CoreRootStore {
  router: IRouterStore;
  theme: IThemeStore;
  user: IUserStore;
  workspaceRoot: IWorkspaceRootStore;
  instance: IInstanceStore;
  commandPalette: ICommandPaletteStore;
  dashboard: IDashboardStore;

  constructor() {
    this.router = new RouterStore();
    this.theme = new ThemeStore();
    this.user = new UserStore(this);
    this.workspaceRoot = new WorkspaceRootStore(this);
    this.instance = new InstanceStore();
    this.commandPalette = new CommandPaletteStore();
    this.dashboard = new DashboardStore(this);
  }

  resetOnSignOut() {
    // handling the system theme when user logged out from the app
    localStorage.setItem("theme", "system");

    this.router = new RouterStore();
    this.theme = new ThemeStore();
    this.user = new UserStore(this);
    this.workspaceRoot = new WorkspaceRootStore(this);
    this.instance = new InstanceStore();
    this.commandPalette = new CommandPaletteStore();
    this.dashboard = new DashboardStore(this);
  }
}
