import { create } from 'zustand'

interface UIState {
  sidebarOpen: boolean
  contextSwitcherOpen: boolean
  setSidebarOpen: (open: boolean) => void
  setContextSwitcherOpen: (open: boolean) => void
  toggleSidebar: () => void
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: false,
  contextSwitcherOpen: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setContextSwitcherOpen: (open) => set({ contextSwitcherOpen: open }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}))
