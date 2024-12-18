import React, { forwardRef } from "react";
import { ERowVariant, TRowVariant } from "../row/helper";
import { Row } from "../row";
import { cn } from "../../helpers";

export interface ContentWrapperProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: TRowVariant;
  className?: string;
  children: React.ReactNode;
}
const DEFAULT_STYLE = "flex flex-col vertical-scrollbar scrollbar-lg h-full w-full overflow-y-auto";

export const ContentWrapper = forwardRef<HTMLDivElement, ContentWrapperProps>(
  ({ variant = ERowVariant.REGULAR, className = "", children, ...rest }, ref) => (
    <Row
      ref={ref}
      variant={variant}
      className={cn(DEFAULT_STYLE, { "py-page-y": variant === ERowVariant.REGULAR }, className)}
      {...rest}
    >
      {children}
    </Row>
  )
);

ContentWrapper.displayName = "plane-ui-wrapper";
