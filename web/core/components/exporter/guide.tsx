"use client";

import { useEffect, useState } from "react";
import { observer } from "mobx-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import useSWR, { mutate } from "swr";
import { MoveLeft, MoveRight, RefreshCw } from "lucide-react";
import { Button } from "@plane/ui";
import { EmptyStateType } from "@/constants/empty-state";
import { EXPORT_SERVICES_LIST } from "@/constants/fetch-key";
import { EXPORTERS_LIST } from "@/constants/workspace";
import { cn } from "@/helpers/common.helper";
import { useRouterParams, useUser, useUserPermissions } from "@/hooks/store";
import { useProject } from "@/hooks/store/use-project";
import { useAppRouter } from "@/hooks/use-app-router";
import { EUserPermissions, EUserPermissionsLevel } from "@/plane-web/constants/user-permissions";
import { IntegrationService } from "@/services/integrations";
import { EmptyState } from "../empty-state";
import { ImportExportSettingsLoader } from "../ui/loader/settings/import-and-export";
import { Exporter } from "./export-modal";
import { SingleExport } from "./single-export";

const integrationService = new IntegrationService();

export const IntegrationGuide = observer(() => {
  // states
  const [refreshing, setRefreshing] = useState(false);
  const per_page = 10;
  const [cursor, setCursor] = useState<string | undefined>(`10:0:0`);
  // router
  const router = useAppRouter();
  const { workspaceSlug } = useRouterParams();
  const searchParams = useSearchParams();
  const provider = searchParams.get("provider");

  // store hooks
  const { data: currentUser, canPerformAnyCreateAction } = useUser();
  const { allowPermissions } = useUserPermissions();
  const { workspaceProjectIds } = useProject();
  const { data: exporterServices } = useSWR(
    workspaceSlug && cursor ? EXPORT_SERVICES_LIST(workspaceSlug, cursor, `${per_page}`) : null,
    workspaceSlug && cursor ? () => integrationService.getExportsServicesList(workspaceSlug, cursor, per_page) : null
  );

  const hasProjects = workspaceProjectIds && workspaceProjectIds.length > 0;
  const isAdmin = allowPermissions([EUserPermissions.ADMIN], EUserPermissionsLevel.WORKSPACE);

  const handleRefresh = () => {
    setRefreshing(true);
    mutate(EXPORT_SERVICES_LIST(workspaceSlug!, cursor!, per_page.toString())).then(() => setRefreshing(false));
  };

  const handleCsvClose = () => {
    router.replace(`/${workspaceSlug?.toString()}/settings/exports`);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (exporterServices?.results.some((service) => service.status === "processing")) {
        handleRefresh();
      } else {
        clearInterval(interval);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [cursor, exporterServices, handleRefresh, workspaceSlug]);
  return (
    <>
      <div className="size-full">
        <>
          <div>
            {EXPORTERS_LIST.map((service) => (
              <div
                key={service.provider}
                className="flex items-center justify-between gap-2 border-b border-custom-border-100 bg-custom-background-100 py-6"
              >
                <div className="flex w-full items-center justify-between gap-4">
                  <div className="items-center float-start gap-2.5">
                    <div className="relative size-10 flex-shrink-0">
                      <Image src={service.logo} layout="fill" objectFit="cover" alt={`${service.title} Logo`} />
                    </div>

                    <div>
                      <h3 className="flex items-center gap-4 text-sm font-medium">{service.title}</h3>
                      <p className="text-sm tracking-tight text-custom-text-200">{service.description}</p>
                    </div>
                  </div>

                  <div className="flex-shrink-0">
                    <Link href={`/${workspaceSlug}/settings/exports?provider=${service.provider}`}>
                      <span>
                        <Button
                          variant="primary"
                          className="capitalize"
                          disabled={!isAdmin && (!hasProjects || !canPerformAnyCreateAction)}
                        >
                          {service.type}
                        </Button>
                      </span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div>
            <div className="flex items-center justify-between border-b border-custom-border-100 pb-3.5 pt-7">
              <div className="flex items-center gap-2">
                <h3 className="flex gap-2 text-xl font-medium">Previous exports</h3>

                <button
                  onClick={handleRefresh}
                  type="button"
                  className="flex flex-shrink-0 items-center gap-1 rounded bg-custom-background-80 px-1.5 py-1 text-xs outline-none"
                >
                  <RefreshCw className={cn("size-3", { "animate-spin": refreshing })} />
                  {refreshing ? "Refreshing..." : "Refresh status"}
                </button>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <button
                  disabled={!exporterServices?.prev_page_results}
                  onClick={() => exporterServices?.prev_page_results && setCursor(exporterServices?.prev_cursor)}
                  className={`flex items-center rounded border border-custom-primary-100 px-1 text-custom-primary-100 ${
                    exporterServices?.prev_page_results
                      ? "cursor-pointer hover:bg-custom-primary-100 hover:text-white"
                      : "cursor-not-allowed opacity-75"
                  }`}
                >
                  <MoveLeft className="size-4" />
                  <div className="pr-1">Prev</div>
                </button>
                <button
                  disabled={!exporterServices?.next_page_results}
                  onClick={() => exporterServices?.next_page_results && setCursor(exporterServices?.next_cursor)}
                  className={`flex items-center rounded border border-custom-primary-100 px-1 text-custom-primary-100 ${
                    exporterServices?.next_page_results
                      ? "cursor-pointer hover:bg-custom-primary-100 hover:text-white"
                      : "cursor-not-allowed opacity-75"
                  }`}
                >
                  <div className="pl-1">Next</div>
                  <MoveRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex flex-col">
              {exporterServices && exporterServices.results ? (
                exporterServices.results.length > 0 ? (
                  <div className="divide-y divide-custom-border-200">
                    {exporterServices.results.map((service) => (
                      <SingleExport key={service.id} service={service} refreshing={refreshing} />
                    ))}
                  </div>
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <EmptyState type={EmptyStateType.WORKSPACE_SETTINGS_EXPORT} size="sm" />
                  </div>
                )
              ) : (
                <ImportExportSettingsLoader />
              )}
            </div>
          </div>
        </>
        {provider && (
          <Exporter
            isOpen
            handleClose={handleCsvClose}
            data={null}
            user={currentUser || null}
            provider={provider}
            mutateServices={() => mutate(EXPORT_SERVICES_LIST(workspaceSlug!, cursor!, per_page.toString()))}
          />
        )}
      </div>
    </>
  );
});
