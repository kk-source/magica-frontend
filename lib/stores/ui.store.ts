import { create } from "zustand";

type UiState = {
  sidebarCollapsed: boolean;
  composerValue: string;
  toggleSidebar: () => void;
  setComposerValue: (value: string) => void;
};

export const useUiStore = create<UiState>((set) => ({
  sidebarCollapsed: false,
  composerValue: "",
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setComposerValue: (composerValue) => set({ composerValue }),
}));
