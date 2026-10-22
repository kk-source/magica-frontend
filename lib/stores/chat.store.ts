import { create } from "zustand";
import type { AttachmentInput } from "@/lib/api/messages";
import type { Message, Run } from "@/lib/api/schemas";

type Outbox = { chatId: string; content: string; attachments: AttachmentInput[] };

type ChatState = {
  activeChatId: string | null;
  /** User turns sent this session but not yet in the fetched history. */
  pendingMessages: Message[];
  activeRunId: string | null;
  /** Latest polled snapshot of the active run. */
  liveRun: Run | null;
  setActiveChat: (chatId: string | null) => void;
  addPendingMessage: (message: Message) => void;
  replacePendingMessage: (id: string, message: Message) => void;
  removePendingMessage: (id: string) => void;
  /** First message typed on the home page, sent by the chat page once it opens. */
  outbox: Outbox | null;
  setOutbox: (outbox: Outbox | null) => void;
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
  replacePendingMessage: (id, message) =>
    set((s) => ({ pendingMessages: s.pendingMessages.map((m) => (m.id === id ? message : m)) })),
  removePendingMessage: (id) => set((s) => ({ pendingMessages: s.pendingMessages.filter((m) => m.id !== id) })),
  outbox: null,
  setOutbox: (outbox) => set({ outbox }),
  clearPendingMessages: () => set({ pendingMessages: [] }),
  startRun: (runId) => set({ activeRunId: runId, liveRun: null }),
  setLiveRun: (liveRun) => set({ liveRun }),
  endRun: () => set({ activeRunId: null, liveRun: null }),
}));
