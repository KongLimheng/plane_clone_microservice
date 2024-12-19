import { ReactNode } from "react";
import { cn } from "@/helpers/common.helper";

type Props = {
  children: ReactNode;
  gradient?: boolean;
};

const DefaultLayout = ({ children, gradient = false }: Props) => (
  <div className={cn("h-screen w-full overflow-hidden", { "bg-custom-background-100": gradient })}>{children}</div>
);

export default DefaultLayout;
