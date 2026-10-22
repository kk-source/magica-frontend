import { z } from "zod";
import { apiFetch } from "./client";

const UploadParamsSchema = z.object({ params: z.string(), signature: z.string() });

/** Signed Transloadit Assembly params; the backend holds the secret. */
export const getUploadParams = (token: string | null) =>
  apiFetch("/api/uploads/params", UploadParamsSchema, { method: "POST", token });
