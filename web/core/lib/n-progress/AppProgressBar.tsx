import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { NavigateOptions } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { usePathname, useSearchParams, useRouter as useNextRouter } from "next/navigation";
import nProgress from "nprogress";
import { getAnchorProperty, hasPreventProgressAttribute } from "./utils/getAnchorProperty";
import { isSameURL, isSameURLWithoutSearch } from "./utils/sameURL";
import { ProgressBarProps, RouterNProgressOptions } from ".";
type PushStateInput = [data: any, unused: string, url?: string | URL | null | undefined];

export const AppProgressBar = React.memo(
  ({
    color = "#0A2FFF",
    height = "2px",
    options,
    shallowRouting = false,
    disableAnchorClick = false,
    disableSameURL = true,
    startPosition = 0,
    delay = 0,
    stopDelay,
    style,
    nonce,
    targetPreprocessor,
  }: ProgressBarProps) => {
    const styles = (
      <style nonce={nonce}>
        {style ||
          `
          #nprogress {
            pointer-events: none;
          }

          #nprogress .bar {
            background: ${color};

            position: fixed;
            z-index: 1031;
            top: 0;
            left: 0;

            width: 100%;
            height: ${height};
          }

          /* Fancy blur effect */
          #nprogress .peg {
            display: block;
            position: absolute;
            right: 0px;
            width: 100px;
            height: 100%;
            box-shadow: 0 0 10px ${color}, 0 0 5px ${color};
            opacity: 1.0;

            -webkit-transform: rotate(3deg) translate(0px, -4px);
                -ms-transform: rotate(3deg) translate(0px, -4px);
                    transform: rotate(3deg) translate(0px, -4px);
          }

          /* Remove these to get rid of the spinner */
          #nprogress .spinner {
            display: block;
            position: fixed;
            z-index: 1031;
            top: 15px;
            right: 15px;
          }

          #nprogress .spinner-icon {
            width: 18px;
            height: 18px;
            box-sizing: border-box;

            border: solid 2px transparent;
            border-top-color: ${color};
            border-left-color: ${color};
            border-radius: 50%;

            -webkit-animation: nprogress-spinner 400ms linear infinite;
                    animation: nprogress-spinner 400ms linear infinite;
          }

          .nprogress-custom-parent {
            overflow: hidden;
            position: relative;
          }

          .nprogress-custom-parent #nprogress .spinner,
          .nprogress-custom-parent #nprogress .bar {
            position: absolute;
          }

          @-webkit-keyframes nprogress-spinner {
            0%   { -webkit-transform: rotate(0deg); }
            100% { -webkit-transform: rotate(360deg); }
          }
          @keyframes nprogress-spinner {
            0%   { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    );

    nProgress.configure(options || {});

    // eslint-disable-next-line no-undef
    let progressDoneTimer: NodeJS.Timeout;
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
      if (progressDoneTimer) clearTimeout(progressDoneTimer);
      progressDoneTimer = setTimeout(() => {
        nProgress.done();
      }, stopDelay);
    }, [pathname, searchParams]);

    const elementsWithAttachedHandlers = useRef<(HTMLAnchorElement | SVGAElement)[]>([]);

    useEffect(() => {
      if (disableAnchorClick) return;

      // eslint-disable-next-line no-undef
      let timer: NodeJS.Timeout;
      const startProgress = () => {
        timer = setTimeout(() => {
          if (startPosition > 0) nProgress.set(startPosition);
          nProgress.start();
        });
      };

      const stopProgress = () => {
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => {
          nProgress.done();
        }, stopDelay);
      };

      const handleAnchorClick: any = (event: MouseEvent) => {
        if (event.defaultPrevented) return;
        const anchorElement = event.currentTarget as HTMLAnchorElement | SVGAElement;
        const target = event.target as HTMLElement | Element;

        const preventProgress =
          hasPreventProgressAttribute(target) || anchorElement.getAttribute("data-prevent-nprogress") === "true";

        if (preventProgress) return;

        const anchorTarget = getAnchorProperty(anchorElement, "target");
        // Skip anchors with target="_blank"
        if (anchorTarget === "_blank") return;
        // Skip control/command/option/alt+click
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        const targetHref = getAnchorProperty(anchorElement, "href");
        const targetUrl = targetPreprocessor ? targetPreprocessor(new URL(targetHref)) : new URL(targetHref);
        const currentUrl = new URL(location.href);

        if (shallowRouting && isSameURLWithoutSearch(targetUrl, currentUrl) && disableSameURL) return;
        if (isSameURL(targetUrl, currentUrl) && disableSameURL) return;
        startProgress();
      };

      const handleMutation: MutationCallback = () => {
        const anchorElement = Array.from(document.querySelectorAll("a")) as (HTMLAnchorElement | SVGAElement)[];

        const validAnchorElements = anchorElement.filter((anchor) => {
          const href = getAnchorProperty(anchor, "href");
          const isNProgressDisabled = anchor.getAttribute("data-disable-nprogress") === "true";
          const isNotTelOrMailto =
            href &&
            !href.startsWith("tel:") &&
            !href.startsWith("mailto:") &&
            !href.startsWith("blob:") &&
            !href.startsWith("javascript:");

          return !isNProgressDisabled && isNotTelOrMailto && getAnchorProperty(anchor, "target") !== "_blank";
        });

        validAnchorElements.forEach((anchor) => anchor.addEventListener("click", handleAnchorClick));
        elementsWithAttachedHandlers.current = validAnchorElements;
      };

      const mutationObserver = new MutationObserver(handleMutation);
      mutationObserver.observe(document, { childList: true, subtree: true });
      const originalWindowHistoryPushState = window.history.pushState;
      // eslint-disable-next-line no-undef
      history.pushState = new Proxy(window.history.pushState, {
        apply: (target, thisArg, argArray: PushStateInput) => {
          stopProgress();
          return target.apply(thisArg, argArray);
        },
      });

      return () => {
        mutationObserver.disconnect();
        elementsWithAttachedHandlers.current.forEach((anchor) => {
          anchor.removeEventListener("click", handleAnchorClick);
        });

        elementsWithAttachedHandlers.current = [];
        window.history.pushState = originalWindowHistoryPushState;
      };
    }, [disableAnchorClick, disableSameURL, shallowRouting, startPosition, stopDelay, targetPreprocessor]);

    return styles;
  },
  (prevProps, nextProps) => {
    if (nextProps.memo === false) return false;

    if (!nextProps?.shouldCompareComplexProps) {
      return true;
    }

    return (
      prevProps?.color === nextProps?.color &&
      prevProps?.height === nextProps?.height &&
      prevProps?.shallowRouting === nextProps?.shallowRouting &&
      prevProps?.startPosition === nextProps?.startPosition &&
      prevProps?.delay === nextProps?.delay &&
      prevProps?.disableSameURL === nextProps?.disableSameURL &&
      prevProps?.stopDelay === nextProps?.stopDelay &&
      prevProps?.nonce === nextProps?.nonce &&
      JSON.stringify(prevProps?.options) === JSON.stringify(nextProps?.options) &&
      prevProps?.style === nextProps?.style &&
      prevProps.disableAnchorClick === nextProps.disableAnchorClick
    );
  }
);

AppProgressBar.displayName = "AppProgressBar";

export const useRouter = () => {
  const router = useNextRouter();

  const startProgress = useCallback((startPosition?: number) => {
    if (startPosition && startPosition > 0) nProgress.set(startPosition);
    nProgress.start();
  }, []);

  const progress = useCallback(
    (href: string, options?: NavigateOptions, NProgressOptions?: RouterNProgressOptions) => {
      if (NProgressOptions?.showProgressBar === false) return router.push(href, options);
    },
    [router]
  );

  const push = useCallback(
    (href: string, options?: NavigateOptions, NProgressOptions?: RouterNProgressOptions) => {
      progress(href, options, NProgressOptions);
      return router.push(href, options);
    },
    [router, progress]
  );

  const replace = useCallback(
    (href: string, options?: NavigateOptions, NProgressOptions?: RouterNProgressOptions) => {
      progress(href, options, NProgressOptions);
      return router.replace(href, options);
    },
    [router, progress]
  );

  const back = useCallback(
    (NProgressOptions?: RouterNProgressOptions) => {
      if (NProgressOptions?.showProgressBar === false) return router.back();

      startProgress(NProgressOptions?.startPosition);

      return router.back();
    },
    [router, startProgress]
  );

  const enhancedRouter = useMemo(() => ({ ...router, push, replace, back }), [router, push, replace, back]);

  return enhancedRouter;
};
