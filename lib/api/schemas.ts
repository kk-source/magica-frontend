import { z } from "zod";

export const RunStatusSchema = z.enum(["PENDING", "STREAMING", "COMPLETE", "FAILED", "CANCELLED"]);
export type RunStatus = z.infer<typeof RunStatusSchema>;

export const ChatSchema = z.object({
  id: z.string(),
  title: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Chat = z.infer<typeof ChatSchema>;

export const MessageSchema = z.object({
  id: z.string(),
  chatId: z.string(),
  role: z.enum(["user", "assistant", "tool", "system"]),
  content: z.string(),
  status: RunStatusSchema.nullish(),
  runId: z.string().nullish(),
  createdAt: z.string(),
});
export type Message = z.infer<typeof MessageSchema>;

export const RunSchema = z.object({
  id: z.string(),
  chatId: z.string(),
  status: RunStatusSchema,
  text: z.string().default(""),
  error: z.string().nullish(),
});
export type Run = z.infer<typeof RunSchema>;

export const ACTIVE_RUN_STATUSES: readonly RunStatus[] = ["PENDING", "STREAMING"];
