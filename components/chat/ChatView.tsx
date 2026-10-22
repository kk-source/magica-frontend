"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useChat } from "@/lib/api/chats";
import { meKey } from "@/lib/api/me";
import { useSendMessage, type AttachmentInput } from "@/lib/api/messages";
import { useCancelRun, useRunStatus } from "@/lib/api/runs";
import { isActiveRun } from "@/lib/api/schemas";
import { useChatStore } from "@/lib/stores/chat.store";
import { ChatHeader } from "./ChatHeader";
import { Composer } from "./Composer";
import { MessageList } from "./MessageList";

const PENDING_TIMEOUT_MS = 90_000;

type Turn = { content: string; attachments: AttachmentInput[] };

export function ChatView({ chatId }: { chatId: string }) {
  const initialRunId = useSearchParams().get("run");
  const {
    activeRunId,
    liveRun,
    pendingMessages,
    setActiveChat,
    addPendingMessage,
    replacePendingMessage,
    removePendingMessage,
    outbox,
    setOutbox,
    startRun,
    setLiveRun,
    endRun,
  } = useChatStore();

  useEffect(() => setActiveChat(chatId), [chatId, setActiveChat]);

  // Separate from the reset above: dropping ?run= re-runs this effect, and must not clear the run.
  useEffect(() => {
    if (!initialRunId) return;
    startRun(initialRunId);
    // Drop ?run= so a refresh doesn't replay a finished run.
    window.history.replaceState(null, "", `/chat/${chatId}`);
  }, [chatId, initialRunId, startRun]);

  const { data: chat, error: chatError, refetch } = useChat(chatId);
  const history = useMemo(() => chat?.messages ?? [], [chat]);

  // Resume polling if the page loads while a reply is still being generated.
  useEffect(() => {
    if (activeRunId) return;
    const last = history.at(-1);
    if (last?.role === "assistant" && last.runId && isActiveRun(last.status)) startRun(last.runId);
  }, [history, activeRunId, startRun]);

  const queryClient = useQueryClient();
  const { data: run } = useRunStatus(chatId, activeRunId);
  const [runError, setRunError] = useState<string | null>(null);
  const runStartedAt = useRef(0);
  useEffect(() => {
    if (activeRunId) runStartedAt.current = Date.now();
  }, [activeRunId]);

  useEffect(() => {
    if (!run || run.id !== activeRunId) return;
    setLiveRun(run);
    // A run that never starts would otherwise spin forever.
    if (run.status === "PENDING" && Date.now() - runStartedAt.current > PENDING_TIMEOUT_MS) {
      setRunError("The agent didn't start. Please try again.");
      endRun();
      return;
    }
    if (isActiveRun(run.status)) return;
    if (run.status === "FAILED") setRunError(run.error ?? "Something went wrong.");
    // Terminal: swap the live bubble for the persisted reply. Pending turns already in history dedupe away.
    void queryClient.invalidateQueries({ queryKey: meKey });
    void refetch().then(endRun);
  }, [run, activeRunId, setLiveRun, refetch, endRun, queryClient]);

  const send = useSendMessage(chatId);
  const cancel = useCancelRun(chatId);

  // Show the turn immediately; swap in the server's copy once the POST returns.
  const dispatch = ({ content, attachments }: Turn) => {
    setRunError(null);
    const tempId = `temp_${crypto.randomUUID()}`;
    addPendingMessage({
      id: tempId,
      chatId,
      role: "user",
      content,
      attachments: attachments.map((a) => ({ url: a.url, mimeType: a.mimeType ?? "", fileName: a.fileName ?? "" })),
      tools: [],
      createdAt: new Date().toISOString(),
    });
    send.mutate(
      { content, attachments },
      {
        onSuccess: ({ message, runId }) => {
          replacePendingMessage(tempId, message);
          startRun(runId);
        },
        onError: () => removePendingMessage(tempId),
      },
    );
  };

  const [queued, setQueued] = useState<Turn[]>([]);
  const isRunning = Boolean(activeRunId) || send.isPending;
  const submit = (content: string, attachments: AttachmentInput[]) => {
    const turn = { content, attachments };
    if (isRunning) setQueued((q) => [...q, turn]);
    else dispatch(turn);
  };

  // Send queued turns one at a time once the current run finishes.
  useEffect(() => {
    if (isRunning || queued.length === 0) return;
    const [next, ...rest] = queued;
    setQueued(rest);
    dispatch(next!);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, queued]);

  // Hand-off from the home page: send its first message here so it renders instantly.
  useEffect(() => {
    if (outbox?.chatId !== chatId) return;
    setOutbox(null);
    dispatch(outbox);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [outbox, chatId]);

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

  const suggestion = isRunning ? null : messages.findLast((m) => m.role === "assistant")?.suggestions?.[0];
  const error = chatError?.message ?? send.error?.message ?? cancel.error?.message ?? runError;

  return (
    <div className="flex h-full flex-col">
      <ChatHeader />
      <MessageList messages={messages} liveRun={activeRunId ? liveRun : null} awaitingRun={isRunning} queued={queued.map((t) => t.content)} />
      <div className="mx-auto w-full max-w-3xl px-4 pb-4">
        {error && <p className="mb-2 text-sm text-destructive">{error}</p>}
        <Composer onSubmit={submit} onStop={stop} variant="chat" suggestion={suggestion} isStreaming={isRunning} />
      </div>
    </div>
  );
}
