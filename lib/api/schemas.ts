import { z } from "zod";

// HTTP contract. Mirrors magica-backend lib/contracts.ts — keep the two in sync.

export const RunStatusSchema = z.enum(["PENDING", "STREAMING", "WAITING", "COMPLETE", "FAILED", "CANCELLED"]);
export type RunStatus = z.infer<typeof RunStatusSchema>;

export const ChatSchema = z.object({
  id: z.string(),
  title: z.string(),
  pinned: z.boolean().default(false),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Chat = z.infer<typeof ChatSchema>;

/** Raw tool call event; `tool_end.output` carries produced media URLs. */
export const ToolEventSchema = z.object({
  type: z.enum(["tool_start", "tool_end"]),
  id: z.string(),
  name: z.string(),
  input: z.unknown().optional(),
  output: z.unknown().optional(),
  error: z.string().optional(),
  at: z.number().optional(),
  creditCost: z.number().optional(),
});
export type ToolEvent = z.infer<typeof ToolEventSchema>;

export const ToolStepSchema = z.object({
  label: z.string(),
  /** Highlighted argument shown in bold after the label, e.g. a skill name or prompt. */
  boldArg: z.string().nullish(),
  elapsedMs: z.number(),
  /** Worker clock when the step started; lets a running step's timer tick between updates. */
  startedAt: z.number().nullish(),
  status: z.enum(["running", "done", "failed"]),
});
export type ToolStep = z.infer<typeof ToolStepSchema>;

export const AttachmentSchema = z.object({ url: z.string(), mimeType: z.string(), fileName: z.string() });
export type Attachment = z.infer<typeof AttachmentSchema>;

export const MessageSchema = z.object({
  id: z.string(),
  chatId: z.string(),
  role: z.enum(["user", "assistant", "tool", "system"]),
  content: z.string(),
  status: RunStatusSchema.nullish(),
  runId: z.string().nullish(),
  attachments: z.array(AttachmentSchema).default([]),
  tools: z.array(ToolEventSchema).default([]),
  toolSteps: z.array(ToolStepSchema).optional(),
  credits: z.number().optional(),
  suggestions: z.array(z.string()).optional(),
  createdAt: z.string(),
});
export type Message = z.infer<typeof MessageSchema>;

/** A question a paused run is waiting on: credit approval or a choice between options. */
export const WaitpointSchema = z.object({
  id: z.string(),
  type: z.enum(["credit", "options"]),
  question: z.string(),
  options: z.array(z.string()),
  estimatedCredits: z.number().optional(),
  expiresAt: z.string(),
});
export type Waitpoint = z.infer<typeof WaitpointSchema>;

export const RunSchema = z.object({
  id: z.string(),
  chatId: z.string(),
  status: RunStatusSchema,
  text: z.string(),
  tools: z.array(ToolEventSchema),
  toolSteps: z.array(ToolStepSchema),
  credits: z.number(),
  error: z.string().nullish(),
  /** Trigger.dev Realtime subscription for live progress; present while the run is active. */
  realtime: z.object({ runId: z.string(), accessToken: z.string() }).nullish(),
  /** Set while the run is WAITING on the user. */
  waitpoint: WaitpointSchema.nullish(),
});
export type Run = z.infer<typeof RunSchema>;

export const ACTIVE_RUN_STATUSES: readonly RunStatus[] = ["PENDING", "STREAMING", "WAITING"];
export const isActiveRun = (status: RunStatus | null | undefined) => !!status && ACTIVE_RUN_STATUSES.includes(status);

export type Media = { kind: "image" | "video"; url: string };

/**
 * Drops generated-media URLs from reply text (markdown images, links and bare URLs), since the media
 * already renders inline below the reply. Also drops echoed `<tool_result>` context tags.
 */
export function stripMediaUrls(text: string, media: Media[]): string {
  let out = text.replace(/<tool_result[^>]*>[\s\S]*?<\/tool_result>/g, "");
  for (const { url } of media) {
    const u = url.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    out = out
      .replace(new RegExp(`!\\[[^\\]]*\\]\\(${u}\\)`, "g"), "")
      .replace(new RegExp(`\\[([^\\]]*)\\]\\(${u}\\)`, "g"), (_, label: string) => (label === url ? "" : label))
      .replace(new RegExp(`<?${u}>?`, "g"), "");
  }
  return out.replace(/[ \t]+$/gm, "").replace(/\n{3,}/g, "\n\n").trim();
}

/** Images and videos produced by successful tool calls, in call order. */
export function mediaFromTools(tools: ToolEvent[]): Media[] {
  return tools.flatMap((e): Media[] => {
    if (e.type !== "tool_end" || e.error) return [];
    const out = (e.output ?? {}) as { image_url?: unknown; video_url?: unknown };
    if (typeof out.image_url === "string") return [{ kind: "image", url: out.image_url }];
    if (typeof out.video_url === "string") return [{ kind: "video", url: out.video_url }];
    return [];
  });
}
