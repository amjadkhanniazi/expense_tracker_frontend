"use client"

import type React from "react"

import { AuthProvider } from "@/lib/auth-context"
import { ExpenseProvider } from "@/lib/expense-context"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ExpenseProvider>{children}</ExpenseProvider>
    </AuthProvider>
  )
}
