import { useEffect } from "react";
import { observer } from "mobx-react";
import { useCommandPalette, useRouterParams, useUser, useUserProfile } from "@/hooks/store";
import { useDashboard } from "@/hooks/store/use-dashboard";
import useSize from "@/hooks/use-window-size";
import { TourRoot } from "../onboarding";

export const WorkspaceDashboardView = observer(() => {
  // const { toggleCreateProjectModal } = useCommandPalette();
  const { workspaceSlug } = useRouterParams();
  const { data: currentUser } = useUser();
  const { data: currentUserProfile, updateTourCompleted } = useUserProfile();
  const { homeDashboardId, fetchHomeDashboardWidgets } = useDashboard();

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
    </>
  );
});
