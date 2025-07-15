import { create } from "zustand"
import { persist } from "zustand/middleware"

interface User {
  id: string
  phone: string
  countryCode: string
  name: string
}

interface AuthState {
  isAuthenticated: boolean
  user: User | null
  isLoading: boolean
  login: (user: User) => void
  logout: () => void
  initializeAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      isLoading: false,
      login: (user: User) => {
        set({ isAuthenticated: true, user })
      },
      logout: () => {
        set({ isAuthenticated: false, user: null })
        localStorage.removeItem("auth-storage")
      },
      initializeAuth: () => {
        const stored = localStorage.getItem("auth-storage")
        if (stored) {
          try {
            const parsed = JSON.parse(stored)
            if (parsed.state?.isAuthenticated && parsed.state?.user) {
              set({ isAuthenticated: true, user: parsed.state.user })
            }
          } catch (error) {
            console.error("Failed to parse stored auth:", error)
          }
        }
      },
    }),
    {
      name: "auth-storage",
    },
  ),
)
