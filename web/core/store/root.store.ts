import { enableStaticRendering } from "mobx-react";
import { CommandPaletteStore, ICommandPaletteStore } from "./command-palette.store";
import { DashboardStore, IDashboardStore } from "./dashboard.store";
import { IInstanceStore, InstanceStore } from "./instance.store";
import { IIssueRootStore, IssueRootStore } from "./issue/root.store";
import { IMemberRootStore, MemberRootStore } from "./memeber";
import { IProjectPageStore, ProjectPageStore } from "./pages/project-page.store";
import { IProjectRootStore, ProjectRootStore } from "./project";
import { IRouterStore, RouterStore } from "./router.store";
import { IThemeStore, ThemeStore } from "./theme.store";
import { IUserStore, UserStore } from "./user";
import { IWorkspaceRootStore, WorkspaceRootStore } from "./workspace";

enableStaticRendering(typeof window === "undefined");

export class CoreRootStore {
  router: IRouterStore;
  theme: IThemeStore;
  user: IUserStore;
  instance: IInstanceStore;
  commandPalette: ICommandPaletteStore;
  dashboard: IDashboardStore;
  workspaceRoot: IWorkspaceRootStore;
  memberRoot: IMemberRootStore;
  projectRoot: IProjectRootStore;
  issue: IIssueRootStore;
  projectPages: IProjectPageStore;

  constructor() {
    this.router = new RouterStore();
    this.theme = new ThemeStore();
    this.user = new UserStore(this);
    this.instance = new InstanceStore();
    this.commandPalette = new CommandPaletteStore();
    this.dashboard = new DashboardStore(this);
    this.workspaceRoot = new WorkspaceRootStore(this);
    this.memberRoot = new MemberRootStore(this);
    this.projectRoot = new ProjectRootStore(this);
    this.issue = new IssueRootStore(this);
    this.projectPages = new ProjectPageStore(this);
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
    this.memberRoot = new MemberRootStore(this);
    this.projectRoot = new ProjectRootStore(this);
    this.issue = new IssueRootStore(this);
    this.projectPages = new ProjectPageStore(this);
  }
}
