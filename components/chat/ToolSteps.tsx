"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, ChevronDown, ChevronRight, Loader2, XCircle } from "lucide-react";
import type { ToolStep } from "@/lib/api/schemas";

function formatElapsed(ms: number) {
  return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`;
}

// Done: "Loaded skill, generated image". Matches Galaxy's collapsed summary.
function summarize(steps: ToolStep[]) {
  const labels = [...new Set(steps.map((s) => s.label))];
  return labels.map((l, i) => (i === 0 ? l : l.charAt(0).toLowerCase() + l.slice(1))).join(", ");
}

export function ToolSteps({ steps }: { steps: ToolStep[] }) {
  const running = steps.findLast((s) => s.status === "running");
  const [open, setOpen] = useState(false);
  // Expanded while a step is running, collapsed to the summary once everything finishes.
  const isRunning = Boolean(running);
  useEffect(() => setOpen(isRunning), [isRunning]);
  if (steps.length === 0) return null;

  return (
    <div className="mb-2">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        {running ? (
          <span className="flex items-center gap-1.5">
            <span className="tracking-widest">···</span>
            {running.label}
            <span className="tabular-nums">{Math.floor(running.elapsedMs / 1000)}s</span>
          </span>
        ) : (
          summarize(steps)
        )}
        {open ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}
      </button>
      {open && (
        <ul className="mt-2 divide-y divide-border rounded-xl border border-border text-sm">
          {steps.map((step, i) => (
            <li key={i} className="flex items-center gap-2 px-3 py-2">
              {step.status === "running" && <Loader2 className="size-4 animate-spin text-muted-foreground" />}
              {step.status === "done" && <CheckCircle2 className="size-4 text-emerald-400" />}
              {step.status === "failed" && <XCircle className="size-4 text-destructive" />}
              <span className="min-w-0 flex-1 truncate">
                {step.label}
                {step.boldArg && <strong className="ml-1 font-semibold text-foreground">{step.boldArg}</strong>}
              </span>
              <span className="shrink-0 text-xs text-muted-foreground tabular-nums">{formatElapsed(step.elapsedMs)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
