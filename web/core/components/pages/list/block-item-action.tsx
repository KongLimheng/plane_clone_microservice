import { FC } from "react";
import { observer } from "mobx-react";
import { Earth, Lock, Minus } from "lucide-react";
import { Avatar, Tooltip } from "@plane/ui";
import { getFileURL } from "@/helpers/file.helper";
import { usePage } from "@/hooks/store/pages";
import { useMember } from "@/hooks/store/use-member";
import { PageQuickActions } from "../dropdowns";

type Props = {
  workspaceSlug: string;
  projectId: string;
  pageId: string;
  parentRef: React.RefObject<HTMLElement>;
};

export const BlockItemAction: FC<Props> = observer((props) => {
  const { workspaceSlug, projectId, pageId, parentRef } = props;
  // store hooks
  const page = usePage(pageId);
  const { getUserDetails } = useMember();
  // derived values
  const {
    access,
    created_at,
    is_favorite,
    owned_by,
    // canCurrentUserFavoritePage,
    // addToFavorites,
    // removePageFromFavorites,
  } = page;

  const ownerDetails = owned_by ? getUserDetails(owned_by) : undefined;

  return (
    <>
      {/* page details */}
      <div className="cursor-default">
        <Tooltip tooltipContent={ownerDetails?.display_name} tooltipHeading="Owned by">
          <Avatar src={getFileURL(ownerDetails?.avatar_url ?? "")} name={ownerDetails?.display_name} />
        </Tooltip>
      </div>

      <div className="cursor-default text-custom-text-300">
        <Tooltip tooltipContent={access === 0 ? "Public" : "Private"}>
          {access === 0 ? <Earth className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
        </Tooltip>
      </div>

      {/* vertical divider */}
      <Minus className="h-5 w-5 text-custom-text-400 rotate-90 -mx-3" strokeWidth={1} />

      {/* favorite/unfavorite */}
      {/* {canCurrentUserFavoritePage && (
        <FavoriteStar
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleFavorites();
          }}
          selected={is_favorite}
        />
      )} */}

      {/* quick actions dropdown */}
      <PageQuickActions
        parentRef={parentRef}
        page={page}
        pageLink={`${workspaceSlug}/projects/${projectId}/pages/${pageId}`}
      />
    </>
  );
});
