"use client";

import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { useApiToken } from "@/lib/hooks/useApiToken";
import { apiFetch } from "./client";

const MeSchema = z.object({ id: z.string(), credits: z.number() });

export const meKey = ["me"] as const;

/** Signed-in user's credit balance; invalidated when a run finishes. */
export function useMe() {
  const { isSignedIn } = useAuth();
  const token = useApiToken();
  return useQuery({
    queryKey: meKey,
    queryFn: async () => apiFetch("/api/me", MeSchema, { token: await token() }),
    enabled: Boolean(isSignedIn),
  });
}
