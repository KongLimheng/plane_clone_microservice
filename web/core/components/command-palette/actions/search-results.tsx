import { Command } from "cmdk";
import { get } from "lodash";
import { useParams } from "next/navigation";
import { IWorkspaceSearchResults } from "@plane/types";
import { useAppRouter } from "@/hooks/use-app-router";
import { commandGroups } from "../helpers";

type Props = {
  closePalette: () => void;
  results: IWorkspaceSearchResults;
};

export const CommandPaletteSearchResults = ({ closePalette, results }: Props) => {
  // router
  const router = useAppRouter();
  const { projectId: routerProjectId } = useParams();
  // derived values
  const projectId = routerProjectId?.toString();
  return (
    <>
      {Object.keys(results.results).map((key) => {
        const section = get(results.results, key);
        const currentSection = commandGroups[key];

        if (section.length > 0) {
          return (
            <Command.Group key={key} heading={`${currentSection.title} search`}>
              {section.map((item: any) => (
                <Command.Item
                  key={item.id}
                  onSelect={() => {
                    closePalette();
                    router.push(currentSection.path(item, projectId));
                  }}
                  value={`${key}-${item?.id}-${item.name}-${item.project__identifier ?? ""}-${item.sequence_id ?? ""}`}
                  className="focus:outline-none"
                >
                  <div className="flex items-center gap-2 overflow-hidden text-custom-text-200">
                    {currentSection.icon}
                    <p className="block flex-1 truncate">{currentSection.itemName(item)}</p>
                  </div>
                </Command.Item>
              ))}
            </Command.Group>
          );
        }
      })}
    </>
  );
};
