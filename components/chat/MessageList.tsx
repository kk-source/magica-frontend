"use client";

import { useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Message, Run } from "@/lib/api/schemas";
import { MessageBubble } from "./MessageBubble";

type MessageListProps = {
  messages: Message[];
  /** Snapshot of the in-flight run, rendered as a streaming assistant bubble. */
  liveRun: Run | null;
  /** True from submit until the run finishes, so "Thinking…" shows before the first poll. */
  awaitingRun: boolean;
  /** Messages typed while a run is going; sent when it finishes. */
  queued?: string[];
};

export function MessageList({ messages, liveRun, awaitingRun, queued = [] }: MessageListProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, liveRun?.text, liveRun?.toolSteps.length, liveRun?.tools.length, liveRun?.status, queued.length]);

  return (
    <ScrollArea className="min-h-0 flex-1">
      <div className="mx-auto flex w-full max-w-[932px] flex-col gap-10 px-8 py-6">
        {messages
          .filter((m) => m.role !== "system")
          .map((m) => (
            <MessageBubble
              key={m.id}
              role={m.role}
              content={m.content}
              attachments={m.attachments}
              toolSteps={m.toolSteps}
              tools={m.tools}
              credits={m.credits}
              createdAt={m.createdAt}
              status={m.status}
            />
          ))}
        {awaitingRun && (
          <MessageBubble
            role="assistant"
            content={liveRun?.text ?? ""}
            toolSteps={liveRun?.toolSteps}
            tools={liveRun?.tools}
            status={liveRun?.status ?? "PENDING"}
            error={liveRun?.error}
          />
        )}
        {queued.map((text, i) => (
          <div key={i} className="opacity-60">
            <MessageBubble role="user" content={text} />
          </div>
        ))}
        <div ref={endRef} />
      </div>
    </ScrollArea>
  );
}
