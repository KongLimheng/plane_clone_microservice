import React, { forwardRef } from "react";

export type TControlLink = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  onClick: (event: React.MouseEvent<HTMLAnchorElement>) => void;
  children: React.ReactNode;
  target?: string;
  disabled?: boolean;
  className?: string;
  draggable?: boolean;
};
export const ControlLink = forwardRef<HTMLAnchorElement, TControlLink>(
  ({ href, onClick, children, target = "_blank", disabled = false, className, draggable = false, ...rest }, ref) => {
    const LEFT_CLICK_EVENT_CODE = 0;
    const handleOnClick = (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
      const clickCondition = (event.metaKey || event.ctrlKey) && event.button === LEFT_CLICK_EVENT_CODE;
      if (!clickCondition) {
        event.preventDefault();
        onClick(event);
      }
    };

    // if disabled but still has a ref or a className then it has to be rendered without a href
    if (disabled && (ref || className))
      return (
        <a ref={ref} className={className}>
          {children}
        </a>
      );

    // else if just disabled return without the parent wrapper
    if (disabled) return <>{children}</>;

    return (
      <a href={href} target={target} className={className} onClick={handleOnClick} draggable={draggable} {...rest}>
        {children}
      </a>
    );
  }
);

ControlLink.displayName = "ControlLink";
