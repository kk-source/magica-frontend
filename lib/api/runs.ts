import { z } from "zod";
import { apiFetch } from "./client";
import { RunSchema } from "./schemas";

export const getRunStatus = (token: string | null, chatId: string, runId: string) =>
  apiFetch(`/api/chats/${chatId}/runs/${runId}`, RunSchema, { token });

export const cancelRun = (token: string | null, chatId: string, runId: string) =>
  apiFetch(`/api/chats/${chatId}/runs/${runId}/cancel`, z.unknown(), { method: "POST", token });
