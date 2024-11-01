import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useTheme } from "next-themes";
import githubLightModeImage from "/public/logos/github-black.png";
import githubDarkModeImage from "/public/logos/github-dark.svg";
import { API_BASE_URL, cn } from "@/helpers/common.helper";

export type GithubOAuthButtonProps = {
  text: string;
};

export const GithubOAuthButton = ({ text }: GithubOAuthButtonProps) => {
  const { resolvedTheme } = useTheme();
  const searchParams = useSearchParams();
  const next_path = searchParams.get("next_path");

  const handleSignIn = () => {
    window.location.assign(`${API_BASE_URL}/auth/github/${next_path ? `?next_path=${next_path}` : ``}`);
  };
  return (
    <button
      className={cn(
        "flex h-[42px] w-full items-center justify-center gap-2 rounded border px-2 text-sm font-medium text-custom-text-100 duration-300 bg-onboarding-background-200 hover:bg-onboarding-text-300",
        resolvedTheme === "dark" ? "border-[#43484f]" : "border-[#d9e4ff]"
      )}
      onClick={handleSignIn}
    >
      <Image
        src={resolvedTheme === "dark" ? githubDarkModeImage : githubLightModeImage}
        height={20}
        width={20}
        alt="Github Logo"
      />
      {text}
    </button>
  );
};
