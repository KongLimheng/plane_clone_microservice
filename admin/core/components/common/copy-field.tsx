"use client";

import { Copy } from "lucide-react";
import { Button, setToast, TOAST_TYPE } from "@plane/ui";

export type TCopyField = {
  key: string;
  label: string;
  url: string;
  description: string | JSX.Element;
};

type Props = {
  label: string;
  url: string;
  description: string | JSX.Element;
};

export const CopyField = ({ label, url, description }: Props) => (
  <div className="flex flex-col gap-1">
    <h4 className="text-sm text-custom-text-200">{label}</h4>
    <Button
      variant="neutral-primary"
      className="flex items-center justify-between py-2"
      onClick={() => {
        navigator.clipboard.writeText(url);
        setToast({
          type: TOAST_TYPE.INFO,
          title: "Copied to clipboard",
          message: `The ${label} has been successfully copied to your clipboard`,
        });
      }}
    >
      <p className="text-sm font-medium">{url}</p>
      <Copy size={18} color="#B9B9B9" />
    </Button>

    <div className="text-xs text-custom-text-300">{description}</div>
  </div>
);
