import { ReactNode } from "react";
import { observer } from "mobx-react";
import useSWR from "swr";
import { LogoSpinner } from "@/components/common";
import { InstanceNotReady } from "@/components/instance";
import { useInstance } from "@/hooks/store/use-instance";

type TInstanceWrapper = {
  children: ReactNode;
};

export const InstanceWrapper = observer(({ children }: TInstanceWrapper) => {
  const { isLoading, instance, error, fetchInstanceInfo } = useInstance();
  const { isLoading: isInstanceSWRLoading } = useSWR("INSTANCE_INFORMATION", () => fetchInstanceInfo(), {
    revalidateOnFocus: false,
  });
  // loading state
  if ((isLoading || isInstanceSWRLoading) && !instance)
    return (
      <div className="relative flex h-screen w-full items-center justify-center">
        <LogoSpinner />
      </div>
    );

  if (error && error?.status === "error") return <>{children}</>;
  if (instance?.is_setup_done === false) return <InstanceNotReady />;
  return <>{children}</>;
});
