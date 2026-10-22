"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getChat } from "@/lib/api/chats";
import { sendMessage } from "@/lib/api/messages";
import { cancelRun } from "@/lib/api/runs";
import { useRunStream } from "@/lib/hooks/useRunStream";
import { useChatStore } from "@/lib/stores/chat.store";
import { ChatHeader } from "./ChatHeader";
import { Composer } from "./Composer";
import { MessageList } from "./MessageList";

export function ChatView({ chatId }: { chatId: string }) {
  const { getToken } = useAuth();
  const initialRunId = useSearchParams().get("run");
  const { activeRunId, isStreaming, setActiveChat, setMessages, addMessage, startRun, endRun } = useChatStore();

  useEffect(() => {
    setActiveChat(chatId);
    if (initialRunId) startRun(initialRunId);
  }, [chatId, initialRunId, setActiveChat, startRun]);

  const { data: chat } = useQuery({
    queryKey: ["chat", chatId],
    queryFn: async () => getChat(await getToken(), chatId),
  });

  useEffect(() => {
    if (chat) setMessages(chat.messages);
  }, [chat, setMessages]);

  useRunStream(chatId, activeRunId);

  const send = useMutation({
    mutationFn: async (content: string) => sendMessage(await getToken(), chatId, { content }),
    onSuccess: ({ message, runId }) => {
      addMessage(message);
      startRun(runId);
    },
  });

  const stop = async () => {
    if (!activeRunId) return;
    await cancelRun(await getToken(), chatId, activeRunId);
    endRun();
  };

  return (
    <div className="flex h-full flex-col">
      <ChatHeader />
      <MessageList />
      <div className="mx-auto w-full max-w-3xl px-4 pb-4">
        <Composer
          onSubmit={(text) => send.mutate(text)}
          onStop={stop}
          isStreaming={isStreaming || send.isPending}
        />
      </div>
    </div>
  );
}
