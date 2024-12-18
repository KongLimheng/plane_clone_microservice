import { IUserStateDistribution } from "@plane/types";
import { Card, ECardDirection, ECardSpacing } from "@plane/ui";
import { STATE_GROUPS } from "@/constants/state";

type Props = {
  stateDistribution: IUserStateDistribution[];
};

export const ProfileWorkload = ({ stateDistribution }: Props) => (
  <div className="space-y-2">
    <h3 className="text-lg font-medium">Workload</h3>

    <div className="grid grid-cols-1 justify-stretch gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {stateDistribution.map((group) => (
        <div key={group.state_group}>
          <Card className="cursor-pointer" direction={ECardDirection.ROW} spacing={ECardSpacing.SM}>
            <div
              className="h-3 w-3 rounded-sm my-2"
              style={{
                backgroundColor: STATE_GROUPS[group.state_group].color,
              }}
            />

            <div className="space-y-1 flex-col">
              <span className="text-sm text-custom-text-400">
                {group.state_group === "unstarted"
                  ? "Not started"
                  : group.state_group === "started"
                    ? "Working on"
                    : STATE_GROUPS[group.state_group].label}
              </span>
              <p className="text-xl font-semibold">{group.state_count}</p>
            </div>
          </Card>
        </div>
      ))}
    </div>
  </div>
);
