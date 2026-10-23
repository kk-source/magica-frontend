"use client";

import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRealtimeRun } from "@trigger.dev/react-hooks";
import { useApiToken } from "@/lib/hooks/useApiToken";
import { apiFetch } from "./client";
import { RunSchema, RunStatusSchema, ToolEventSchema, ToolStepSchema, isActiveRun, type Run } from "./schemas";

/** Without Realtime (no token) we poll fast; with it, a slow poll only backs up stalls and crashes. */
const POLL_MS = 1000;
const SAFETY_POLL_MS = 5000;

/** What the agent-run task writes to its Trigger.dev run metadata as it streams. */
const LiveMetadataSchema = z.object({
  status: RunStatusSchema.optional(),
  text: z.string().optional(),
  tools: z.array(ToolEventSchema).optional(),
  toolSteps: z.array(ToolStepSchema).optional(),
});

export const getRunStatus = (token: string | null, chatId: string, runId: string) =>
  apiFetch(`/api/chats/${chatId}/runs/${runId}`, RunSchema, { token });

export const cancelRun = (token: string | null, chatId: string, runId: string) =>
  apiFetch(`/api/chats/${chatId}/runs/${runId}/cancel`, z.unknown(), { method: "POST", token });

/**
 * Live state of a run. The backend route gives the persisted status plus a Realtime token; live text
 * and tool steps then stream from the Trigger.dev run metadata. Once the run finishes, the route is
 * refetched for the final status.
 */
export function useRunStatus(chatId: string, runId: string | null) {
  const token = useApiToken();
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["run", chatId, runId],
    queryFn: async () => getRunStatus(await token(), chatId, runId!),
    enabled: Boolean(runId),
    staleTime: 0,
    refetchInterval: (q) => {
      const run = q.state.data;
      if (run && !isActiveRun(run.status)) return false;
      return run?.realtime ? SAFETY_POLL_MS : POLL_MS;
    },
  });
  const base = query.data;

  // Every poll mints a fresh token; keep the first one so the subscription isn't torn down.
  const [sub, setSub] = useState<{ runId: string; realtime: NonNullable<Run["realtime"]> } | null>(null);
  useEffect(() => {
    if (runId && base?.realtime && sub?.runId !== runId) setSub({ runId, realtime: base.realtime });
  }, [runId, base?.realtime, sub?.runId]);

  const active = Boolean(base && isActiveRun(base.status));
  const realtime = active && sub?.runId === runId ? sub.realtime : null;
  const { run: live } = useRealtimeRun(realtime?.runId, {
    accessToken: realtime?.accessToken,
    enabled: Boolean(realtime),
    onComplete: () => void queryClient.invalidateQueries({ queryKey: ["run", chatId, runId] }),
  });

  // The worker flags COMPLETE in metadata right after persisting the reply; refetch now instead of
  // waiting for the run to wind down or the next safety poll.
  const liveStatus = (live?.metadata as { status?: unknown } | undefined)?.status;
  useEffect(() => {
    if (active && typeof liveStatus === "string" && liveStatus !== "PENDING" && liveStatus !== "STREAMING") {
      void queryClient.invalidateQueries({ queryKey: ["run", chatId, runId] });
    }
  }, [active, liveStatus, queryClient, chatId, runId]);

  const data = useMemo((): Run | undefined => {
    if (!base || !active || !live) return base;
    const meta = LiveMetadataSchema.safeParse(live.metadata ?? {});
    if (!meta.success) return base;
    const { status, text, tools, toolSteps } = meta.data;
    return {
      ...base,
      // Terminal statuses come from the refetch, after the reply is persisted.
      status: status && isActiveRun(status) ? status : base.status,
      text: text ?? base.text,
      tools: tools ?? base.tools,
      toolSteps: toolSteps ?? base.toolSteps,
      credits: tools
        ? tools.reduce((sum, e) => sum + (e.type === "tool_end" ? (e.creditCost ?? 0) : 0), 0)
        : base.credits,
    };
  }, [base, active, live]);

  return { data };
}

export function useCancelRun(chatId: string) {
  const token = useApiToken();
  return useMutation({
    mutationFn: async (runId: string) => cancelRun(await token(), chatId, runId),
  });
}
