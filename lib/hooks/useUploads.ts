"use client";

import { useEffect, useRef, useState } from "react";
import Uppy, { type UppyFile } from "@uppy/core";
import Transloadit, { type AssemblyFile } from "@uppy/transloadit";
import { getUploadParams } from "@/lib/api/uploads";
import type { AttachmentInput } from "@/lib/api/messages";
import { useApiToken } from "./useApiToken";

type FileMeta = { url?: string; mimeType?: string };
type File = UppyFile<FileMeta, Record<string, never>>;

export type UploadItem = {
  id: string;
  name: string;
  type: string;
  /** 0–100 */
  progress: number;
  url?: string;
  error?: string;
};

const toItem = (f: File): UploadItem => ({
  id: f.id,
  name: f.name ?? "file",
  type: f.type ?? "",
  progress: f.meta.url ? 100 : Math.min(99, f.progress.percentage ?? 0),
  url: f.meta.url,
  error: f.error ?? undefined,
});

/**
 * Uploads picked files to Transloadit (tus, resumable) as soon as they're added.
 * Each finished file carries its Transloadit URL, which is what we send to the backend.
 */
export function useUploads() {
  const token = useApiToken();
  const tokenRef = useRef(token);
  tokenRef.current = token;
  const [uppy] = useState(() =>
    new Uppy<FileMeta, Record<string, never>>({
      autoProceed: true,
      restrictions: { maxNumberOfFiles: 10, maxFileSize: 200 * 1024 * 1024, allowedFileTypes: ["image/*", "video/*"] },
    }).use(Transloadit, {
      waitForEncoding: true,
      assemblyOptions: async () => getUploadParams(await tokenRef.current()),
    }),
  );
  const [items, setItems] = useState<UploadItem[]>([]);
  const [restrictionError, setRestrictionError] = useState<string | null>(null);

  useEffect(() => {
    const onRestriction = (_file: unknown, err: Error) => setRestrictionError(err.message);
    const sync = () => setItems(uppy.getFiles().map(toItem));
    const onUpload = (uploaded: AssemblyFile) => {
      // The plugin records which local file each Assembly upload came from. Transloadit can report a
      // different size than the local file (it rewrites metadata), so name + size is only a fallback.
      const localId = uppy.getPlugin<Transloadit<FileMeta, Record<string, never>>>("Transloadit")?.getPluginState()
        .files[uploaded.id]?.id;
      const local = localId
        ? uppy.getFile(localId)
        : uppy.getFiles().find((f) => !f.meta.url && f.name === uploaded.name);
      if (local && uploaded.ssl_url) uppy.setFileMeta(local.id, { url: uploaded.ssl_url, mimeType: uploaded.mime ?? local.type });
    };
    uppy.on("state-update", sync);
    uppy.on("transloadit:upload", onUpload);
    uppy.on("restriction-failed", onRestriction);
    return () => {
      uppy.off("state-update", sync);
      uppy.off("transloadit:upload", onUpload);
      uppy.off("restriction-failed", onRestriction);
    };
  }, [uppy]);

  const add = (files: FileList | null) => {
    setRestrictionError(null);
    for (const data of Array.from(files ?? [])) {
      try {
        uppy.addFile({ name: data.name, type: data.type, data, source: "Local" });
      } catch {
        // Restriction errors surface via "restriction-failed".
      }
    }
  };

  const ready: AttachmentInput[] = uppy
    .getFiles()
    .filter((f) => f.meta.url)
    .map((f) => ({ url: f.meta.url!, mimeType: f.meta.mimeType, fileName: f.name, fileSizeBytes: f.size ?? undefined }));

  return {
    items,
    attachments: ready,
    uploading: items.some((i) => !i.url && !i.error),
    error: restrictionError ?? items.find((i) => i.error)?.error ?? null,
    add,
    remove: (id: string) => uppy.removeFile(id),
    retry: (id: string) => void uppy.retryUpload(id),
    clear: () => uppy.cancelAll(),
  };
}
