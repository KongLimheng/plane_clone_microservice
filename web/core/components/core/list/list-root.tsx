import { ERowVariant, Row } from "@plane/ui";

interface IListContainer {
  children: React.ReactNode;
}

export const ListLayout = ({ children }: IListContainer) => (
  <Row
    variant={ERowVariant.HUGGING}
    className="flex h-full w-full flex-col overflow-y-auto vertical-scrollbar scrollbar-lg"
  >
    {children}
  </Row>
);
