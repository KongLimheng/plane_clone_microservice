"use client";

import { observer } from "mobx-react";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";
// assets
import { AuthRoot } from "@/components/account/auth-forms/auth-root";
import { PageHead } from "@/components/core";
import { EAuthModes, EPageTypes } from "@/helpers/authentication.helper";
import DefaultLayout from "@/layouts/default-layout";
import { AuthenticationWrapper } from "@/lib/wrappers/authentication-wrapper";
import PlaneBackgroundPatternDark from "@/public/auth/background-pattern-dark.svg";
import PlaneBackgroundPattern from "@/public/auth/background-pattern.svg";
import BlackHorizontalLogo from "@/public/plane-logos/black-horizontal-with-blue-logo.png";
import WhiteHorizontalLogo from "@/public/plane-logos/white-horizontal-with-blue-logo.png";

const HomePage = observer(() => {
  const { resolvedTheme } = useTheme();
  console.log(resolvedTheme);
  const logo = resolvedTheme === "light" ? BlackHorizontalLogo : WhiteHorizontalLogo;

  return (
    <DefaultLayout>
      <AuthenticationWrapper pageType={EPageTypes.NON_AUTHENTICATED}>
        <div className="relative w-screen h-screen overflow-hidden">
          <PageHead title="Log in - Plane" />
          <div className="absolute inset-0 z-0">
            <Image
              src={resolvedTheme === "dark" ? PlaneBackgroundPatternDark : PlaneBackgroundPattern}
              className="w-full h-full object-cover"
              alt="Plane background pattern"
            />
          </div>

          <div className="relative z-10 w-screen h-screen overflow-hidden overflow-y-auto flex flex-col">
            <div
              className="container min-w-full px-10 lg:px-20 xl:px-36 shrink-0 relative flex items-center justify-between pb-4
             transition-all"
            >
              <div className="flex items-center gap-x-2 py-10">
                <Link href={"/"} className="h-[30px] w-[133px]">
                  <Image src={logo} alt="Plane logo" />
                </Link>
              </div>
              <div className="flex flex-col items-end sm:items-center sm:gap-2 sm:flex-row text-center text-sm font-medium text-onboarding-text-300">
                New to Plane?{" "}
                <Link
                  href={"/sign-up"}
                  onClick={() => {}}
                  className="font-semibold text-custom-primary-100 hover:underline"
                >
                  Create an account
                </Link>
              </div>
            </div>
            <div>
              <AuthRoot authMode={EAuthModes.SIGN_IN} />
            </div>
          </div>
        </div>
      </AuthenticationWrapper>
    </DefaultLayout>
  );
});

export default HomePage;
