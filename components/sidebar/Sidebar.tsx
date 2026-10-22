"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { SignInButton, UserButton, useAuth } from "@clerk/nextjs";
import {
  BookOpen,
  Code,
  FolderOpen,
  HelpCircle,
  LayoutList,
  type LucideIcon,
  MessageSquare,
  PanelLeft,
  Plus,
  Search,
  Settings,
  Sparkles,
  Wrench,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { listChats } from "@/lib/api/chats";
import { useUiStore } from "@/lib/stores/ui.store";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";

const NAV_ITEMS: { label: string; href: string; icon: LucideIcon }[] = [
  { label: "New task", href: "/", icon: Plus },
  { label: "Tasks", href: "/tasks", icon: LayoutList },
  { label: "Projects", href: "/projects", icon: FolderOpen },
  { label: "Library", href: "/library", icon: BookOpen },
  { label: "Tools", href: "/tools", icon: Wrench },
  { label: "API/MCP", href: "/api-mcp", icon: Code },
  { label: "Help", href: "/help", icon: HelpCircle },
];

export function Sidebar() {
  const collapsed = useUiStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const pathname = usePathname();
  const { isSignedIn, getToken } = useAuth();

  const { data: chats = [] } = useQuery({
    queryKey: ["chats"],
    queryFn: async () => listChats(await getToken()),
    enabled: Boolean(isSignedIn),
  });

  return (
    <aside
      className={cn(
        "flex h-full shrink-0 flex-col border-r border-white/10 bg-[#111111] text-sm transition-[width] duration-200",
        collapsed ? "w-[60px]" : "w-[260px]",
      )}
    >
      <div className="flex h-14 items-center gap-1 px-3">
        {!collapsed && (
          <Link href="/" className="flex flex-1 items-center gap-2 font-semibold">
            <Sparkles className="size-5" />
            Magica
          </Link>
        )}
        {!collapsed && (
          <Button variant="ghost" size="icon" aria-label="Search">
            <Search />
          </Button>
        )}
        <Button variant="ghost" size="icon" onClick={toggleSidebar} aria-label="Toggle sidebar">
          <PanelLeft />
        </Button>
      </div>

      <nav className="flex flex-col gap-0.5 px-2">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => (
          <SidebarLink key={label} href={href} label={label} collapsed={collapsed} active={pathname === href}>
            <Icon className="size-4 shrink-0" />
          </SidebarLink>
        ))}
      </nav>

      {!collapsed && (
        <>
          <div className="mt-6 px-4 pb-2 text-xs font-medium text-muted-foreground">Recent tasks</div>
          <ScrollArea className="min-h-0 flex-1 px-2">
            {chats.length === 0 ? (
              <p className="px-2 py-1.5 text-xs text-muted-foreground">No tasks yet</p>
            ) : (
              chats.map((chat) => (
                <SidebarLink
                  key={chat.id}
                  href={`/chat/${chat.id}`}
                  label={chat.title}
                  collapsed={false}
                  active={pathname === `/chat/${chat.id}`}
                >
                  <MessageSquare className="size-4 shrink-0 text-muted-foreground" />
                </SidebarLink>
              ))
            )}
          </ScrollArea>
        </>
      )}
      {collapsed && <div className="flex-1" />}

      <div className="flex flex-col gap-2 border-t border-white/10 p-3">
        {!collapsed && (
          <div className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2">
            <span className="flex items-center gap-1.5">
              <Zap className="size-4 text-yellow-400" />
              1,000 credits
            </span>
            <Button size="sm" variant="secondary" className="h-7 text-xs">
              Add Credits
            </Button>
          </div>
        )}
        <div className={cn("flex items-center gap-1", collapsed ? "flex-col" : "justify-between")}>
          <Button variant="ghost" size="icon" aria-label="Settings">
            <Settings />
          </Button>
          <ThemeToggle />
          {isSignedIn ? (
            <UserButton />
          ) : (
            <SignInButton mode="modal">
              <Button size="sm" variant="outline">
                Sign in
              </Button>
            </SignInButton>
          )}
        </div>
      </div>
    </aside>
  );
}

function SidebarLink({
  href,
  label,
  collapsed,
  active,
  children,
}: {
  href: string;
  label: string;
  collapsed: boolean;
  active: boolean;
  children: React.ReactNode;
}) {
  const link = (
    <Link
      href={href}
      className={cn(
        "flex h-9 items-center gap-3 rounded-md px-2.5 text-white/80 transition-colors hover:bg-white/5 hover:text-white",
        active && "bg-white/10 text-white",
        collapsed && "justify-center px-0",
      )}
    >
      {children}
      {!collapsed && <span className="truncate">{label}</span>}
    </Link>
  );

  if (!collapsed) return link;
  return (
    <Tooltip>
      <TooltipTrigger asChild>{link}</TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  );
}
