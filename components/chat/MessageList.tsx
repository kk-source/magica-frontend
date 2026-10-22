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
};

export function MessageList({ messages, liveRun, awaitingRun }: MessageListProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, liveRun?.text, liveRun?.toolSteps.length]);

  return (
    <ScrollArea className="min-h-0 flex-1">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6">
        {messages
          .filter((m) => m.role !== "system")
          .map((m) => (
            <MessageBubble
              key={m.id}
              role={m.role}
              content={m.content}
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
        <div ref={endRef} />
      </div>
    </ScrollArea>
  );
}
