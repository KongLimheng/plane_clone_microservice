import { useState } from "react";
import { IExportData } from "@plane/types";
import { Button } from "@plane/ui";
import { getDate, renderFormattedDate } from "@/helpers/date-time.helper";

type Props = {
  service: IExportData;
  refreshing: boolean;
};

export const SingleExport = ({ service, refreshing }: Props) => {
  const provider = service.provider;
  const [isLoading] = useState(false);

  const checkExpiry = (dateString: string) => {
    const currentDate = new Date();
    const expiryDate = getDate(dateString);
    if (!expiryDate) return;
    expiryDate.setDate(expiryDate.getDate() + 7);
    return expiryDate > currentDate;
  };

  return (
    <div className="flex items-center justify-between gap-2 px-4 py-3">
      <div>
        <h4 className="flex items-center gap-2 text-sm">
          <span>
            Export to{" "}
            <span className="font-medium">
              {provider === "csv" ? "CSV" : provider === "xlsx" ? "Excel" : provider === "json" ? "JSON" : ""}
            </span>{" "}
          </span>

          <span
            className={`rounded px-2 py-0.5 text-xs capitalize ${
              service.status === "completed"
                ? "bg-green-500/20 text-green-500"
                : service.status === "processing"
                  ? "bg-yellow-500/20 text-yellow-500"
                  : service.status === "failed"
                    ? "bg-red-500/20 text-red-500"
                    : service.status === "expired"
                      ? "bg-orange-500/20 text-orange-500"
                      : ""
            }`}
          >
            {refreshing ? "Refreshing..." : service.status}
          </span>
        </h4>

        <div className="mt-2 flex items-center gap-2 text-xs text-custom-text-200">
          <span>{renderFormattedDate(service.created_at)}</span>
          <span>Exported by {service?.initiated_by_detail?.display_name}</span>
        </div>
      </div>

      {checkExpiry(service.created_at) ? (
        <>
          {service.status === "completed" && (
            <div>
              <a href={service.url} target="_blank" rel="noopener noreferrer">
                <Button variant="primary" className="w-full">
                  {isLoading ? "Downloading..." : "Download"}
                </Button>
              </a>
            </div>
          )}
        </>
      ) : (
        <div className="text-xs text-red-500">Expired</div>
      )}
    </div>
  );
};