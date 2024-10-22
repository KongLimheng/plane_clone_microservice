import { useEffect, useState } from "react";
import { observer } from "mobx-react";
import { useSearchParams } from "next/navigation";
import { EAuthModes, EAuthSteps, TAuthErrorInfo } from "@/helpers/authentication.helper";
import { useAppRouter } from "@/hooks/use-app-router";
import { AuthHeader } from "./auth-header";

// const authService = new AuthService();

type TAuthRoot = {
  authMode: EAuthModes;
};

export const AuthRoot = observer(({ authMode: currenAuthMode }: TAuthRoot) => {
  const router = useAppRouter();
  const searchParams = useSearchParams();
  // query params
  const emailParam = searchParams.get("email");
  const invitation_id = searchParams.get("invitation_id");
  const workspaceSlug = searchParams.get("slug");
  const error_code = searchParams.get("error_code");
  const nextPath = searchParams.get("next_path");

  // states
  const [authMode, setAuthMode] = useState<EAuthModes | undefined>(undefined);
  const [authStep, setAuthStep] = useState<EAuthSteps>(EAuthSteps.EMAIL);
  const [email, setEmail] = useState(emailParam ? emailParam.toString() : "");
  const [errorInfo, setErrorInfo] = useState<TAuthErrorInfo | undefined>(undefined);
  const [isExistingEmail, setIsExistingEmail] = useState(false);

  useEffect(() => {
    if (!authMode && currenAuthMode) setAuthMode(currenAuthMode);
  }, [currenAuthMode, authMode]);

  if (!authMode) return <></>;
  return <div>{/* <AuthHeader>hi</AuthHeader> */}</div>;
});
