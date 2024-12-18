import { observer } from "mobx-react";
import { ListLayoutLoader } from "@/components/ui";
import { EIssueLayoutTypes } from "@/constants/issue";
import { useIssues } from "@/hooks/store/use-issues";
import { useIssueStoreType } from "@/hooks/use-issue-layout-store";
import { IssueLayoutEmptyState } from "./empty-states";

const ActiveLoader = (props: { layout: EIssueLayoutTypes }) => {
  const { layout } = props;
  switch (layout) {
    case EIssueLayoutTypes.LIST:
      return <ListLayoutLoader />;
    // case EIssueLayoutTypes.KANBAN:
    //   return <KanbanLayoutLoader />;
    // case EIssueLayoutTypes.SPREADSHEET:
    //   return <SpreadsheetLayoutLoader />;
    // case EIssueLayoutTypes.CALENDAR:
    //   return <CalendarLayoutLoader />;
    // case EIssueLayoutTypes.GANTT:
    //   return <GanttLayoutLoader />;
    default:
      return null;
  }
};

interface Props {
  children: string | JSX.Element | JSX.Element[];
  layout: EIssueLayoutTypes;
}

export const IssueLayoutHOC = observer(({ children, layout }: Props) => {
  const storeType = useIssueStoreType();
  const { issues } = useIssues(storeType);

  const issueCount = issues.getGroupIssueCount(undefined, undefined, false);
  if (issues.getIssueLoader() === "init-loader") {
    return <ActiveLoader layout={layout} />;
  }

  console.log(issueCount);

  if (issueCount === 0 && layout !== EIssueLayoutTypes.CALENDAR) {
    return <IssueLayoutEmptyState storeType={storeType} />;
  }
  return <>{children}</>;
});
