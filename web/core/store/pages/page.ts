import { action, computed, makeObservable, observable, reaction, runInAction } from "mobx";
import { TDocumentPayload, TLogoProps, TPage } from "@plane/types";
import { EPageAccess } from "@/constants/page";
import { EUserPermissions } from "@/plane-web/constants/user-permissions";
import { ProjectPageService } from "@/services/page";
import { CoreRootStore } from "../root.store";

export type TLoader = "submitting" | "submitted" | "saved";
export interface IPage extends TPage {
  // observables
  isSubmitting: TLoader;
  // computed
  asJSON: TPage | undefined;
  isCurrentUserOwner: boolean; // it will give the user is the owner of the page or not
  // canCurrentUserEditPage: boolean; // it will give the user permission to read the page or write the page
  // canCurrentUserDuplicatePage: boolean;
  // canCurrentUserLockPage: boolean;
  canCurrentUserChangeAccess: boolean;
  canCurrentUserArchivePage: boolean;
  canCurrentUserDeletePage: boolean;
  canCurrentUserFavoritePage: boolean;
  isContentEditable: boolean;
  // helpers
  // oldName: string;
  // setIsSubmitting: (value: TLoader) => void;
  // cleanup: () => void;
  // actions
  // update: (pageData: Partial<TPage>) => Promise<TPage | undefined>;
  updateTitle: (title: string) => void;
  updateDescription: (document: TDocumentPayload) => Promise<void>;
  makePublic: () => Promise<void>;
  makePrivate: () => Promise<void>;
  // lock: () => Promise<void>;
  // unlock: () => Promise<void>;
  archive: () => Promise<void>;
  restore: () => Promise<void>;
  // updatePageLogo: (logo_props: TLogoProps) => Promise<void>;
  // addToFavorites: () => Promise<void>;
  // removePageFromFavorites: () => Promise<void>;
}

export class Page implements IPage {
  // loaders
  isSubmitting: TLoader = "saved";
  // page properties
  id: string | undefined;
  name: string | undefined;
  logo_props: TLogoProps | undefined;
  description_html: string | undefined;
  color: string | undefined;
  label_ids: string[] | undefined;
  owned_by: string | undefined;
  access: EPageAccess | undefined;
  anchor?: string | null | undefined;
  is_favorite: boolean;
  is_locked: boolean;
  archived_at: string | null | undefined;
  workspace: string | undefined;
  project_ids: string[] | undefined;
  created_by: string | undefined;
  updated_by: string | undefined;
  created_at: Date | undefined;
  updated_at: Date | undefined;
  // helpers
  oldName: string = "";
  // reactions
  disposers: Array<() => void> = [];
  // services
  pageService: ProjectPageService;
  // root store
  rootStore: CoreRootStore;

  constructor(
    private store: CoreRootStore,
    page: TPage
  ) {
    this.id = page?.id || undefined;
    this.name = page?.name;
    this.logo_props = page?.logo_props || undefined;
    this.description_html = page?.description_html || undefined;
    this.color = page?.color || undefined;
    this.label_ids = page?.label_ids || undefined;
    this.owned_by = page?.owned_by || undefined;
    this.access = page?.access || EPageAccess.PUBLIC;
    this.anchor = page?.anchor || undefined;
    this.is_favorite = page?.is_favorite || false;
    this.is_locked = page?.is_locked || false;
    this.archived_at = page?.archived_at || undefined;
    this.workspace = page?.workspace || undefined;
    this.project_ids = page?.project_ids || undefined;
    this.created_by = page?.created_by || undefined;
    this.updated_by = page?.updated_by || undefined;
    this.created_at = page?.created_at || undefined;
    this.updated_at = page?.updated_at || undefined;
    this.oldName = page?.name || "";

    makeObservable(this, {
      // loaders
      isSubmitting: observable.ref,
      // page properties
      id: observable.ref,
      name: observable.ref,
      logo_props: observable.ref,
      description_html: observable.ref,
      color: observable.ref,
      label_ids: observable,
      owned_by: observable.ref,
      access: observable.ref,
      anchor: observable.ref,
      is_favorite: observable.ref,
      is_locked: observable.ref,
      archived_at: observable.ref,
      workspace: observable.ref,
      project_ids: observable,
      created_by: observable.ref,
      updated_by: observable.ref,
      created_at: observable.ref,
      updated_at: observable.ref,
      // helpers
      // oldName: observable.ref,
      // setIsSubmitting: action,
      // cleanup: action,
      // computed
      asJSON: computed,
      isCurrentUserOwner: computed,
      // canCurrentUserEditPage: computed,
      // canCurrentUserDuplicatePage: computed,
      // canCurrentUserLockPage: computed,
      canCurrentUserChangeAccess: computed,
      canCurrentUserArchivePage: computed,
      canCurrentUserDeletePage: computed,
      canCurrentUserFavoritePage: computed,
      isContentEditable: computed,
      // actions
      // update: action,
      updateTitle: action,
      // updateDescription: action,
      makePublic: action,
      makePrivate: action,
      // lock: action,
      // unlock: action,
      archive: action,
      restore: action,
      // updatePageLogo: action,
      // addToFavorites: action,
      // removePageFromFavorites: action,
    });

    this.pageService = new ProjectPageService();
    this.rootStore = store;

    const titleDisposer = reaction(
      () => this.name,
      (name) => {
        const { workspaceSlug, projectId } = this.store.router;
        if (!workspaceSlug || !projectId || !this.id) return;
        this.isSubmitting = "submitting";
      },
      { delay: 2000 }
    );

    this.disposers.push(titleDisposer);
  }

  // computed
  get asJSON() {
    return {
      id: this.id,
      name: this.name,
      description_html: this.description_html,
      color: this.color,
      label_ids: this.label_ids,
      owned_by: this.owned_by,
      access: this.access,
      anchor: this.anchor,
      logo_props: this.logo_props,
      is_favorite: this.is_favorite,
      is_locked: this.is_locked,
      archived_at: this.archived_at,
      workspace: this.workspace,
      project_ids: this.project_ids,
      created_by: this.created_by,
      updated_by: this.updated_by,
      created_at: this.created_at,
      updated_at: this.updated_at,
    };
  }

  /**
   * @description returns true if the page can be edited
   */
  get isContentEditable() {
    const { workspaceSlug, projectId } = this.store.router;

    const isOwner = this.isCurrentUserOwner;
    const currentUserRole = this.store.user.permission.projectPermissionsByWorkspaceSlugAndProjectId(
      workspaceSlug?.toString() || "",
      projectId?.toString() || ""
    );
    const isPublic = this.access === EPageAccess.PUBLIC;
    const isArchived = this.archived_at;
    const isLocked = this.is_locked;

    return (
      !isArchived &&
      !isLocked &&
      (isOwner || (isPublic && !!currentUserRole && currentUserRole >= EUserPermissions.MEMBER))
    );
  }

  get isCurrentUserOwner() {
    const currentUserId = this.store.user.data?.id;
    if (!currentUserId) return false;
    return this.owned_by === currentUserId;
  }

  /**
   * @description returns true if the current logged in user can favorite the page
   */
  get canCurrentUserFavoritePage() {
    const { workspaceSlug, projectId } = this.store.router;

    const currentUserProjectRole = this.store.user.permission.projectPermissionsByWorkspaceSlugAndProjectId(
      workspaceSlug?.toString() || "",
      projectId?.toString() || ""
    );
    return !!currentUserProjectRole && currentUserProjectRole >= EUserPermissions.MEMBER;
  }

  /**
   * @description returns true if the current logged in user can change the access of the page
   */
  get canCurrentUserChangeAccess() {
    return this.isCurrentUserOwner;
  }

  /**
   * @description returns true if the current logged in user can archive the page
   */
  get canCurrentUserArchivePage() {
    const { workspaceSlug, projectId } = this.store.router;

    const currentUserProjectRole = this.store.user.permission.projectPermissionsByWorkspaceSlugAndProjectId(
      workspaceSlug?.toString() || "",
      projectId?.toString() || ""
    );
    return this.isCurrentUserOwner || currentUserProjectRole === EUserPermissions.ADMIN;
  }

  /**
   * @description returns true if the current logged in user can delete the page
   */
  get canCurrentUserDeletePage() {
    const { workspaceSlug, projectId } = this.store.router;

    const currentUserProjectRole = this.store.user.permission.projectPermissionsByWorkspaceSlugAndProjectId(
      workspaceSlug?.toString() || "",
      projectId?.toString() || ""
    );
    return this.isCurrentUserOwner || currentUserProjectRole === EUserPermissions.ADMIN;
  }

  /**
   * @description update the page title
   * @param title
   */
  updateTitle = (title: string) => {
    this.oldName = this.name ?? "";
    this.name = title;
  };

  /**
   * @description update the page description
   * @param {TDocumentPayload} document
   */
  updateDescription = async (document: TDocumentPayload) => {
    const { workspaceSlug, projectId } = this.store.router;
    if (!workspaceSlug || !projectId || !this.id) return undefined;

    const currentDescription = this.description_html;
    runInAction(() => {
      this.description_html = document.description_html;
    });

    try {
      await this.pageService.updateDescriptionYJS(workspaceSlug, projectId, this.id, document);
    } catch (error) {
      runInAction(() => {
        this.description_html = currentDescription;
      });
      throw error;
    }
  };

  /**
   * @description add the page to favorites
   */
  // addToFavorites = async () => {
  //   const { workspaceSlug, projectId } = this.store.router;
  //   if (!workspaceSlug || !projectId || !this.id) return undefined;

  //   const pageIsFavorite = this.is_favorite;
  //   runInAction(() => {
  //     this.is_favorite = true;
  //   });
  //   await this.rootStore.favorite
  //     .addFavorite(workspaceSlug.toString(), {
  //       entity_type: "page",
  //       entity_identifier: this.id,
  //       project_id: projectId,
  //       entity_data: { name: this.name || "" },
  //     })
  //     .catch((error) => {
  //       runInAction(() => {
  //         this.is_favorite = pageIsFavorite;
  //       });
  //       throw error;
  //     });
  // };

  /**
   * @description archive the page
   */
  archive = async () => {
    const { workspaceSlug, projectId } = this.store.router;
    if (!workspaceSlug || !projectId || !this.id) return undefined;
    const response = await this.pageService.archive(workspaceSlug, projectId, this.id);
    runInAction(() => {
      this.archived_at = response.archived_at;
    });
    // if (this.rootStore.favorite.entityMap[this.id]) this.rootStore.favorite.removeFavoriteFromStore(this.id);
  };

  /**
   * @description restore the page
   */
  restore = async () => {
    const { workspaceSlug, projectId } = this.store.router;
    if (!workspaceSlug || !projectId || !this.id) return undefined;
    await this.pageService.restore(workspaceSlug, projectId, this.id);
    runInAction(() => {
      this.archived_at = null;
    });
  };

  /**
   * @description make the page public
   */
  makePublic = async () => {
    const { workspaceSlug, projectId } = this.store.router;
    if (!workspaceSlug || !projectId || !this.id) return undefined;

    const pageAccess = this.access;
    runInAction(() => (this.access = EPageAccess.PUBLIC));

    try {
      await this.pageService.updateAccess(workspaceSlug, projectId, this.id, {
        access: EPageAccess.PUBLIC,
      });
    } catch (error) {
      runInAction(() => {
        this.access = pageAccess;
      });
      throw error;
    }
  };

  /**
   * @description make the page private
   */
  makePrivate = async () => {
    const { workspaceSlug, projectId } = this.store.router;
    if (!workspaceSlug || !projectId || !this.id) return undefined;

    const pageAccess = this.access;
    runInAction(() => (this.access = EPageAccess.PRIVATE));

    try {
      await this.pageService.updateAccess(workspaceSlug, projectId, this.id, {
        access: EPageAccess.PRIVATE,
      });
    } catch (error) {
      runInAction(() => {
        this.access = pageAccess;
      });
      throw error;
    }
  };
}