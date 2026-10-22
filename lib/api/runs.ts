"use client";

import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useApiToken } from "@/lib/hooks/useApiToken";
import { apiFetch } from "./client";
import { RunSchema, isActiveRun } from "./schemas";

export const getRunStatus = (token: string | null, chatId: string, runId: string) =>
  apiFetch(`/api/chats/${chatId}/runs/${runId}`, RunSchema, { token });

export const cancelRun = (token: string | null, chatId: string, runId: string) =>
  apiFetch(`/api/chats/${chatId}/runs/${runId}/cancel`, z.unknown(), { method: "POST", token });

/** Polls a run every second while it is PENDING/STREAMING; stops once it is terminal. */
export function useRunStatus(chatId: string, runId: string | null) {
  const token = useApiToken();
  return useQuery({
    queryKey: ["run", chatId, runId],
    queryFn: async () => getRunStatus(await token(), chatId, runId!),
    enabled: Boolean(runId),
    staleTime: 0,
    refetchInterval: (q) => (!q.state.data || isActiveRun(q.state.data.status) ? 1000 : false),
  });
}

export function useCancelRun(chatId: string) {
  const token = useApiToken();
  return useMutation({
    mutationFn: async (runId: string) => cancelRun(await token(), chatId, runId),
  });
}
