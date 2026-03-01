import { create } from "zustand";

interface AppState {
  activeGroupId: string | null;
  activeMatchId: string | null;
  setActiveGroup: (id: string | null) => void;
  setActiveMatch: (id: string | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  activeGroupId: null,
  activeMatchId: null,
  setActiveGroup: (id) => set({ activeGroupId: id, activeMatchId: null }),
  setActiveMatch: (id) => set({ activeMatchId: id }),
}));
