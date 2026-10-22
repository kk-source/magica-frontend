"use client";

import { useCallback } from "react";
import { useAuth } from "@clerk/nextjs";

/** Returns a stable function that resolves the current Clerk session token for API calls. */
export function useApiToken() {
  const { getToken } = useAuth();
  return useCallback(() => getToken(), [getToken]);
}
