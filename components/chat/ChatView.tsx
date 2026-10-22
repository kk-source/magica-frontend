"use client";

import { useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useChat } from "@/lib/api/chats";
import { useSendMessage } from "@/lib/api/messages";
import { useCancelRun, useRunStatus } from "@/lib/api/runs";
import { isActiveRun } from "@/lib/api/schemas";
import { useChatStore } from "@/lib/stores/chat.store";
import { ChatHeader } from "./ChatHeader";
import { Composer } from "./Composer";
import { MessageList } from "./MessageList";

export function ChatView({ chatId }: { chatId: string }) {
  const initialRunId = useSearchParams().get("run");
  const {
    activeRunId,
    liveRun,
    pendingMessages,
    setActiveChat,
    addPendingMessage,
    clearPendingMessages,
    startRun,
    setLiveRun,
    endRun,
  } = useChatStore();

  useEffect(() => {
    setActiveChat(chatId);
    if (!initialRunId) return;
    startRun(initialRunId);
    // Drop ?run= so a refresh doesn't replay a finished run.
    window.history.replaceState(null, "", `/chat/${chatId}`);
  }, [chatId, initialRunId, setActiveChat, startRun]);

  const { data: chat, error: chatError, refetch } = useChat(chatId);
  const history = useMemo(() => chat?.messages ?? [], [chat]);

  // Resume polling if the page loads while a reply is still being generated.
  useEffect(() => {
    if (activeRunId) return;
    const last = history.at(-1);
    if (last?.role === "assistant" && last.runId && isActiveRun(last.status)) startRun(last.runId);
  }, [history, activeRunId, startRun]);

  const { data: run } = useRunStatus(chatId, activeRunId);

  useEffect(() => {
    if (!run || run.id !== activeRunId) return;
    setLiveRun(run);
    if (isActiveRun(run.status)) return;
    // Terminal: swap the live bubble for the persisted reply.
    void refetch().then(() => {
      endRun();
      clearPendingMessages();
    });
  }, [run, activeRunId, setLiveRun, refetch, endRun, clearPendingMessages]);

  const send = useSendMessage(chatId);
  const cancel = useCancelRun(chatId);

  const submit = (content: string) =>
    send.mutate(
      { content },
      {
        onSuccess: ({ message, runId }) => {
          addPendingMessage(message);
          startRun(runId);
        },
      },
    );

  const stop = () => {
    if (!activeRunId) return;
    cancel.mutate(activeRunId, { onSettled: () => void refetch().then(endRun) });
  };

  const messages = useMemo(() => {
    const ids = new Set(history.map((m) => m.id));
    return [...history, ...pendingMessages.filter((m) => !ids.has(m.id))].filter(
      // The live bubble renders the in-flight reply.
      (m) => !(activeRunId && m.role === "assistant" && m.runId === activeRunId),
    );
  }, [history, pendingMessages, activeRunId]);

  const isRunning = Boolean(activeRunId) || send.isPending;
  const suggestion = isRunning ? null : messages.findLast((m) => m.role === "assistant")?.suggestions?.[0];
  const error = chatError ?? send.error ?? cancel.error;

  return (
    <div className="flex h-full flex-col">
      <ChatHeader />
      <MessageList messages={messages} liveRun={activeRunId ? liveRun : null} awaitingRun={isRunning} />
      <div className="mx-auto w-full max-w-3xl px-4 pb-4">
        {error && <p className="mb-2 text-sm text-destructive">{error.message}</p>}
        <Composer onSubmit={submit} onStop={stop} variant="chat" suggestion={suggestion} isStreaming={isRunning} />
      </div>
    </div>
  );
}
