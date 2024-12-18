"use client";

import { observer } from "mobx-react";
import { TIssue } from "@plane/types";
import { EIssuesStoreType } from "@/constants/issue";
import { IssuesModalProvider } from "@/plane-web/components/issues";
import { CreateUpdateIssueModalBase } from "./base";

export interface IssuesModalProps {
  data?: Partial<TIssue>;
  isOpen: boolean;
  onClose: () => void;
  beforeFormSubmit?: () => Promise<void>;
  onSubmit?: (res: TIssue) => Promise<void>;
  withDraftIssueWrapper?: boolean;
  storeType?: EIssuesStoreType;
  isDraft?: boolean;
  fetchIssueDetails?: boolean;
  moveToIssue?: boolean;
  modalTitle?: string;
  primaryButtonText?: {
    default: string;
    loading: string;
  };
  isProjectSelectionDisabled?: boolean;
}

export const CreateUpdateIssueModal = observer(
  (props: IssuesModalProps) =>
    props.isOpen && (
      <IssuesModalProvider>
        <CreateUpdateIssueModalBase {...props} />
      </IssuesModalProvider>
    )
);
