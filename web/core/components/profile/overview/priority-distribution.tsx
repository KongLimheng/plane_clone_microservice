import { IUserProfileData } from "@plane/types";
import { Card, Loader } from "@plane/ui";
import { ProfileEmptyState } from "@/components/ui";
import emptyBarGraph from "@/public/empty-state/empty_bar_graph.svg";

type Props = {
  userProfile: IUserProfileData | undefined;
};

export const ProfilePriorityDistribution = ({ userProfile }: Props) => (
  <div className="flex flex-col space-y-2">
    <h3 className="text-lg font-medium">Issues by Priority</h3>
    {userProfile ? (
      <Card>
        {userProfile.priority_distribution?.length > 0 ? (
          <div>hi</div>
        ) : (
          <div className="flex-grow p-7">
            <ProfileEmptyState
              title="No Data yet"
              description="Create issues to view the them by priority in the graph for better analysis."
              image={emptyBarGraph}
            />
          </div>
        )}
      </Card>
    ) : (
      <div className="grid place-items-center p-7">
        <Loader className="flex items-end gap-12">
          <Loader.Item width="30px" height="200px" />
          <Loader.Item width="30px" height="150px" />
          <Loader.Item width="30px" height="250px" />
          <Loader.Item width="30px" height="150px" />
          <Loader.Item width="30px" height="100px" />
        </Loader>
      </div>
    )}
  </div>
);
