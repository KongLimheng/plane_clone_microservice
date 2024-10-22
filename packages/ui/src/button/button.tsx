import React, { ButtonHTMLAttributes, cloneElement, ReactNode } from "react";
import { cn } from "../../helpers";
import { getButtonStyling, getIconStyling, TButtonSizes, TButtonVariant } from "./helper";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: TButtonVariant;
  size?: TButtonSizes;
  className?: string;
  loading?: boolean;
  disabled?: boolean;
  appendIcon?: any;
  prependIcon?: any;
  children: ReactNode;
}
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  const {
    variant = "primary",
    size = "md",
    className = "",
    type = "button",
    loading = false,
    disabled = false,
    prependIcon = null,
    appendIcon = null,
    children,
    ...rest
  } = props;

  const buttonStyle = getButtonStyling(variant, size, disabled || loading);
  const buttonIconStyle = getIconStyling(size);

  return (
    <button ref={ref} type={type} className={cn(buttonStyle, className)} disabled={disabled || loading} {...rest}>
      {prependIcon && <div className={buttonIconStyle}>{cloneElement(prependIcon, { strokeWidth: 2 })}</div>}
      {children}
      {prependIcon && <div className={buttonIconStyle}>{cloneElement(appendIcon, { strokeWidth: 2 })}</div>}
    </button>
  );
});

export { Button };
