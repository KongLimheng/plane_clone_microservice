import { observer } from "mobx-react";
import { IssueModalContext } from "@/components/issues/issue-modal";

type TIssueModalProviderProps = {
  children: React.ReactNode;
};

export const IssuesModalProvider = observer(({ children }: TIssueModalProviderProps) => (
  <IssueModalContext.Provider
    value={{
      issuePropertyValues: {},
      setIssuePropertyValues: () => {},
      issuePropertyValueErrors: {},
      setIssuePropertyValueErrors: () => {},
      getIssueTypeIdOnProjectChange: () => null,
      getActiveAdditionalPropertiesLength: () => 0,
      handlePropertyValuesValidation: () => true,
      handleCreateUpdatePropertyValues: () => Promise.resolve(),
    }}
  >
    {children}
  </IssueModalContext.Provider>
));
