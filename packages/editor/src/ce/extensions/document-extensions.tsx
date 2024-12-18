import { HocuspocusProvider } from "@hocuspocus/provider";
import { Extensions } from "@tiptap/core";
// plane editor types
import { TIssueEmbedConfig } from "@/plane-editor/types";
// types
import { TExtensions, TUserDetails } from "@/types";
import { SlashCommands } from "@/extensions";

type Props = {
  disabledExtensions?: TExtensions[];
  issueEmbedConfig: TIssueEmbedConfig | undefined;
  provider: HocuspocusProvider;
  userDetails: TUserDetails;
};

export const DocumentEditorAdditionalExtensions = (_props: Props) => {
  const { disabledExtensions } = _props;
  const extensions: Extensions = disabledExtensions?.includes("slash-commands") ? [] : [SlashCommands()];

  return extensions;
};
