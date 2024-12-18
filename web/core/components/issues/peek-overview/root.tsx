import { observer } from "mobx-react";
import { usePathname } from "next/navigation";
import { EIssuesStoreType } from "@/constants/issue";
import { useUserPermissions } from "@/hooks/store";
import { useIssues } from "@/hooks/store/use-issues";

interface IIssuePeekOverview {
  embedIssue?: boolean;
  embedRemoveCurrentNotification?: () => void;
  is_draft?: boolean;
}

export const IssuePeekOverview = observer(
  ({ embedIssue, embedRemoveCurrentNotification, is_draft }: IIssuePeekOverview) => {
    // router
    const pathname = usePathname();
    // store hook
    const { allowPermissions } = useUserPermissions();

    // const {
    //   issues: { restoreIssue },
    // } = useIssues(EIssuesStoreType.PROJECT);

    return <div>overview</div>;
  }
);
