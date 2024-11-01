"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { observer } from "mobx-react";
import Link from "next/link";
import { Eye, EyeOff, Info, X, XCircle } from "lucide-react";
import { Button, Input, Spinner } from "@plane/ui";
import { EAuthModes, EAuthSteps } from "@/helpers/authentication.helper";
import { API_BASE_URL } from "@/helpers/common.helper";
import { E_PASSWORD_STRENGTH, getPasswordStrength } from "@/helpers/password.helper";
import { AuthService } from "@/services/auth.service";
import { PasswordStrengthMeter } from "../password-strength-meter";
import { ForgotPasswordPopover } from "./forgot-password-popover";

type Props = {
  email: string;
  isSMTPConfigured: boolean;
  mode: EAuthModes;
  handleEmailClear: () => void;
  handleAuthStep: (step: EAuthSteps) => void;
  nextPath: string | undefined;
};

type TPasswordFormValues = {
  email: string;
  password: string;
  confirm_password?: string;
};

const defaultValues: TPasswordFormValues = {
  email: "",
  password: "",
};

const authService = new AuthService();

export const AuthPasswordForm = observer(
  ({ mode, isSMTPConfigured, handleAuthStep, handleEmailClear, nextPath, email }: Props) => {
    const formRef = useRef<HTMLFormElement>(null);

    // states
    const [csrfToken, setCsrfToken] = useState<string | undefined>(undefined);
    const [passwordFormData, setPasswordFormData] = useState<TPasswordFormValues>({ ...defaultValues, email });
    const [showPassword, setShowPassword] = useState({
      password: false,
      retypePassword: false,
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isPasswordInputFocused, setIsPasswordInputFocused] = useState(false);
    const [isRetryPasswordInputFocused, setIsRetryPasswordInputFocused] = useState(false);
    const [isBannerMessage, setBannerMessage] = useState(false);

    const handleFormChange = (key: keyof TPasswordFormValues, value: string) =>
      setPasswordFormData((prev) => ({ ...prev, [key]: value }));

    const handleShowPassword = (key: keyof typeof showPassword) =>
      setShowPassword((prev) => ({ ...prev, [key]: !prev[key] }));

    const password = passwordFormData?.password ?? "";
    const confirmPassword = passwordFormData?.confirm_password ?? "";
    const renderPasswordMatchError = !isRetryPasswordInputFocused || confirmPassword.length >= password.length;

    useEffect(() => {
      if (csrfToken === undefined)
        authService.requestCSRFToken().then((data) => data?.csrf_token && setCsrfToken(data.csrf_token));
    }, [csrfToken]);

    const passwordSupport =
      mode === EAuthModes.SIGN_IN ? (
        <div className="w-full">
          {isSMTPConfigured ? (
            <Link
              className="text-xs font-medium text-custom-primary-100"
              href={`/accounts/forgot-password?email=${encodeURIComponent(email)}`}
            >
              Forgot your password?
            </Link>
          ) : (
            <ForgotPasswordPopover />
          )}
        </div>
      ) : (
        passwordFormData.password.length > 0 &&
        getPasswordStrength(passwordFormData.password) != E_PASSWORD_STRENGTH.STRENGTH_VALID && (
          <PasswordStrengthMeter password={passwordFormData.password} isFocused={isPasswordInputFocused} />
        )
      );

    const isButtonDisabled = useMemo(
      () => !(!isSubmitting && !!password && (mode === EAuthModes.SIGN_UP ? password === confirmPassword : true)),
      [isSubmitting, mode, password, confirmPassword]
    );

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const isPasswordValid =
        mode === EAuthModes.SIGN_UP ? getPasswordStrength(password) === E_PASSWORD_STRENGTH.STRENGTH_VALID : true;
      if (isPasswordValid) {
        setIsSubmitting(true);
        if (formRef.current) formRef.current.submit();
      } else {
        setBannerMessage(true);
      }
    };

    return (
      <>
        {isBannerMessage && mode === EAuthModes.SIGN_UP && (
          <div className="relative flex items-center p-2 rounded-md gap-2 border border-red-500/50 bg-red-500/10">
            <div className="w-4 h-4 shrink-0 relative flex justify-center items-center">
              <Info size={16} className="text-red-500" />
            </div>
            <div className="w-full text-sm font-medium text-red-500">Try setting-up a strong password to proceed</div>
            <div
              onClick={() => setBannerMessage(false)}
              className="relative ml-auto w-6 h-6 rounded-sm flex justify-center items-center transition-all cursor-pointer hover:bg-red-500/20 text-custom-primary-100/80"
            >
              <X className="w-4 h-4 shrink-0 text-red-500" />
            </div>
          </div>
        )}
        <form
          onSubmit={handleSubmit}
          method="POST"
          onError={() => setIsSubmitting(false)}
          ref={formRef}
          className="mt-5 space-y-4"
          action={`${API_BASE_URL}/auth/${mode === EAuthModes.SIGN_IN ? "sign-in" : "sign-up"}/`}
        >
          <input type="hidden" name="csrfmiddlewaretoken" value={csrfToken} />
          <input type="hidden" value={passwordFormData.email} name="email" />
          {nextPath && <input type="hidden" value={nextPath} name="next_path" />}
          <div>
            <label htmlFor="email" className="text-sm font-medium text-onboarding-text-300">
              Email
            </label>
            <div className="relative flex items-center rounded-md bg-onboarding-background-200 border border-onboarding-border-100">
              <Input
                id="email"
                name="email"
                type="email"
                value={passwordFormData.email}
                onChange={(e) => handleFormChange("email", e.target.value)}
                placeholder="name@example.com"
                className="disable-autofill-style h-[46px] w-full placeholder:text-onboarding-text-400 border-0"
                disabled
              />
              {passwordFormData.email.length > 0 && (
                <XCircle
                  className="absolute right-3 h-5 w-5 stroke-custom-text-400 hover:cursor-pointer"
                  onClick={handleEmailClear}
                />
              )}
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="password" className="text-sm text-onboarding-text-300 font-medium">
              {mode === EAuthModes.SIGN_IN ? "Password" : "Set a password"}
            </label>

            <div className="relative flex items-center rounded-md bg-onboarding-background-200">
              <Input
                type={showPassword.password ? "text" : "password"}
                name="password"
                value={passwordFormData.password}
                placeholder="Enter password"
                onChange={(e) => handleFormChange("password", e.target.value)}
                className="disable-autofill-style h-[46px] w-full border border-onboarding-border-100 !bg-onboarding-background-200 pr-12 placeholder:text-onboarding-text-400"
                onFocus={() => setIsPasswordInputFocused(true)}
                onBlur={() => setIsPasswordInputFocused(false)}
                autoComplete="on"
                autoFocus
              />
              {showPassword?.password ? (
                <EyeOff
                  className="absolute right-3 h-5 w-5 stroke-custom-text-400 hover:cursor-pointer"
                  onClick={() => handleShowPassword("password")}
                />
              ) : (
                <Eye
                  className="absolute right-3 h-5 w-5 stroke-custom-text-400 hover:cursor-pointer"
                  onClick={() => handleShowPassword("password")}
                />
              )}
            </div>
            {passwordSupport}
          </div>

          {mode === EAuthModes.SIGN_UP && (
            <div className="space-y-1">
              <label className="text-sm text-onboarding-text-300 font-medium" htmlFor="confirm_password">
                Confirm Password
              </label>
              <div className="relative flex items-center rounded-md bg-onboarding-background-200">
                <Input
                  type={showPassword.retypePassword ? "text" : "password"}
                  name="confirm_password"
                  value={passwordFormData.confirm_password}
                  className="disable-autofill-style h-[46px] w-full border border-onboarding-border-100 !bg-onboarding-background-200 pr-12 placeholder:text-onboarding-text-400"
                  onChange={(e) => handleFormChange("confirm_password", e.target.value)}
                  placeholder="Confirm Password"
                  onFocus={() => setIsRetryPasswordInputFocused(true)}
                  onBlur={() => setIsRetryPasswordInputFocused(false)}
                />

                {showPassword?.retypePassword ? (
                  <EyeOff
                    className="absolute right-3 h-5 w-5 stroke-custom-text-400 hover:cursor-pointer"
                    onClick={() => handleShowPassword("retypePassword")}
                  />
                ) : (
                  <Eye
                    className="absolute right-3 h-5 w-5 stroke-custom-text-400 hover:cursor-pointer"
                    onClick={() => handleShowPassword("retypePassword")}
                  />
                )}
              </div>

              {!!confirmPassword && password !== confirmPassword && renderPasswordMatchError && (
                <span className="text-sm text-red-500">Passwords don{"'"}t match</span>
              )}
            </div>
          )}

          <div className="space-y-2.5">
            {mode === EAuthModes.SIGN_IN ? (
              <>
                <Button type="submit" variant="primary" className=" w-full" size="lg" disabled={isButtonDisabled}>
                  {isSubmitting ? (
                    <Spinner height="20px" width="20px" />
                  ) : isSMTPConfigured ? (
                    "Continue"
                  ) : (
                    "Go to workspace"
                  )}
                </Button>
              </>
            ) : (
              <Button type="submit" variant="primary" className="w-full" size="lg" disabled={isButtonDisabled}>
                {isSubmitting ? <Spinner height="20px" width="20px" /> : "Create account"}
              </Button>
            )}
          </div>
        </form>
      </>
    );
  }
);
