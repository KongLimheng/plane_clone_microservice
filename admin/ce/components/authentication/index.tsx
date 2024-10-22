"use client";

// images
import { keys } from "mobx";
import { observer } from "mobx-react";
import Image from "next/image";
import { useTheme } from "next-themes";
import {
  TGetBaseAuthenticationModeProps,
  TInstanceAuthenticationMethodKeys,
  TInstanceAuthenticationModes,
} from "@plane/types";
import { AuthenticationMethodCard } from "@/components/authentication";
import { getBaseAuthenticationModes } from "@/helpers/authentication.helper";
import { UpgradeButton } from "@/plane-admin/common";
import OIDCLogo from "@/public/logos/oidc-logo.svg";
import SAMLLogo from "@/public/logos/saml-logo.svg";

export type TAuthenticationModeProps = {
  disabled: boolean;
  updateConfig: (key: TInstanceAuthenticationMethodKeys, value: string) => void;
};

export const getAuthenticationModes = ({
  disabled,
  updateConfig,
  resolvedTheme,
}: TGetBaseAuthenticationModeProps): TInstanceAuthenticationModes[] => [
  ...getBaseAuthenticationModes({ disabled, updateConfig, resolvedTheme }),
  {
    key: "oidc",
    name: "OIDC",
    description: "Authenticate your users via the OpenID Connect protocol.",
    icon: <Image src={OIDCLogo} height={22} width={22} alt="OIDC Logo" />,
    config: <UpgradeButton />,
    unavailable: true,
  },
  {
    key: "saml",
    name: "SAML",
    description: "Authenticate your users via the Security Assertion Markup Language protocol.",
    icon: <Image src={SAMLLogo} height={22} width={22} alt="SAML Logo" className="pl-0.5" />,
    config: <UpgradeButton />,
    unavailable: true,
  },
];

export const AuthenticationModes = observer(({ disabled, updateConfig }: TAuthenticationModeProps) => {
  // next-themes
  const { resolvedTheme } = useTheme();

  return (
    <>
      {getAuthenticationModes({ disabled, updateConfig, resolvedTheme }).map(
        ({ name, description, key, icon, config, unavailable }) => (
          <AuthenticationMethodCard
            name={name}
            description={description}
            key={key}
            icon={icon}
            config={config}
            unavailable={unavailable}
            disabled={disabled}
          />
        )
      )}
    </>
  );
});
