import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

interface AppState {
  // Theme
  theme: "light" | "dark" | "system";
  setTheme: (theme: "light" | "dark" | "system") => void;

  // Sidebar
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set) => ({
        // Theme
        theme: "system",
        setTheme: (theme) => set({ theme }),

        // Sidebar
        isSidebarOpen: true,
        toggleSidebar: () =>
          set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
        setSidebarOpen: (open) => set({ isSidebarOpen: open }),
      }),
      {
        name: "cms-app-store",
        partialize: (state) => ({ theme: state.theme }),
      }
    ),
    { name: "AppStore" }
  )
);
