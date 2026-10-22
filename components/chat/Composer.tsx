"use client";

import { useRef } from "react";
import { ArrowUp, FileVideo, FolderOpen, Loader2, Mic, Paperclip, Plug, RotateCw, Square, Wrench, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { AttachmentInput } from "@/lib/api/messages";
import { useUploads, type UploadItem } from "@/lib/hooks/useUploads";
import { useUiStore } from "@/lib/stores/ui.store";
import { cn } from "@/lib/utils";

type ComposerProps = {
  onSubmit: (text: string, attachments: AttachmentInput[]) => void;
  onStop?: () => void;
  isStreaming?: boolean;
  disabled?: boolean;
  /** "home" shows the project picker; "chat" shows tools + connectors and the follow-up chip. */
  variant?: "home" | "chat";
  suggestion?: string | null;
  className?: string;
};

export function Composer({
  onSubmit,
  onStop,
  isStreaming = false,
  disabled = false,
  variant = "home",
  suggestion,
  className,
}: ComposerProps) {
  const value = useUiStore((s) => s.composerValue);
  const setValue = useUiStore((s) => s.setComposerValue);
  // Typing stays enabled during a run; ChatView queues what's sent until the run ends.
  const uploads = useUploads();
  const fileInput = useRef<HTMLInputElement>(null);
  const canSend = value.trim().length > 0 && !disabled && !uploads.uploading;

  const submit = () => {
    if (!canSend) return;
    onSubmit(value.trim(), uploads.attachments);
    setValue("");
    uploads.clear();
  };

  return (
    <div className={cn("w-full", className)}>
      {variant === "chat" && suggestion && !isStreaming && (
        <button
          onClick={() => setValue(suggestion)}
          className="mb-2 max-w-full truncate rounded-full border border-white/10 px-3.5 py-1.5 text-sm text-white/80 transition-colors hover:bg-white/5"
        >
          {suggestion}
        </button>
      )}
      <div className="rounded-3xl border border-white/10 bg-[#161616] p-3 shadow-lg focus-within:border-white/20">
        {uploads.items.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2 px-1">
            {uploads.items.map((item) => (
              <UploadChip key={item.id} item={item} onRemove={() => uploads.remove(item.id)} onRetry={() => uploads.retry(item.id)} />
            ))}
          </div>
        )}
        {uploads.error && <p className="mb-2 px-2 text-xs text-destructive">{uploads.error}</p>}
        <Textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault();
              submit();
            }
          }}
          placeholder={variant === "chat" ? "Send a message…" : "Assign a task or ask anything…"}
          disabled={disabled}
          rows={2}
          className="max-h-60 min-h-14 resize-none border-0 bg-transparent px-2 text-base shadow-none focus-visible:ring-0 dark:bg-transparent"
        />
        <div className="mt-2 flex items-center gap-1">
          <input
            ref={fileInput}
            type="file"
            multiple
            accept="image/*,video/*"
            className="hidden"
            onChange={(e) => {
              uploads.add(e.target.files);
              e.target.value = "";
            }}
          />
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            aria-label="Attach file"
            onClick={() => fileInput.current?.click()}
            disabled={disabled}
          >
            <Paperclip />
          </Button>
          {variant === "chat" ? (
            <>
              <Button variant="ghost" size="icon" className="rounded-full" aria-label="Tools" disabled title="Coming soon">
                <Wrench />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full" aria-label="Connectors" disabled title="Coming soon">
                <Plug />
              </Button>
            </>
          ) : (
            <Button variant="ghost" size="sm" className="rounded-full text-muted-foreground" disabled title="Coming soon">
              <FolderOpen />
              Project
            </Button>
          )}
          <div className="flex-1" />
          <Button variant="ghost" size="icon" className="rounded-full" aria-label="Voice input" disabled title="Coming soon">
            <Mic />
          </Button>
          {isStreaming && !canSend ? (
            <Button size="icon" className="rounded-full" onClick={onStop} aria-label="Stop">
              <Square className="fill-current" />
            </Button>
          ) : (
            <Button size="icon" className="rounded-full" onClick={submit} disabled={!canSend} aria-label="Send">
              <ArrowUp />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function UploadChip({ item, onRemove, onRetry }: { item: UploadItem; onRemove: () => void; onRetry: () => void }) {
  const isImage = item.type.startsWith("image/");
  return (
    <div
      className={cn(
        "flex max-w-56 items-center gap-2 rounded-xl border border-white/10 bg-white/5 py-1 pr-1 pl-1 text-xs",
        item.error && "border-destructive/50",
      )}
    >
      <div className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white/5">
        {item.url && isImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.url} alt="" className="size-full object-cover" />
        ) : item.url ? (
          <FileVideo className="size-4 text-muted-foreground" />
        ) : item.error ? (
          <X className="size-4 text-destructive" />
        ) : (
          <Loader2 className="size-4 animate-spin text-muted-foreground" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-white/90">{item.name}</p>
        <p className="text-muted-foreground">{item.error ? "Upload failed" : item.url ? "Uploaded" : `${Math.round(item.progress)}%`}</p>
      </div>
      {item.error && (
        <button onClick={onRetry} className="rounded-full p-1 text-muted-foreground hover:bg-white/10" aria-label="Retry upload">
          <RotateCw className="size-3.5" />
        </button>
      )}
      <button onClick={onRemove} className="rounded-full p-1 text-muted-foreground hover:bg-white/10" aria-label="Remove file">
        <X className="size-3.5" />
      </button>
    </div>
  );
}
