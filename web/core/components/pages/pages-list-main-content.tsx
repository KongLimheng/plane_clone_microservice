// assets
import { observer } from "mobx-react";
import Image from "next/image";
import { TPageNavigationTabs } from "@plane/types";
import { EmptyStateType } from "@/constants/empty-state";
import { EPageAccess } from "@/constants/page";
import { useCommandPalette } from "@/hooks/store";
import { useProjectPages } from "@/hooks/store/pages";
import AllFiltersImage from "@/public/empty-state/pages/all-filters.svg";
import NameFilterImage from "@/public/empty-state/pages/name-filter.svg";
import { EmptyState } from "../empty-state";
import { PageLoader } from "./loaders";

type Props = {
  children: React.ReactNode;
  pageType: TPageNavigationTabs;
};

export const PagesListMainContent: React.FC<Props> = observer((props) => {
  const { children, pageType } = props;
  // store hooks
  const { loader, isAnyPageAvailable, getCurrentProjectPageIds, filters, getCurrentProjectFilteredPageIds } =
    useProjectPages();
  const { toggleCreatePageModal } = useCommandPalette();

  const pageIds = getCurrentProjectPageIds(pageType);
  const filteredPageIds = getCurrentProjectFilteredPageIds(pageType);

  if (loader === "init-loader") return <PageLoader />;
  // if no pages exist in the active page type

  if (!isAnyPageAvailable || pageIds?.length === 0) {
    if (!isAnyPageAvailable)
      return (
        <EmptyState
          type={EmptyStateType.PROJECT_PAGE}
          primaryButtonOnClick={() => {
            toggleCreatePageModal({ isOpen: true });
          }}
        />
      );

    if (pageType === "public")
      return (
        <EmptyState
          type={EmptyStateType.PROJECT_PAGE_PUBLIC}
          primaryButtonOnClick={() => {
            toggleCreatePageModal({ isOpen: true, pageAccess: EPageAccess.PUBLIC });
          }}
        />
      );

    if (pageType === "private")
      return (
        <EmptyState
          type={EmptyStateType.PROJECT_PAGE_PRIVATE}
          primaryButtonOnClick={() => {
            toggleCreatePageModal({ isOpen: true, pageAccess: EPageAccess.PRIVATE });
          }}
        />
      );
    if (pageType === "archived") return <EmptyState type={EmptyStateType.PROJECT_PAGE_ARCHIVED} />;
  }
  // if no pages match the filter criteria
  if (filteredPageIds?.length === 0)
    return (
      <div className="size-full grid place-items-center">
        <div className="text-center">
          <Image
            src={filters.searchQuery.length > 0 ? NameFilterImage : AllFiltersImage}
            className="h-36"
            alt="No matching modules"
          />
          <h5 className="text-xl font-medium mt-7 mb-1">No matching pages</h5>
          <p className="text-custom-text-400 text-base">
            {filters.searchQuery.length > 0
              ? "Remove the search criteria to see all pages"
              : "Remove the filters to see all pages"}
          </p>
        </div>
      </div>
    );

  return <div className="h-full w-full overflow-hidden">{children}</div>;
});
