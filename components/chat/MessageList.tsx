"use client";

import { useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChatStore } from "@/lib/stores/chat.store";
import { MessageBubble } from "./MessageBubble";

export function MessageList() {
  const messages = useChatStore((s) => s.messages);
  const isStreaming = useChatStore((s) => s.isStreaming);
  const streamingText = useChatStore((s) => s.streamingText);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, streamingText]);

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
              pending={m.status === "PENDING" || m.status === "STREAMING"}
            />
          ))}
        {isStreaming && <MessageBubble role="assistant" content={streamingText} pending />}
        <div ref={endRef} />
      </div>
    </ScrollArea>
  );
}
