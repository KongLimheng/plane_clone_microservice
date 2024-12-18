import { observer } from "mobx-react";
import { EditorReadOnlyRefApi, EditorRefApi } from "@plane/editor";
import { EHeaderVariant, Header } from "@plane/ui";
import { usePageFilters } from "@/hooks/use-page-filter";
import { IPage } from "@/store/pages/page";

type Props = {
  editorReady: boolean;
  editorRef: React.RefObject<EditorRefApi>;
  handleDuplicatePage: () => void;
  page: IPage;
  readOnlyEditorReady: boolean;
  readOnlyEditorRef: React.RefObject<EditorReadOnlyRefApi>;
  setSidePeekVisible: (sidePeekState: boolean) => void;
  sidePeekVisible: boolean;
};

export const PageEditorHeaderRoot = observer(
  ({
    editorReady,
    editorRef,
    handleDuplicatePage,
    page,
    readOnlyEditorReady,
    readOnlyEditorRef,
    setSidePeekVisible,
    sidePeekVisible,
  }: Props) => {
    // derived values
    const { isContentEditable } = page;
    // page filters
    const { isFullWidth } = usePageFilters();
    if (!editorRef.current && !readOnlyEditorRef.current) return null;

    return (
      <>
        <Header variant={EHeaderVariant.SECONDARY} showOnMobile={false}>
          <Header.LeftItem>{(editorReady || readOnlyEditorReady) && <div>ready</div>}</Header.LeftItem>
        </Header>
        header
      </>
    );
  }
);
