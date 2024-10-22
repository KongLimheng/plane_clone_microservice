import { ChevronRight } from "lucide-react";
import React, { Children, Fragment, useEffect, useState } from "react";
import { cn } from "../../helpers";

type BreadcrumbsProps = {
  children: React.ReactNode;
  onBack?: () => void;
  isLoading?: boolean;
};

const BreadCrumbs = ({ children, onBack, isLoading = false }: BreadcrumbsProps) => {
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth <= 640); // Adjust this value as per your requirement
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  });
  const childrenArray = Children.toArray(children);

  const BreadcrumbItemLoader = (
    <div className="flex items-center gap-1 animate-pulse">
      <span className="h-5 w-5 bg-custom-background-80 rounded" />
      <span className="h-5 w-16 bg-custom-background-80 rounded" />
    </div>
  );

  return (
    <div className="flex items-center space-x-2 overflow-hidden">
      {!isSmallScreen && (
        <>
          {childrenArray.map((child, idx) => (
            <Fragment key={idx}>
              {idx > 0 && !isSmallScreen && (
                <div className="flex items-center gap-2.5">
                  <ChevronRight className="h-3.5 w-3.5 flex-shrink-0 text-custom-text-400" aria-hidden="true" />
                </div>
              )}

              <div className={cn("flex items-center gap-2.5", isSmallScreen && idx > 0 ? "hidden sm:flex" : "flex")}>
                {isLoading ? BreadcrumbItemLoader : child}
              </div>
            </Fragment>
          ))}
        </>
      )}

      {isSmallScreen && childrenArray.length > 1 && (
        <>
          <div className="flex items-center gap-2.5">
            {onBack && (
              <span onClick={onBack} className="text-custom-text-200">
                ...
              </span>
            )}

            <ChevronRight className="h-3.5 w-3.5 flex-shrink-0 text-custom-text-400" aria-hidden="true" />
          </div>

          <div className="flex items-center gap-2.5">
            {isLoading ? BreadcrumbItemLoader : childrenArray[childrenArray.length - 1]}
          </div>
        </>
      )}

      {isSmallScreen && childrenArray.length === 1 && childrenArray}
    </div>
  );
};

type Props = {
  type?: "text" | "component";
  component?: React.ReactNode;
  link?: JSX.Element;
};

const BreadcrumbItem: React.FC<Props> = (props) => {
  const { type = "text", component, link } = props;
  return <>{type !== "text" ? <div className="flex items-center space-x-2">{component}</div> : link}</>;
};

BreadCrumbs.BreadcrumbItem = BreadcrumbItem;

export { BreadCrumbs, BreadcrumbItem };
