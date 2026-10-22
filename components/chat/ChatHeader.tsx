"use client";

import { ChevronDown, FolderOpen, Monitor, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMe } from "@/lib/api/me";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatCredits } from "@/lib/utils";

export function ChatHeader({ showFiles = false }: { showFiles?: boolean }) {
  const credits = useMe().data?.credits;
  return (
    <header className="flex h-16 shrink-0 items-center justify-between px-5">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="gap-1.5 px-2 font-medium">
            <span className="flex size-4 items-center justify-center rounded bg-foreground text-background">
              <Sparkles className="size-2.5" />
            </span>
            Magica Auto
            <ChevronDown className="size-4 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem>
            <Sparkles />
            Magica Auto
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <div className="flex items-center gap-2">
        <button
          title="Coming soon"
          className="flex h-9 items-center gap-1.5 rounded-full bg-surface px-3.5 text-sm font-medium"
        >
          <Monitor className="size-4" />
          Computer
        </button>
        {showFiles && (
          <button
            title="Coming soon"
            aria-label="Files"
            className="flex size-9 items-center justify-center rounded-full border border-border hover:bg-accent"
          >
            <FolderOpen className="size-4" />
          </button>
        )}
        <span className="flex h-9 items-center gap-1.5 rounded-full border border-border px-3.5 text-[13px] tabular-nums">
          <Sparkles className="size-3.5" />
          {credits === undefined ? "—" : formatCredits(credits)}
        </span>
      </div>
    </header>
  );
}
