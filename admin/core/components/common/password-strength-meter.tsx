import { FC, useMemo } from "react";
import { cn } from "@plane/ui";
import { E_PASSWORD_STRENGTH, getPasswordStrength } from "@/helpers/password.helper";

type TPasswordStrengthMeter = {
  password: string;
  isFocused?: boolean;
};

export const PasswordStrengthMeter: FC<TPasswordStrengthMeter> = ({ password, isFocused = false }) => {
  const strength = useMemo(() => getPasswordStrength(password), [password]);
  const strengthBars = useMemo(() => {
    switch (strength) {
      case E_PASSWORD_STRENGTH.EMPTY: {
        return {
          bars: [`bg-custom-text-100`, `bg-custom-text-100`, `bg-custom-text-100`],
          text: "Please enter your password.",
          textColor: "text-custom-text-100",
        };
      }
      case E_PASSWORD_STRENGTH.LENGTH_NOT_VALID: {
        return {
          bars: [`bg-red-500`, `bg-custom-text-100`, `bg-custom-text-100`],
          text: "Password length should me more than 8 characters.",
          textColor: "text-red-500",
        };
      }
      case E_PASSWORD_STRENGTH.STRENGTH_NOT_VALID: {
        return {
          bars: [`bg-red-500`, `bg-custom-text-100`, `bg-custom-text-100`],
          text: "Password is weak.",
          textColor: "text-red-500",
        };
      }
      case E_PASSWORD_STRENGTH.STRENGTH_VALID: {
        return {
          bars: [`bg-green-500`, `bg-green-500`, `bg-green-500`],
          text: "Password is strong.",
          textColor: "text-green-500",
        };
      }
      default: {
        return {
          bars: [`bg-custom-text-100`, `bg-custom-text-100`, `bg-custom-text-100`],
          text: "Please enter your password.",
          textColor: "text-custom-text-100",
        };
      }
    }
  }, [strength]);

  const isPasswordMeterVisible = isFocused || strength === E_PASSWORD_STRENGTH.STRENGTH_VALID;

  if (!isPasswordMeterVisible) return <></>;

  return (
    <div className="w-full space-y-2 pt-2">
      <div className="space-y-1.5">
        <div className="relative flex items-center gap-2">
          {strengthBars.bars.map((color, idx) => (
            <div key={`${color}-${idx}`} className={cn("w-full h-1 rounded-full", color)} />
          ))}
        </div>
        <div className={cn(`text-xs font-medium text-custom-text-100`, strengthBars.textColor)}>
          {strengthBars.text}
        </div>
      </div>
    </div>
  );
};
