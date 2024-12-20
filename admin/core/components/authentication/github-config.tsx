import { observer } from "mobx-react";
import Link from "next/link";
import { Settings2 } from "lucide-react";
import { TInstanceAuthenticationMethodKeys } from "@plane/types";
import { getButtonStyling, ToggleSwitch } from "@plane/ui";
import { cn } from "@plane/utils";
import { useInstance } from "@/hooks/store";

type Props = {
  disabled: boolean;
  updateConfig: (key: TInstanceAuthenticationMethodKeys, value: string) => void;
};

export const GithubConfiguration: React.FC<Props> = observer((props) => {
  const { disabled, updateConfig } = props;
  // store
  const { formattedConfig } = useInstance();
  // derived values
  const enableGithubConfig = formattedConfig?.IS_GITHUB_ENABLED ?? "";
  const isGithubConfigured = !!formattedConfig?.GITHUB_CLIENT_ID && !!formattedConfig?.GITHUB_CLIENT_SECRET;
  return (
    <>
      {isGithubConfigured ? (
        <div className="flex items-center gap-4">
          <Link href={"/authentication/github"} className={cn(getButtonStyling("link-primary", "md"), "font-medium")}>
            Edit
          </Link>
          <ToggleSwitch
            value={Boolean(parseInt(enableGithubConfig))}
            onChange={() => {
              // eslint-disable-next-line @typescript-eslint/no-unused-expressions
              Boolean(parseInt(enableGithubConfig)) === true
                ? updateConfig("IS_GITHUB_ENABLED", "0")
                : updateConfig("IS_GITHUB_ENABLED", "1");
            }}
            size="sm"
            disabled={disabled}
          />
        </div>
      ) : (
        <Link
          href={"/authentication/github"}
          className={cn(getButtonStyling("neutral-primary", "sm"), "text-custom-text-300")}
        >
          <Settings2 className="h-4 w-4 p-0.5 text-custom-text-300/80" />
          Configure
        </Link>
      )}
    </>
  );
});
