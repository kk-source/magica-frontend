"use client";

import { z } from "zod";
import { useAuth } from "@clerk/nextjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useApiToken } from "@/lib/hooks/useApiToken";
import { apiFetch } from "./client";
import { ChatSchema, MessageSchema } from "./schemas";

const ChatWithMessagesSchema = ChatSchema.extend({ messages: z.array(MessageSchema).default([]) });

export const chatKeys = {
  all: ["chats"] as const,
  detail: (chatId: string) => ["chat", chatId] as const,
};

export const listChats = (token: string | null) => apiFetch("/api/chats", z.array(ChatSchema), { token });

export const createChat = (token: string | null, input: { title?: string } = {}) =>
  apiFetch("/api/chats", ChatSchema, { method: "POST", body: input, token });

export const getChat = (token: string | null, chatId: string) =>
  apiFetch(`/api/chats/${chatId}`, ChatWithMessagesSchema, { token });

export const deleteChat = (token: string | null, chatId: string) =>
  apiFetch(`/api/chats/${chatId}`, z.unknown(), { method: "DELETE", token });

/** Recent chats for the sidebar. */
export function useChats() {
  const { isSignedIn } = useAuth();
  const token = useApiToken();
  return useQuery({
    queryKey: chatKeys.all,
    queryFn: async () => listChats(await token()),
    enabled: Boolean(isSignedIn),
  });
}

/** A chat with its latest messages (oldest first). */
export function useChat(chatId: string) {
  const token = useApiToken();
  return useQuery({
    queryKey: chatKeys.detail(chatId),
    queryFn: async () => getChat(await token(), chatId),
  });
}

export function useCreateChat() {
  const token = useApiToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { title?: string }) => createChat(await token(), input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: chatKeys.all }),
  });
}
