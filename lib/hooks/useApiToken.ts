"use client";

import { useAuth } from "@clerk/nextjs";

/** Returns a function that resolves the current Clerk session token for API calls. */
export function useApiToken() {
  const { getToken } = useAuth();
  return () => getToken();
}
