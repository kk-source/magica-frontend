"use client";

import { useState } from "react";
import { CheckCircle2, ChevronDown, ChevronRight, Loader2, XCircle } from "lucide-react";
import type { ToolStep } from "@/lib/api/schemas";

function formatElapsed(ms: number) {
  return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`;
}

function summarize(steps: ToolStep[]) {
  const [first, ...rest] = steps;
  if (rest.length === 0) return first.label;
  return `${first.label}, ${rest.length} other step${rest.length > 1 ? "s" : ""}`;
}

export function ToolSteps({ steps }: { steps: ToolStep[] }) {
  const [open, setOpen] = useState(false);
  if (steps.length === 0) return null;

  return (
    <div className="mb-2">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        {summarize(steps)}
        {open ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
      </button>
      {open && (
        <ul className="mt-2 divide-y divide-white/10 rounded-lg border border-white/10 text-sm">
          {steps.map((step) => (
            <li key={step.id} className="flex items-center gap-2 px-3 py-2">
              {step.status === "running" && <Loader2 className="size-4 animate-spin text-muted-foreground" />}
              {step.status === "done" && <CheckCircle2 className="size-4 text-emerald-400" />}
              {step.status === "error" && <XCircle className="size-4 text-destructive" />}
              <span className="min-w-0 flex-1 truncate">
                {step.label}
                {step.argument && <strong className="ml-1 font-semibold text-foreground">{step.argument}</strong>}
              </span>
              {step.elapsedMs != null && (
                <span className="shrink-0 text-xs text-muted-foreground tabular-nums">{formatElapsed(step.elapsedMs)}</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
