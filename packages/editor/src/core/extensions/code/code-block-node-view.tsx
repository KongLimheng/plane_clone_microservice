"use client";

import { common, createLowlight } from "lowlight";
import ts from "highlight.js/lib/languages/typescript";
import { Node as ProseMirrorNode } from "@tiptap/pm/model";
import React, { useState } from "react";
import { NodeViewContent, NodeViewWrapper } from "@tiptap/react";
import { Tooltip } from "@plane/ui";
import { CheckIcon, CopyIcon } from "lucide-react";
import { cn } from "@plane/utils";

// we just have ts support for now
const lowlight = createLowlight(common);
lowlight.register("ts", ts);

interface CodeBlockComponentProps {
  node: ProseMirrorNode;
}

export const CodeBlockComponent = ({ node }: CodeBlockComponentProps) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    try {
      await navigator.clipboard.writeText(node.textContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 1000);
    } catch (error) {
      setCopied(false);
    }
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <NodeViewWrapper className="code-block relative group/code">
      <Tooltip tooltipContent="Copy code">
        <button
          type="button"
          className={cn(
            "group/button hidden group-hover/code:flex items-center justify-center absolute top-2 right-2 z-10 size-8 rounded-md bg-custom-background-80 border border-custom-border-200 transition duration-150 ease-in-out backdrop-blur-sm",
            {
              "bg-green-500/30 hover:bg-green-500/30 active:bg-green-500/30": copied,
            }
          )}
          onClick={copyToClipboard}
        >
          {copied ? (
            <CheckIcon className="size-3 text-green-500" strokeWidth={3} />
          ) : (
            <CopyIcon className="size-3 text-custom-text-300 group-hover/button:text-custom-text-100" />
          )}
        </button>
      </Tooltip>

      <pre className="bg-custom-background-90 text-custom-text-100 rounded-lg p-4 my-2">
        <NodeViewContent as="code" className="whitespace-pre-wrap" />
      </pre>
    </NodeViewWrapper>
  );
};
