"use client";

import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useApiToken } from "@/lib/hooks/useApiToken";
import { chatKeys } from "./chats";
import { apiFetch } from "./client";
import { MessageSchema } from "./schemas";

const SendMessageResponseSchema = z.object({
  message: MessageSchema,
  runId: z.string(),
});
export type SendMessageResponse = z.infer<typeof SendMessageResponseSchema>;
export type SendMessageInput = { content: string; attachments?: string[]; idempotencyKey?: string };

export const listMessages = (token: string | null, chatId: string) =>
  apiFetch(`/api/chats/${chatId}/messages`, z.array(MessageSchema), { token });

export const sendMessage = (token: string | null, chatId: string, input: SendMessageInput) =>
  apiFetch(`/api/chats/${chatId}/messages`, SendMessageResponseSchema, {
    method: "POST",
    // Resends of the same submit (network retry) return the existing run instead of a duplicate.
    body: { idempotencyKey: crypto.randomUUID(), ...input },
    token,
  });

export function useMessages(chatId: string) {
  const token = useApiToken();
  return useQuery({
    queryKey: ["messages", chatId],
    queryFn: async () => listMessages(await token(), chatId),
  });
}

export function useSendMessage(chatId: string) {
  const token = useApiToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: SendMessageInput) => sendMessage(await token(), chatId, input),
    // The first message renames the chat, so refresh the sidebar list.
    onSuccess: () => queryClient.invalidateQueries({ queryKey: chatKeys.all }),
  });
}
