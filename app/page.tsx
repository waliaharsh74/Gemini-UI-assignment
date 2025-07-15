"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/stores/auth-store"
import AuthPage from "@/components/auth/auth-page"
import Dashboard from "@/components/dashboard/dashboard"

export default function Home() {
  const router = useRouter()
  const { isAuthenticated, initializeAuth } = useAuthStore()

  useEffect(() => {
    initializeAuth()
  }, [initializeAuth])

  if (!isAuthenticated) {
    return <AuthPage />
  }

  return <Dashboard />
}
