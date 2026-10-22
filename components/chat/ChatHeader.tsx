"use client";

import { ChevronDown, FolderOpen, Monitor, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ChatHeader({ credits = 1000 }: { credits?: number }) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between px-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="gap-1.5 font-medium">
            <Sparkles className="size-4" />
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
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="text-muted-foreground" aria-label="Computer">
          <Monitor />
        </Button>
        <Button variant="ghost" size="icon" className="text-muted-foreground" aria-label="Files">
          <FolderOpen />
        </Button>
        <span className="flex items-center gap-1 rounded-full bg-white/5 px-3 py-1 text-sm">
          <Zap className="size-3.5 text-yellow-400" />
          {credits.toLocaleString()}
        </span>
      </div>
    </header>
  );
}
