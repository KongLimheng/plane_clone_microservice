import { TPageFiltersSortKey } from "@plane/types";

export enum EPageAccess {
  PUBLIC = 0,
  PRIVATE = 1,
}

export type TCreatePageModal = {
  isOpen: boolean;
  pageAccess?: EPageAccess;
};

export const DEFAULT_CREATE_PAGE_MODAL_DATA: TCreatePageModal = {
  isOpen: false,
  pageAccess: EPageAccess.PUBLIC,
};

export const PAGE_SORTING_KEY_OPTIONS: {
  key: TPageFiltersSortKey;
  label: string;
}[] = [
  { key: "name", label: "Name" },
  { key: "created_at", label: "Date created" },
  { key: "updated_at", label: "Date modified" },
];
