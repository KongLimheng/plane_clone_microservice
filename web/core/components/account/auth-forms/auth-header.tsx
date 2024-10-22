import { ReactNode } from "react";
import { EAuthModes, EAuthSteps } from "@/helpers/authentication.helper";

type TAuthHeader = {
  workspaceSlug: string | undefined;
  invitationId: string | undefined;
  invitationEmail: string | undefined;
  authMode: EAuthModes;
  currentAuthStep: EAuthSteps;
  children: ReactNode;
};

const Titles = {
  [EAuthModes.SIGN_IN]: {
    [EAuthSteps.EMAIL]: {
      header: "Log in or Sign up",
      subHeader: "",
    },
    [EAuthSteps.PASSWORD]: {
      header: "Log in or Sign up",
      subHeader: "Log in using your password.",
    },
    [EAuthSteps.UNIQUE_CODE]: {
      header: "Log in or Sign up",
      subHeader: "Log in using your unique code.",
    },
  },
  [EAuthModes.SIGN_UP]: {
    [EAuthSteps.EMAIL]: {
      header: "Sign up or Log in",
      subHeader: "",
    },
    [EAuthSteps.PASSWORD]: {
      header: "Sign up or Log in",
      subHeader: "Sign up using your password",
    },
    [EAuthSteps.UNIQUE_CODE]: {
      header: "Sign up or Log in",
      subHeader: "Sign up using your unique code",
    },
  },
};

export const AuthHeader = ({}: TAuthHeader) => {
  const a = "";

  return <div>auth header</div>;
};
