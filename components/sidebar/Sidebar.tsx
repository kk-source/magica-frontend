"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { SignInButton, UserButton, useAuth, useUser } from "@clerk/nextjs";
import {
  BookOpen,
  CirclePlus,
  FolderOpen,
  LifeBuoy,
  type LucideIcon,
  MessageSquare,
  PanelLeft,
  Plus,
  Puzzle,
  Search,
  Settings,
  Sparkles,
  SquareCode,
  Trash2,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useChats, useCreateChat, useDeleteChat } from "@/lib/api/chats";
import { useMe } from "@/lib/api/me";
import { useUiStore } from "@/lib/stores/ui.store";
import { cn, formatCredits } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";

// Only "New task" is built; the rest mirror Galaxy's nav but are shown disabled.
const NAV_ITEMS: { label: string; href: string; icon: LucideIcon; soon?: boolean }[] = [
  { label: "New task", href: "/", icon: CirclePlus },
  { label: "Tasks", href: "/tasks", icon: MessageSquare, soon: true },
  { label: "Projects", href: "/projects", icon: FolderOpen, soon: true },
  { label: "Library", href: "/library", icon: BookOpen, soon: true },
  { label: "Tools", href: "/tools", icon: Puzzle, soon: true },
  { label: "API / MCP", href: "/api-mcp", icon: SquareCode, soon: true },
  { label: "Help & Support", href: "/help", icon: LifeBuoy, soon: true },
];

export function Sidebar() {
  const collapsed = useUiStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const credits = useMe().data?.credits;
  const pathname = usePathname();
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const { data: chats = [], isLoading } = useChats();
  const createChat = useCreateChat();

  const deleteChat = useDeleteChat();
  const removeChat = (chatId: string) =>
    deleteChat.mutate(chatId, {
      // Leave a chat that no longer exists.
      onSuccess: () => pathname === `/chat/${chatId}` && router.push("/"),
    });

  const newChat = () =>
    createChat.mutate({}, { onSuccess: (chat) => router.push(`/chat/${chat.id}`) });

  return (
    <aside
      className={cn(
        "flex h-full shrink-0 flex-col border-r border-border bg-sidebar text-sm transition-[width] duration-200",
        collapsed ? "w-[60px]" : "w-[260px]",
      )}
    >
      <div className="flex h-14 items-center gap-1 px-3">
        {!collapsed && (
          <Link href="/" className="flex-1 pl-2 text-xl font-semibold tracking-tight">
            Magica
          </Link>
        )}
        {!collapsed && (
          <Button variant="ghost" size="icon" className="size-8 text-muted-foreground" aria-label="Search" title="Coming soon">
            <Search />
          </Button>
        )}
        <Button variant="ghost" size="icon" className="size-8 text-muted-foreground" onClick={toggleSidebar} aria-label="Toggle sidebar">
          <PanelLeft />
        </Button>
      </div>

      <nav className="flex flex-col gap-0.5 px-2">
        {NAV_ITEMS.map(({ label, href, icon: Icon, soon }) =>
          soon ? (
            <span
              key={label}
              title="Coming soon"
              className={cn(
                "flex h-[34px] cursor-default items-center gap-2.5 rounded-lg px-2.5 text-foreground/75",
                collapsed && "justify-center px-0",
              )}
            >
              <Icon className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.75} />
              {!collapsed && <span className="truncate">{label}</span>}
            </span>
          ) : (
            <SidebarLink key={label} href={href} label={label} collapsed={collapsed} active={pathname === href}>
              <Icon className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.75} />
            </SidebarLink>
          ),
        )}
      </nav>

      {!collapsed && (
        <>
          <div className="mt-5 flex h-8 items-center justify-between pr-2 pl-4 text-xs text-muted-foreground">
            Recent tasks
            {isSignedIn && (
              <Button
                variant="ghost"
                size="icon"
                className="size-6"
                onClick={newChat}
                disabled={createChat.isPending}
                aria-label="New chat"
              >
                <Plus className="size-3.5" />
              </Button>
            )}
          </div>
          <ScrollArea className="min-h-0 flex-1 px-2">
            {chats.length === 0 ? (
              <p className="px-2 py-1.5 text-xs text-muted-foreground">
                {!isSignedIn ? "Sign in to see your tasks" : isLoading ? "Loading…" : "No tasks yet"}
              </p>
            ) : (
              chats.map((chat) => (
                <div key={chat.id} className="group relative">
                  <SidebarLink
                    href={`/chat/${chat.id}`}
                    label={chat.title}
                    collapsed={false}
                    active={pathname === `/chat/${chat.id}`}
                  />
                  <button
                    onClick={() => removeChat(chat.id)}
                    disabled={deleteChat.isPending}
                    aria-label={`Delete ${chat.title}`}
                    className="absolute top-1/2 right-1.5 hidden -translate-y-1/2 rounded p-1 text-muted-foreground hover:bg-white/10 hover:text-foreground group-hover:block"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              ))
            )}
          </ScrollArea>
        </>
      )}
      {collapsed && <div className="flex-1" />}

      {collapsed ? (
        <div className="flex flex-col items-center gap-1 border-t border-border p-2">
          <ThemeToggle compact />
          {isSignedIn ? (
            <UserButton />
          ) : (
            <SignInButton mode="modal">
              <Button size="icon" variant="ghost" aria-label="Sign in">
                <Sparkles />
              </Button>
            </SignInButton>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-2 border-t border-border p-2 pt-3">
          <div className="flex items-center justify-between px-2 text-[13px]">
            <span className="font-medium">Available Credits</span>
            <span className="tabular-nums text-muted-foreground">{credits === undefined ? "—" : formatCredits(credits)}</span>
          </div>
          <button
            title="Coming soon"
            className="flex h-8 items-center justify-center gap-2 rounded-[10px] border border-white/10 bg-gradient-to-b from-[#3a3a3a] to-[#2b2b2b] text-xs font-medium text-white shadow-sm"
          >
            <Wallet className="size-3.5" />
            Add Credits
          </button>
          <div className="grid grid-cols-2 gap-2">
            <button
              title="Coming soon"
              className="flex h-7 items-center justify-center gap-1.5 rounded-lg border border-border text-[13px] hover:bg-accent"
            >
              <Settings className="size-3.5" />
              Settings
            </button>
            <button
              title="Coming soon"
              className="flex h-7 items-center justify-center gap-1.5 rounded-lg border border-border text-[13px] hover:bg-accent"
            >
              <Sparkles className="size-3.5" />
              Updates
            </button>
          </div>
          <ThemeToggle />
          {isSignedIn ? (
            <div className="flex h-9 items-center gap-2 rounded-lg border border-border px-2">
              <UserButton />
              <span className="min-w-0 flex-1 truncate text-center text-[13px] font-medium">
                {user?.fullName ?? user?.primaryEmailAddress?.emailAddress}
              </span>
            </div>
          ) : (
            <SignInButton mode="modal">
              <Button size="sm" variant="secondary" className="w-full rounded-lg">
                Sign in
              </Button>
            </SignInButton>
          )}
        </div>
      )}
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
  children?: React.ReactNode;
}) {
  const link = (
    <Link
      href={href}
      className={cn(
        "flex h-[34px] items-center gap-2.5 rounded-lg px-2.5 text-foreground transition-colors hover:bg-accent",
        active && "bg-accent",
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
