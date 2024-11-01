import { FC, ReactNode } from "react";
import { observer } from "mobx-react";
import useSWR from "swr";
import LogoSpinner from "@/components/common/logo-spinner";
import { InstanceFailureView, InstanceSetupForm } from "@/components/instance";
import { useInstance } from "@/hooks/store/use-instance";
import { DefaultLayout } from "@/layouts/default-layout";

type InstanceProviderProps = {
  children: ReactNode;
};
export const InstanceProvider: FC<InstanceProviderProps> = observer((props) => {
  const { children } = props;
  const { instance, error, fetchInstanceInfo } = useInstance();

  useSWR("INSTANCE_DETAILS", () => fetchInstanceInfo(), {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    errorRetryCount: 0,
  });

  if (!instance && !error) {
    return (
      <div className="flex h-screen min-h-[500px] w-full justify-center items-center">
        <LogoSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <DefaultLayout>
        <div className="relative h-full w-full overflow-y-auto px-6 py-10 mx-auto flex justify-center items-center">
          <InstanceFailureView />
        </div>
      </DefaultLayout>
    );
  }

  if (!instance?.is_setup_done) {
    return (
      <DefaultLayout>
        <div className="relative h-full w-full overflow-y-auto px-6 py-10 mx-auto flex justify-center items-center">
          <InstanceSetupForm />
        </div>
      </DefaultLayout>
    );
  }

  return <>{children}</>;
});
