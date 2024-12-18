import { useEffect } from "react";
import { observer } from "mobx-react";
import { ContentWrapper } from "@plane/ui";
import { EmptyStateType } from "@/constants/empty-state";
import { cn } from "@/helpers/common.helper";
import { useCommandPalette, useRouterParams, useUser, useUserProfile } from "@/hooks/store";
import { useDashboard } from "@/hooks/store/use-dashboard";
import { useProject } from "@/hooks/store/use-project";
import useSize from "@/hooks/use-window-size";
import { DashboardWidgets } from "../dashboard";
import { EmptyState } from "../empty-state";
import { TourRoot } from "../onboarding";
import { UserGreetingsView } from "../user";

export const WorkspaceDashboardView = observer(() => {
  const { toggleCreateProjectModal } = useCommandPalette();
  const { workspaceSlug } = useRouterParams();
  const { data: currentUser } = useUser();
  const { data: currentUserProfile, updateTourCompleted } = useUserProfile();
  const { homeDashboardId, fetchHomeDashboardWidgets } = useDashboard();

  const { joinedProjectIds, loader } = useProject();
  const { windowWidth } = useSize();
  const handleTourCompleted = () => {
    updateTourCompleted()
      .then(() => {})
      .catch((error) => console.error(error));
  };

  useEffect(() => {
    if (!workspaceSlug) return;
    fetchHomeDashboardWidgets(workspaceSlug.toString());
  }, [fetchHomeDashboardWidgets, workspaceSlug]);

  return (
    <>
      {currentUserProfile && !currentUserProfile.is_tour_completed && (
        <div className="fixed left-0 top-0 z-20 h-full w-full place-items-center bg-custom-backdrop bg-opacity-50 transition-opacity">
          <TourRoot onComplete={handleTourCompleted} />
        </div>
      )}

      {homeDashboardId && joinedProjectIds && (
        <>
          {joinedProjectIds.length > 0 || loader ? (
            <>
              <ContentWrapper
                className={cn("gap-7 bg-custom-background-90", {
                  "vertical-scrollbar scrollbar-lg": windowWidth >= 768,
                })}
              >
                {currentUser && <UserGreetingsView user={currentUser} />}
                <DashboardWidgets />
              </ContentWrapper>
            </>
          ) : (
            <EmptyState
              type={EmptyStateType.WORKSPACE_DASHBOARD}
              primaryButtonOnClick={() => {
                toggleCreateProjectModal(true);
              }}
            />
          )}
        </>
      )}
    </>
  );
});
