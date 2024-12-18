import { IUserProfileData, IUserStateDistribution } from "@plane/types";
import { Card } from "@plane/ui";
import { ProfileEmptyState } from "@/components/ui";
import stateGraph from "@/public/empty-state/state_graph.svg";

type Props = {
  stateDistribution: IUserStateDistribution[];
  userProfile: IUserProfileData | undefined;
};

export const ProfileStateDistribution = ({ stateDistribution, userProfile }: Props) => {
  if (!userProfile) return null;

  return (
    <div className="flex flex-col space-y-2">
      <h3 className="text-lg font-medium">Issues by state</h3>
      <Card className="h-full">
        {userProfile.state_distribution.length > 0 ? (
          <div>hi</div>
        ) : (
          <ProfileEmptyState
            title="No Data yet"
            description="Create issues to view the them by states in the graph for better analysis."
            image={stateGraph}
          />
        )}
      </Card>
    </div>
  );
};
