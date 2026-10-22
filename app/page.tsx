"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SignInButton, useAuth, useClerk } from "@clerk/nextjs";
import { useMutation } from "@tanstack/react-query";
import { Sparkles } from "lucide-react";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { Composer } from "@/components/chat/Composer";
import { TemplateGallery } from "@/components/home/TemplateGallery";
import { Button } from "@/components/ui/button";
import { useCreateChat } from "@/lib/api/chats";
import type { AttachmentInput } from "@/lib/api/messages";
import { useChatStore } from "@/lib/stores/chat.store";

type Turn = { content: string; attachments: AttachmentInput[] };

function greeting(hour: number) {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function HomePage() {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const { openSignIn } = useClerk();
  const [hello, setHello] = useState("");

  useEffect(() => setHello(greeting(new Date().getHours())), []);

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
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center px-4 pt-[12vh] pb-12">
        <Sparkles className="mb-6 size-14 text-white" strokeWidth={1.25} />
        <p className="h-5 text-sm text-muted-foreground">{hello}</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">Your AI worker</h1>
        <p className="mt-2 text-muted-foreground">Work at the speed of thought</p>
        {isSignedIn === false && (
          <SignInButton mode="modal">
            <Button variant="outline" className="mt-6 rounded-full">
              Sign in to get started
            </Button>
          </SignInButton>
        )}
        <Composer className="mt-8" onSubmit={submit} isStreaming={start.isPending} />
        {start.error && <p className="mt-2 text-sm text-destructive">{start.error.message}</p>}
        <div className="mt-10 w-full">
          <TemplateGallery />
        </div>
      </div>
    </div>
  );
}
