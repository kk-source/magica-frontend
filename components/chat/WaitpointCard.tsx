"use client";

import { useEffect, useRef } from "react";
import { Coins, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAnswerWaitpoint } from "@/lib/api/waitpoints";
import type { Waitpoint } from "@/lib/api/schemas";

const time = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

/** The question a paused run is waiting on. Buttons lock after the first click so it's answered once. */
export function WaitpointCard({ chatId, runId, waitpoint }: { chatId: string; runId: string | null; waitpoint: Waitpoint }) {
  const answer = useAnswerWaitpoint(chatId, runId);
  const firstButton = useRef<HTMLButtonElement>(null);
  useEffect(() => firstButton.current?.focus(), [waitpoint.id]);

  const picked = answer.variables?.waitpointId === waitpoint.id ? answer.variables.choice : null;
  const locked = answer.isPending || answer.isSuccess;

  return (
    <div role="group" aria-label={waitpoint.question} className="mt-3 max-w-md rounded-xl border bg-card p-4 text-sm">
      <p className="flex items-start gap-2">
        {waitpoint.type === "credit" && <Coins className="mt-0.5 size-4 shrink-0 text-muted-foreground" />}
        {waitpoint.question}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {waitpoint.options.map((option, i) => (
          <Button
            key={option}
            ref={i === 0 ? firstButton : undefined}
            size="sm"
            variant={i === 0 ? "default" : "outline"}
            disabled={locked}
            onClick={() => answer.mutate({ waitpointId: waitpoint.id, choice: option })}
          >
            {answer.isPending && picked === option && <Loader2 className="size-3.5 animate-spin" />}
            {option}
          </Button>
        ))}
      </div>
      <p className="mt-2 text-xs text-muted-foreground" aria-live="polite">
        {answer.error
          ? answer.error.message
          : answer.isSuccess
            ? `You chose "${answer.data.choice}". Continuing…`
            : `Waiting for your answer · expires ${time(waitpoint.expiresAt)}`}
      </p>
    </div>
  );
}
