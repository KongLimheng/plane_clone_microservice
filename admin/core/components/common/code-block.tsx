import { cn } from "@plane/ui";

type TProps = {
  children: React.ReactNode;
  className?: string;
  darkerShade?: boolean;
};

export const CodeBlock = ({ children, className, darkerShade }: TProps) => (
  <span className={cn("", className)}>{children}</span>
);
