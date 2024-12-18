"use client";

import { useState } from "react";
import { observer } from "mobx-react";
import { EIssueLayoutTypes, EIssuesStoreType } from "@/constants/issue";
import { useIssues } from "@/hooks/store/use-issues";
import { useMember } from "@/hooks/store/use-member";
import { TProject } from "@/plane-web/types/projects";
import { LayoutSelection } from "./issue-layouts";

type Props = {
  currentProjectDetails: TProject | undefined;
  projectId: string;
  workspaceSlug: string;
  canUserCreateIssue: boolean | undefined;
};

const HeaderFilters = observer(({ currentProjectDetails, projectId, workspaceSlug, canUserCreateIssue }: Props) => {
  // states
  const [analyticsModal, setAnalyticsModal] = useState(false);
  // store hooks
  const {
    project: { projectMemberIds },
  } = useMember();
  const {
    issuesFilter: { issueFilters, updateFilters },
  } = useIssues(EIssuesStoreType.PROJECT);
  const activeLayout = issueFilters?.displayFilters?.layout;

  return (
    <>
      <LayoutSelection
        layouts={[
          EIssueLayoutTypes.LIST,
          EIssueLayoutTypes.KANBAN,
          EIssueLayoutTypes.CALENDAR,
          EIssueLayoutTypes.SPREADSHEET,
          EIssueLayoutTypes.GANTT,
        ]}
        onChange={(layout) => {
          console.log(layout);
        }}
        selectedLayout={activeLayout}
      />
    </>
  );
});

export { HeaderFilters };
