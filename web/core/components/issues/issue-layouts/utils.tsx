"use client";

import scrollIntoView from "smooth-scroll-into-view-if-needed";

export const HIGHLIGHT_CLASS = "highlight";
export const HIGHLIGHT_WITH_LINE = "highlight-with-line";

/**
 * This Method finds the DOM element with elementId, scrolls to it and highlights the issue block
 * @param elementId
 * @param shouldScrollIntoView
 */
export const highlightIssueOnDrop = (
  elementId: string | undefined,
  shouldScrollIntoView = true,
  shouldHighLightWithLine = false
) => {
  setTimeout(async () => {
    const sourceElementId = elementId ?? "";
    const sourceElement = document.getElementById(sourceElementId);
    sourceElement?.classList?.add(shouldHighLightWithLine ? HIGHLIGHT_WITH_LINE : HIGHLIGHT_CLASS);
    if (shouldScrollIntoView && sourceElement)
      await scrollIntoView(sourceElement, { behavior: "smooth", block: "center", duration: 1500 });
  }, 200);
};
