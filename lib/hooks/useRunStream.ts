"use client";

import { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getRunStatus } from "@/lib/api/runs";
import { ACTIVE_RUN_STATUSES } from "@/lib/api/schemas";
import { useChatStore } from "@/lib/stores/chat.store";

/** Polls a run every second while it is active and mirrors its text into the chat store. */
export function useRunStream(chatId: string, runId: string | null) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const setStreamingText = useChatStore((s) => s.setStreamingText);
  const setStreamingSteps = useChatStore((s) => s.setStreamingSteps);
  const endRun = useChatStore((s) => s.endRun);

  const query = useQuery({
    queryKey: ["run", chatId, runId],
    queryFn: async () => getRunStatus(await getToken(), chatId, runId!),
    enabled: Boolean(runId),
    refetchInterval: (q) => {
      const status = q.state.data?.status;
      return !status || ACTIVE_RUN_STATUSES.includes(status) ? 1000 : false;
    },
  });

  const run = query.data;

  useEffect(() => {
    if (!run) return;
    if (ACTIVE_RUN_STATUSES.includes(run.status)) {
      setStreamingText(run.text);
      setStreamingSteps(run.toolSteps);
      return;
    }
    endRun();
    void queryClient.invalidateQueries({ queryKey: ["chat", chatId] });
  }, [run, chatId, setStreamingText, setStreamingSteps, endRun, queryClient]);

  return { run, error: query.error };
}
