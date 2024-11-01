// assets
import { useState } from "react";
import { observer } from "mobx-react";
import Image, { StaticImageData } from "next/image";
import { Button } from "@plane/ui";
import { useUser } from "@/hooks/store";
import { useInstance } from "@/hooks/store/use-instance";
import CyclesTour from "@/public/onboarding/cycles.webp";
import IssuesTour from "@/public/onboarding/issues.webp";
import ModulesTour from "@/public/onboarding/modules.webp";
import PagesTour from "@/public/onboarding/pages.webp";
import ViewsTour from "@/public/onboarding/views.webp";
import PlaneWhiteLogo from "@/public/plane-logos/white-horizontal.svg";
// constants

type Props = {
  onComplete: () => void;
};

export type TTourSteps = "welcome" | "issues" | "cycles" | "modules" | "views" | "pages";

const TOUR_STEPS: {
  key: TTourSteps;
  title: string;
  description: string;
  image: StaticImageData;
  prevStep?: TTourSteps;
  nextStep?: TTourSteps;
}[] = [
  {
    key: "issues",
    title: "Plan with issues",
    description:
      "The issue is the building block of the Plane. Most concepts in Plane are either associated with issues and their properties.",
    image: IssuesTour,
    nextStep: "cycles",
  },
  {
    key: "cycles",
    title: "Move with cycles",
    description:
      "Cycles help you and your team to progress faster, similar to the sprints commonly used in agile development.",
    image: CyclesTour,
    prevStep: "issues",
    nextStep: "modules",
  },
  {
    key: "modules",
    title: "Break into modules",
    description: "Modules break your big thing into Projects or Features, to help you organize better.",
    image: ModulesTour,
    prevStep: "cycles",
    nextStep: "views",
  },
  {
    key: "views",
    title: "Views",
    description:
      "Create custom filters to display only the issues that matter to you. Save and share your filters in just a few clicks.",
    image: ViewsTour,
    prevStep: "modules",
    nextStep: "pages",
  },
  {
    key: "pages",
    title: "Document with pages",
    description: "Use Pages to quickly jot down issues when you're in a meeting or starting a day.",
    image: PagesTour,
    prevStep: "views",
  },
];

export const TourRoot = observer(({ onComplete }: Props) => {
  // states
  const [step, setStep] = useState<TTourSteps>("welcome");
  const { data: currentUser } = useUser();

  const currentStepIndex = TOUR_STEPS.findIndex((tourStep) => tourStep.key === step);
  const currentStep = TOUR_STEPS[currentStepIndex];

  return (
    <>
      {step === "welcome" ? (
        <div className="h-3/4 w-4/5 overflow-hidden rounded-[10px] bg-custom-background-100 md:w-1/2 lg:w-2/5">
          <div className="h-full overflow-hidden">
            <div className="grid h-3/5 place-items-center  bg-custom-primary-100">
              <Image src={PlaneWhiteLogo} alt="Plane White Logo" />
            </div>
            <div className="flex h-2/5 flex-col overflow-y-auto p-6">
              <h3 className="font-semibold sm:text-xl">
                Welcome to Plane, {currentUser?.first_name} {currentUser?.last_name}
              </h3>

              <p className="mt-3 text-sm text-custom-text-200">
                We{"'"}re glad that you decided to try out Plane. You can now manage your projects with ease. Get
                started by creating a project.
              </p>

              <div className="flex h-full items-end">
                <div className="mt-8 flex items-center gap-6">
                  <Button variant="primary">Take a Product Tour</Button>

                  <button
                    type="button"
                    className="bg-transparent text-xs font-medium text-custom-primary-100 outline-custom-text-100"
                    onClick={() => {
                      onComplete();
                    }}
                  >
                    No thanks, I will explore it myself
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div>hi</div>
      )}
    </>
  );
});
