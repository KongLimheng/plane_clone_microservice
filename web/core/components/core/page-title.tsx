import { useHead } from "@plane/ui";

type PageHeadTitleProps = {
  title?: string;
  description?: string;
};

export const PageHead = ({ title }: PageHeadTitleProps) => {
  useHead({ title });

  return null;
};
