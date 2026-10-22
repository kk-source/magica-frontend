"use client";

import { useState } from "react";
import { Check, Copy, GitBranch, Loader2, ThumbsDown, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Message, ToolStep } from "@/lib/api/schemas";
import { cn } from "@/lib/utils";
import { Markdown } from "./Markdown";
import { ToolSteps } from "./ToolSteps";

type MessageBubbleProps = {
  role: Message["role"];
  content: string;
  toolSteps?: ToolStep[] | null;
  credits?: number | null;
  createdAt?: string;
  pending?: boolean;
};

function formatCredits(credits: number) {
  return credits >= 1_000_000 ? `${(credits / 1_000_000).toFixed(2)}M credits` : `${credits.toLocaleString()} credits`;
}

export function MessageBubble({ role, content, toolSteps, credits, createdAt, pending = false }: MessageBubbleProps) {
  if (role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-3xl bg-[#222222] px-4 py-2.5 whitespace-pre-wrap">{content}</div>
      </div>
    );
  }

  return (
    <div className={cn("min-w-0 leading-relaxed", role === "tool" && "text-sm text-muted-foreground")}>
      <ToolSteps steps={toolSteps ?? []} />
      {content && <Markdown>{content}</Markdown>}
      <InlineImages steps={toolSteps ?? []} />
      {pending && (
        <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          {!content && "Thinking…"}
        </span>
      )}
      {!pending && role === "assistant" && <MessageFooter content={content} credits={credits} createdAt={createdAt} />}
    </div>
  );
}

function InlineImages({ steps }: { steps: ToolStep[] }) {
  const urls = steps.flatMap((s) => (s.imageUrl ? [s.imageUrl] : []));
  if (urls.length === 0) return null;

  return (
    <div className="mt-3 flex flex-wrap gap-3">
      {urls.map((url) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={url} src={url} alt="Generated image" className="aspect-square w-full max-w-sm rounded-lg object-cover" />
      ))}
    </div>
  );
}

function MessageFooter({ content, credits, createdAt }: { content: string; credits?: number | null; createdAt?: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="mt-3 text-muted-foreground">
      {credits != null && <p className="mb-1 text-xs">{formatCredits(credits)}</p>}
      <div className="flex items-center gap-0.5">
        <Button variant="ghost" size="icon" className="size-7" onClick={copy} aria-label="Copy">
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
        </Button>
        <Button variant="ghost" size="icon" className="size-7" aria-label="Branch">
          <GitBranch className="size-3.5" />
        </Button>
        <Button variant="ghost" size="icon" className="size-7" aria-label="Good response">
          <ThumbsUp className="size-3.5" />
        </Button>
        <Button variant="ghost" size="icon" className="size-7" aria-label="Bad response">
          <ThumbsDown className="size-3.5" />
        </Button>
        {createdAt && (
          <span className="ml-2 text-xs">
            {new Date(createdAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
          </span>
        )}
      </div>
    </div>
  );
}
