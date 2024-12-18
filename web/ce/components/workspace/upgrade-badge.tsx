import { cn } from "@/helpers/common.helper";

type TUpgradeBadge = {
  className?: string;
  size?: "sm" | "md";
};

export const UpgradeBadge = ({ className, size = "sm" }: TUpgradeBadge) => (
  <div
    className={cn(
      "w-fit cursor-pointer rounded-2xl text-custom-primary-200 bg-custom-primary-100/20 text-center font-medium outline-none",
      className,
      {
        "text-sm px-2": size === "md",
        "text-xs px-2": size === "sm",
      }
    )}
  >
    Pro
  </div>
);
