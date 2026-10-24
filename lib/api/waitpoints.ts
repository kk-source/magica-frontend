"use client";

import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiToken } from "@/lib/hooks/useApiToken";
import { apiFetch } from "./client";

const AnswerResponseSchema = z.object({ id: z.string(), status: z.literal("RESOLVED"), choice: z.string() });

/** Idempotent: answering twice returns the first answer instead of resuming the run again. */
export const answerWaitpoint = (token: string | null, chatId: string, waitpointId: string, choice: string) =>
  apiFetch(`/api/chats/${chatId}/waitpoints/${waitpointId}`, AnswerResponseSchema, {
    method: "POST",
    body: { choice },
    token,
  });

export function useAnswerWaitpoint(chatId: string, runId: string | null) {
  const token = useApiToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ waitpointId, choice }: { waitpointId: string; choice: string }) =>
      answerWaitpoint(await token(), chatId, waitpointId, choice),
    // Resolved or expired, the run's state moved on; pick it up now instead of at the next poll.
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["run", chatId, runId] }),
  });
}
