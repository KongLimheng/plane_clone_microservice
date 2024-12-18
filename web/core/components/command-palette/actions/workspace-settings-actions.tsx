import { Command } from "cmdk";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useUserPermissions } from "@/hooks/store";
import { useAppRouter } from "@/hooks/use-app-router";
import { EUserPermissionsLevel } from "@/plane-web/constants/user-permissions";
import { WORKSPACE_SETTINGS_LINKS } from "@/plane-web/constants/workspace";
import { shouldRenderSettingLink } from "@/plane-web/helpers/workspace.helper";

type Props = {
  closePalette: () => void;
};

export const CommandPaletteWorkspaceSettingsActions = ({ closePalette }: Props) => {
  // router
  const router = useAppRouter();
  // router params
  const { workspaceSlug } = useParams();
  // mobx store
  const { allowPermissions } = useUserPermissions();

  const redirect = (path: string) => {
    closePalette();
    router.push(path);
  };
  return (
    <>
      {WORKSPACE_SETTINGS_LINKS.map(
        (setting) =>
          allowPermissions(setting.access, EUserPermissionsLevel.WORKSPACE, workspaceSlug.toString()) &&
          shouldRenderSettingLink(setting.key) && (
            <Command.Item
              key={setting.key}
              onSelect={() => redirect(`/${workspaceSlug}${setting.href}`)}
              className="focus:outline-none"
            >
              <Link href={`/${workspaceSlug}${setting.href}`}>
                <div className="flex items-center gap-2 text-custom-text-200">
                  <setting.Icon className="size-4 text-custom-text-200" />
                  {setting.label}
                </div>
              </Link>
            </Command.Item>
          )
      )}
    </>
  );
};
