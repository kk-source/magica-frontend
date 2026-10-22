import { z } from "zod";
import { apiFetch } from "./client";
import { MessageSchema } from "./schemas";

const SendMessageResponseSchema = z.object({
  message: MessageSchema,
  runId: z.string(),
});
export type SendMessageResponse = z.infer<typeof SendMessageResponseSchema>;

export const listMessages = (token: string | null, chatId: string) =>
  apiFetch(`/api/chats/${chatId}/messages`, z.array(MessageSchema), { token });

export const sendMessage = (token: string | null, chatId: string, input: { content: string; attachments?: string[] }) =>
  apiFetch(`/api/chats/${chatId}/messages`, SendMessageResponseSchema, { method: "POST", body: input, token });
