import { Loader2, Sparkles } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { Message } from "@/lib/api/schemas";
import { cn } from "@/lib/utils";

type MessageBubbleProps = {
  role: Message["role"];
  content: string;
  pending?: boolean;
};

export function MessageBubble({ role, content, pending = false }: MessageBubbleProps) {
  if (role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-2xl bg-[#222222] px-4 py-2.5 whitespace-pre-wrap">{content}</div>
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      <Avatar className="mt-0.5 size-7">
        <AvatarFallback className="bg-white/10">
          <Sparkles className="size-4" />
        </AvatarFallback>
      </Avatar>
      <div className={cn("min-w-0 flex-1 pt-0.5 leading-relaxed whitespace-pre-wrap", role === "tool" && "text-sm text-muted-foreground")}>
        {content}
        {pending && (
          <span className="inline-flex items-center gap-2 text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            {!content && "Thinking…"}
          </span>
        )}
      </div>
    </div>
  );
}
