"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SignInButton, useAuth, useClerk } from "@clerk/nextjs";
import { useMutation } from "@tanstack/react-query";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { Composer } from "@/components/chat/Composer";
import { Mascot } from "@/components/home/Mascot";
import { TemplateGallery } from "@/components/home/TemplateGallery";
import { Button } from "@/components/ui/button";
import { useCreateChat } from "@/lib/api/chats";
import type { AttachmentInput } from "@/lib/api/messages";
import { useChatStore } from "@/lib/stores/chat.store";

type Turn = { content: string; attachments: AttachmentInput[] };

// Galaxy shows the local time over the heading, e.g. "7:39 PM" with a raised meridiem.
function clock(now: Date) {
  const [time, meridiem = ""] = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }).split(" ");
  return { time, meridiem };
}

export default function HomePage() {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const { openSignIn } = useClerk();
  const [now, setNow] = useState<{ time: string; meridiem: string } | null>(null);

  // Client-only to avoid a hydration mismatch; ticks so the clock stays current.
  useEffect(() => {
    const tick = () => setNow(clock(new Date()));
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);

  const createChat = useCreateChat();
  const setOutbox = useChatStore((s) => s.setOutbox);

  // Create the chat and open it; the chat page sends the first turn so it renders immediately.
  const start = useMutation({
    mutationFn: ({ content }: Turn) => createChat.mutateAsync({ title: content.slice(0, 60) }),
    onSuccess: (chat, { content, attachments }) => {
      setOutbox({ chatId: chat.id, content, attachments });
      router.push(`/chat/${chat.id}`);
    },
  });

  const submit = (content: string, attachments: AttachmentInput[]) => {
    if (!isSignedIn) return openSignIn();
    start.mutate({ content, attachments });
  };

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <ChatHeader />
      <div className="mx-auto flex w-full max-w-[900px] flex-1 flex-col items-center px-4 pt-[14vh] pb-12">
        <Mascot className="mb-5 size-9" />
        <p className="h-5 text-xs text-muted-foreground">
          {now && (
            <>
              {now.time} <sup className="text-[9px]">{now.meridiem}</sup>
            </>
          )}
        </p>
        <h1 className="mt-1 text-2xl font-bold">Your AI worker</h1>
        <p className="mt-2 text-sm font-medium text-muted-foreground">Work at the speed of thought.</p>
        {isSignedIn === false && (
          <SignInButton mode="modal">
            <Button variant="secondary" className="mt-6 rounded-full">
              Sign in to get started
            </Button>
          </SignInButton>
        )}
        <Composer className="mt-12" onSubmit={submit} isStreaming={start.isPending} />
        {start.error && <p className="mt-2 text-sm text-destructive">{start.error.message}</p>}
        <div className="mt-10 w-full">
          <TemplateGallery />
        </div>
      </div>
    </div>
  );
}
