"use client";

import { ArrowUp, FolderOpen, Mic, Paperclip, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useUiStore } from "@/lib/stores/ui.store";
import { cn } from "@/lib/utils";

type ComposerProps = {
  onSubmit: (text: string) => void;
  onStop?: () => void;
  isStreaming?: boolean;
  disabled?: boolean;
  className?: string;
};

export function Composer({ onSubmit, onStop, isStreaming = false, disabled = false, className }: ComposerProps) {
  const value = useUiStore((s) => s.composerValue);
  const setValue = useUiStore((s) => s.setComposerValue);
  const canSend = value.trim().length > 0 && !isStreaming && !disabled;

  const submit = () => {
    if (!canSend) return;
    onSubmit(value.trim());
    setValue("");
  };

  return (
    <div
      className={cn(
        "w-full rounded-3xl border border-white/10 bg-[#161616] p-3 shadow-lg focus-within:border-white/20",
        className,
      )}
    >
      <Textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
            e.preventDefault();
            submit();
          }
        }}
        placeholder="Assign a task or ask anything…"
        disabled={isStreaming || disabled}
        rows={2}
        className="max-h-60 min-h-14 resize-none border-0 bg-transparent px-2 text-base shadow-none focus-visible:ring-0 dark:bg-transparent"
      />
      <div className="mt-2 flex items-center gap-1">
        <Button variant="ghost" size="icon" className="rounded-full" aria-label="Attach file">
          <Paperclip />
        </Button>
        <Button variant="ghost" size="sm" className="rounded-full text-muted-foreground">
          <FolderOpen />
          Project
        </Button>
        <div className="flex-1" />
        <Button variant="ghost" size="icon" className="rounded-full" aria-label="Voice input">
          <Mic />
        </Button>
        {isStreaming ? (
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
  );
}
