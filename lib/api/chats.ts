import { z } from "zod";
import { apiFetch } from "./client";
import { ChatSchema, MessageSchema } from "./schemas";

const ChatWithMessagesSchema = ChatSchema.extend({ messages: z.array(MessageSchema).default([]) });

export const listChats = (token: string | null) => apiFetch("/api/chats", z.array(ChatSchema), { token });

export const createChat = (token: string | null, input: { title?: string } = {}) =>
  apiFetch("/api/chats", ChatSchema, { method: "POST", body: input, token });

export const getChat = (token: string | null, chatId: string) =>
  apiFetch(`/api/chats/${chatId}`, ChatWithMessagesSchema, { token });

export const deleteChat = (token: string | null, chatId: string) =>
  apiFetch(`/api/chats/${chatId}`, z.unknown(), { method: "DELETE", token });
