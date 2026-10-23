"use client";

import { useState } from "react";
import { Check, Coins, Copy, GitFork, Loader2, ThumbsDown, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isActiveRun, mediaFromTools, type Attachment, type Message, type RunStatus, type ToolEvent, type ToolStep } from "@/lib/api/schemas";
import { cn, formatCredits } from "@/lib/utils";
import { Markdown } from "./Markdown";
import { ToolSteps } from "./ToolSteps";

type MessageBubbleProps = {
  role: Message["role"];
  content: string;
  /** Files the user uploaded with this turn. */
  attachments?: Attachment[];
  toolSteps?: ToolStep[] | null;
  /** Raw tool events; produced images and videos are rendered inline. */
  tools?: ToolEvent[] | null;
  credits?: number | null;
  createdAt?: string;
  status?: RunStatus | null;
  error?: string | null;
};

export function MessageBubble({ role, content, attachments = [], toolSteps, tools, credits, createdAt, status, error }: MessageBubbleProps) {
  const pending = isActiveRun(status);
  if (role === "user") {
    return (
      <div className="flex flex-col items-end gap-2">
        {attachments.length > 0 && (
          <div className="flex max-w-[80%] flex-wrap justify-end gap-2">
            {attachments.map((a) =>
              a.mimeType.startsWith("video/") ? (
                <video key={a.url} src={a.url} controls className="w-full max-w-xs rounded-lg" />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={a.url} src={a.url} alt={a.fileName} className="max-h-48 max-w-48 rounded-lg object-cover" />
              ),
            )}
          </div>
        )}
        <div className="max-w-[80%] rounded-[18px] bg-accent px-4 py-1.5 text-sm whitespace-pre-wrap">{content}</div>
      </div>
    );
  }

  return (
    <div className={cn("min-w-0 text-[15px] leading-relaxed", role === "tool" && "text-sm text-muted-foreground")}>
      <ToolSteps steps={toolSteps ?? []} />
      {content && <Markdown>{content}</Markdown>}
      <InlineMedia tools={tools ?? []} />
      {pending && (
        <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          {!content && "Thinking…"}
        </span>
      )}
      {status === "FAILED" && <p className="text-sm text-destructive">{error ?? "Something went wrong."}</p>}
      {status === "CANCELLED" && <p className="text-sm text-muted-foreground">Stopped.</p>}
      {!pending && role === "assistant" && <MessageFooter content={content} credits={credits} createdAt={createdAt} />}
    </div>
  );
}

function InlineMedia({ tools }: { tools: ToolEvent[] }) {
  const media = mediaFromTools(tools);
  if (media.length === 0) return null;

  return (
    <div className="mt-3 flex flex-wrap gap-3">
      {media.map(({ kind, url }) =>
        kind === "image" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={url} src={url} alt="Generated image" className="h-auto max-h-96 w-auto max-w-full rounded-xl sm:max-w-96" />
        ) : (
          <video key={url} src={url} controls className="w-full max-w-md rounded-xl" />
        ),
      )}
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
    <div className="mt-2 text-muted-foreground">
      {/* Text-only replies cost nothing; Galaxy hides the line then. */}
      {credits != null && Math.round(credits) > 0 && (
        <p className="mb-1 flex items-center gap-1 text-[11px]">
          <Coins className="size-3" />
          {formatCredits(credits)} credits
        </p>
      )}
      <div className="flex items-center gap-0.5">
        <Button variant="ghost" size="icon" className="size-7" onClick={copy} aria-label="Copy">
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
        </Button>
        <Button variant="ghost" size="icon" className="size-7" aria-label="Branch">
          <GitFork className="size-3.5" />
        </Button>
        <Button variant="ghost" size="icon" className="size-7" aria-label="Good response">
          <ThumbsUp className="size-3.5" />
        </Button>
        <Button variant="ghost" size="icon" className="size-7" aria-label="Bad response">
          <ThumbsDown className="size-3.5" />
        </Button>
        {createdAt && (
          <span className="ml-2 text-xs text-foreground">
            {new Date(createdAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
          </span>
        )}
      </div>
    </div>
  );
}
