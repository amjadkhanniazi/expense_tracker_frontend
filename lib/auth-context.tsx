"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import AuthService, {
  type LoginData,
  type RegisterData,
  type UpdatePasswordData,
  type UpdateUserData,
} from "./auth-service"

type User = {
  _id: string
  username: string
  email: string
  avatar?: string
}

type AuthContextType = {
  user: User | null
  login: (data: LoginData) => Promise<void>
  signup: (data: RegisterData) => Promise<void>
  logout: () => Promise<void>
  updateProfile: (data: UpdateUserData) => Promise<void>
  updatePassword: (data: UpdatePasswordData) => Promise<void>
  loading: boolean
  error: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check if user is logged in from token
    const token = localStorage.getItem("token")
    if (token) {
      fetchCurrentUser()
    } else {
      setLoading(false)
    }
  }, [])

  const fetchCurrentUser = async () => {
    try {
      const userData = await AuthService.getCurrentUser()
      setUser(userData.data)
    } catch (error) {
      console.error("Failed to fetch current user:", error)
      localStorage.removeItem("token")
    } finally {
      setLoading(false)
    }
  }

  const login = async (data: LoginData) => {
    setLoading(true)
    setError(null)
    try {
      const response = await AuthService.login(data)
      localStorage.setItem("token", response.token)
      await fetchCurrentUser()
    } catch (error: any) {
      console.error("Login failed:", error)
      setError(error.response?.data?.error || "Login failed. Please check your credentials.")
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signup = async (data: RegisterData) => {
    setLoading(true)
    setError(null)
    try {
      const response = await AuthService.register(data)
      localStorage.setItem("token", response.token)
      await fetchCurrentUser()
    } catch (error: any) {
      console.error("Signup failed:", error)
      setError(error.response?.data?.error || "Signup failed. Please try again.")
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    setLoading(true)
    try {
      await AuthService.logout()
    } catch (error) {
      console.error("Logout failed:", error)
    } finally {
      localStorage.removeItem("token")
      setUser(null)
      setLoading(false)
    }
  }

  const updateProfile = async (data: UpdateUserData) => {
    setLoading(true)
    setError(null)
    try {
      const response = await AuthService.updateUserDetails(data)
      setUser(response.data)
    } catch (error: any) {
      console.error("Profile update failed:", error)
      setError(error.response?.data?.error || "Profile update failed. Please try again.")
      throw error
    } finally {
      setLoading(false)
    }
  }

  const updatePassword = async (data: UpdatePasswordData) => {
    setLoading(true)
    setError(null)
    try {
      await AuthService.updatePassword(data)
    } catch (error: any) {
      console.error("Password update failed:", error)
      setError(error.response?.data?.error || "Password update failed. Please try again.")
      throw error
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
        updateProfile,
        updatePassword,
        loading,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
