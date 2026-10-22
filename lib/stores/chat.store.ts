import { create } from "zustand";
import type { Message, Run } from "@/lib/api/schemas";

type ChatState = {
  activeChatId: string | null;
  /** User turns sent this session but not yet in the fetched history. */
  pendingMessages: Message[];
  activeRunId: string | null;
  /** Latest polled snapshot of the active run. */
  liveRun: Run | null;
  setActiveChat: (chatId: string | null) => void;
  addPendingMessage: (message: Message) => void;
  clearPendingMessages: () => void;
  startRun: (runId: string) => void;
  setLiveRun: (run: Run) => void;
  endRun: () => void;
};

export const useChatStore = create<ChatState>((set) => ({
  activeChatId: null,
  pendingMessages: [],
  activeRunId: null,
  liveRun: null,
  setActiveChat: (chatId) => set({ activeChatId: chatId, pendingMessages: [], activeRunId: null, liveRun: null }),
  addPendingMessage: (message) => set((s) => ({ pendingMessages: [...s.pendingMessages, message] })),
  clearPendingMessages: () => set({ pendingMessages: [] }),
  startRun: (runId) => set({ activeRunId: runId, liveRun: null }),
  setLiveRun: (liveRun) => set({ liveRun }),
  endRun: () => set({ activeRunId: null, liveRun: null }),
}));
