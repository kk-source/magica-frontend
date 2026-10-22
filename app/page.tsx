"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SignInButton, useAuth, useClerk } from "@clerk/nextjs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Sparkles } from "lucide-react";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { Composer } from "@/components/chat/Composer";
import { TemplateGallery } from "@/components/home/TemplateGallery";
import { Button } from "@/components/ui/button";
import { chatKeys, deleteChat, useCreateChat } from "@/lib/api/chats";
import { sendMessage } from "@/lib/api/messages";

function greeting(hour: number) {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function HomePage() {
  const router = useRouter();
  const { isSignedIn, getToken } = useAuth();
  const { openSignIn } = useClerk();
  const [hello, setHello] = useState("");

  useEffect(() => setHello(greeting(new Date().getHours())), []);

  const queryClient = useQueryClient();
  const createChat = useCreateChat();

  // Create the chat, send the first turn, then open the chat with the run to poll.
  const start = useMutation({
    mutationFn: async (content: string) => {
      const chat = await createChat.mutateAsync({ title: content.slice(0, 60) });
      try {
        const { runId } = await sendMessage(await getToken(), chat.id, { content });
        return { chatId: chat.id, runId };
      } catch (err) {
        // Don't leave an empty chat in the sidebar when the first turn fails.
        await deleteChat(await getToken(), chat.id).catch(() => {});
        void queryClient.invalidateQueries({ queryKey: chatKeys.all });
        throw err;
      }
    },
    onSuccess: ({ chatId, runId }) => router.push(`/chat/${chatId}?run=${runId}`),
  });

  const submit = (text: string) => {
    if (!isSignedIn) return openSignIn();
    start.mutate(text);
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
