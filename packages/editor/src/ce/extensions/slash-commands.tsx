// extensions
// types
import { TSlashCommandAdditionalOption } from "@/extensions";
import { TExtensions } from "@/types";

type Props = {
  disabledExtensions: TExtensions[];
};

export const coreEditorAdditionalSlashCommandOptions = (props: Props): TSlashCommandAdditionalOption[] => {
  const {} = props;
  const options: TSlashCommandAdditionalOption[] = [];
  return options;
};
