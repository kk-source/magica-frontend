import { Suspense } from "react";
import { ChatView } from "@/components/chat/ChatView";

export default async function ChatPage({ params }: { params: Promise<{ chatId: string }> }) {
  const { chatId } = await params;
  return (
    <Suspense>
      <ChatView chatId={chatId} />
    </Suspense>
  );
}
