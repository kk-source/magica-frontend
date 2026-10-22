import { create } from "zustand";
import type { Message } from "@/lib/api/schemas";

type ChatState = {
  activeChatId: string | null;
  messages: Message[];
  activeRunId: string | null;
  isStreaming: boolean;
  streamingText: string;
  setActiveChat: (chatId: string | null) => void;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  startRun: (runId: string) => void;
  setStreamingText: (text: string) => void;
  endRun: () => void;
};

export const useChatStore = create<ChatState>((set) => ({
  activeChatId: null,
  messages: [],
  activeRunId: null,
  isStreaming: false,
  streamingText: "",
  setActiveChat: (chatId) =>
    set({ activeChatId: chatId, messages: [], activeRunId: null, isStreaming: false, streamingText: "" }),
  setMessages: (messages) => set({ messages }),
  addMessage: (message) => set((s) => ({ messages: [...s.messages, message] })),
  startRun: (runId) => set({ activeRunId: runId, isStreaming: true, streamingText: "" }),
  setStreamingText: (streamingText) => set({ streamingText }),
  endRun: () => set({ activeRunId: null, isStreaming: false, streamingText: "" }),
}));
