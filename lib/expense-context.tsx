"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import CategoryService, { type Category } from "./category-service"
import TransactionService, { type Transaction } from "./transaction-service"
import BudgetService, { type Budget, type BudgetSummary } from "./budget-service"
import { useAuth } from "./auth-context"

export type ExpenseContextType = {
  // Categories
  categories: Category[]
  fetchCategories: () => Promise<void>
  addCategory: (name: string, color?: string) => Promise<void>
  updateCategory: (id: string, name: string, color?: string) => Promise<void>
  deleteCategory: (id: string) => Promise<void>

  // Transactions
  transactions: Transaction[]
  fetchTransactions: () => Promise<void>
  addTransaction: (data: {
    amount: number
    type: "income" | "expense"
    category: string
    description: string
    date?: string
  }) => Promise<void>
  updateTransaction: (
    id: string,
    data: {
      amount?: number
      type?: "income" | "expense"
      category?: string
      description?: string
      date?: string
    },
  ) => Promise<void>
  deleteTransaction: (id: string) => Promise<void>

  // Budgets
  budgets: Budget[]
  budgetSummary: BudgetSummary | null
  fetchBudgets: (month?: number, year?: number) => Promise<void>
  fetchBudgetSummary: (month: number, year: number) => Promise<void>
  addBudget: (data: {
    category: string
    amount: number
    month: number
    year: number
  }) => Promise<void>
  updateBudget: (
    id: string,
    data: {
      category?: string
      amount?: number
      month?: number
      year?: number
    },
  ) => Promise<void>
  deleteBudget: (id: string) => Promise<void>

  // Loading states
  loading: {
    categories: boolean
    transactions: boolean
    budgets: boolean
    budgetSummary: boolean
  }
  error: string | null
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined)

export function ExpenseProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()

  const [categories, setCategories] = useState<Category[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [budgetSummary, setBudgetSummary] = useState<BudgetSummary | null>(null)

  const [loading, setLoading] = useState({
    categories: false,
    transactions: false,
    budgets: false,
    budgetSummary: false,
  })
  const [error, setError] = useState<string | null>(null)

  // Fetch initial data when user is authenticated
  useEffect(() => {
    if (user) {
      fetchCategories()
      fetchTransactions()

      // Get current month and year for budgets
      const now = new Date()
      fetchBudgets(now.getMonth() + 1, now.getFullYear())
      fetchBudgetSummary(now.getMonth() + 1, now.getFullYear())
    }
  }, [user])

  // Categories
  const fetchCategories = async () => {
    if (!user) return

    setLoading((prev) => ({ ...prev, categories: true }))
    setError(null)

    try {
      const response = await CategoryService.getAllCategories()
      setCategories(response.data)
    } catch (error: any) {
      console.error("Failed to fetch categories:", error)
      setError(error.response?.data?.error || "Failed to fetch categories")
    } finally {
      setLoading((prev) => ({ ...prev, categories: false }))
    }
  }

  const addCategory = async (name: string, color?: string) => {
    if (!user) return

    setLoading((prev) => ({ ...prev, categories: true }))
    setError(null)

    try {
      const response = await CategoryService.createCategory({ name, color })
      setCategories((prev) => [...prev, response.data])
    } catch (error: any) {
      console.error("Failed to add category:", error)
      setError(error.response?.data?.error || "Failed to add category")
      throw error
    } finally {
      setLoading((prev) => ({ ...prev, categories: false }))
    }
  }

  const updateCategory = async (id: string, name: string, color?: string) => {
    if (!user) return

    setLoading((prev) => ({ ...prev, categories: true }))
    setError(null)

    try {
      const response = await CategoryService.updateCategory(id, { name, color })
      setCategories((prev) => prev.map((category) => (category._id === id ? response.data : category)))
    } catch (error: any) {
      console.error("Failed to update category:", error)
      setError(error.response?.data?.error || "Failed to update category")
      throw error
    } finally {
      setLoading((prev) => ({ ...prev, categories: false }))
    }
  }

  const deleteCategory = async (id: string) => {
    if (!user) return

    setLoading((prev) => ({ ...prev, categories: true }))
    setError(null)

    try {
      await CategoryService.deleteCategory(id)
      setCategories((prev) => prev.filter((category) => category._id !== id))
    } catch (error: any) {
      console.error("Failed to delete category:", error)
      setError(error.response?.data?.error || "Failed to delete category")
      throw error
    } finally {
      setLoading((prev) => ({ ...prev, categories: false }))
    }
  }

  // Transactions
  const fetchTransactions = async () => {
    if (!user) return

    setLoading((prev) => ({ ...prev, transactions: true }))
    setError(null)

    try {
      const response = await TransactionService.getAllTransactions()
      setTransactions(response.data)
    } catch (error: any) {
      console.error("Failed to fetch transactions:", error)
      setError(error.response?.data?.error || "Failed to fetch transactions")
    } finally {
      setLoading((prev) => ({ ...prev, transactions: false }))
    }
  }

  const addTransaction = async (data: {
    amount: number
    type: "income" | "expense"
    category: string
    description: string
    date?: string
  }) => {
    if (!user) return

    setLoading((prev) => ({ ...prev, transactions: true }))
    setError(null)

    try {
      const response = await TransactionService.createTransaction(data)
      setTransactions((prev) => [...prev, response.data])

      // Refresh budget summary after adding a transaction
      const now = new Date()
      fetchBudgetSummary(now.getMonth() + 1, now.getFullYear())
    } catch (error: any) {
      console.error("Failed to add transaction:", error)
      setError(error.response?.data?.error || "Failed to add transaction")
      throw error
    } finally {
      setLoading((prev) => ({ ...prev, transactions: false }))
    }
  }

  const updateTransaction = async (
    id: string,
    data: {
      amount?: number
      type?: "income" | "expense"
      category?: string
      description?: string
      date?: string
    },
  ) => {
    if (!user) return

    setLoading((prev) => ({ ...prev, transactions: true }))
    setError(null)

    try {
      const response = await TransactionService.updateTransaction(id, data)
      setTransactions((prev) => prev.map((transaction) => (transaction._id === id ? response.data : transaction)))

      // Refresh budget summary after updating a transaction
      const now = new Date()
      fetchBudgetSummary(now.getMonth() + 1, now.getFullYear())
    } catch (error: any) {
      console.error("Failed to update transaction:", error)
      setError(error.response?.data?.error || "Failed to update transaction")
      throw error
    } finally {
      setLoading((prev) => ({ ...prev, transactions: false }))
    }
  }

  const deleteTransaction = async (id: string) => {
    if (!user) return

    setLoading((prev) => ({ ...prev, transactions: true }))
    setError(null)

    try {
      await TransactionService.deleteTransaction(id)
      setTransactions((prev) => prev.filter((transaction) => transaction._id !== id))

      // Refresh budget summary after deleting a transaction
      const now = new Date()
      fetchBudgetSummary(now.getMonth() + 1, now.getFullYear())
    } catch (error: any) {
      console.error("Failed to delete transaction:", error)
      setError(error.response?.data?.error || "Failed to delete transaction")
      throw error
    } finally {
      setLoading((prev) => ({ ...prev, transactions: false }))
    }
  }

  // Budgets
  const fetchBudgets = async (month?: number, year?: number) => {
    if (!user) return

    setLoading((prev) => ({ ...prev, budgets: true }))
    setError(null)

    try {
      let response
      if (month && year) {
        response = await BudgetService.getBudgetsByMonth(month, year)
      } else {
        response = await BudgetService.getAllBudgets()
      }
      setBudgets(response.data)
    } catch (error: any) {
      console.error("Failed to fetch budgets:", error)
      setError(error.response?.data?.error || "Failed to fetch budgets")
    } finally {
      setLoading((prev) => ({ ...prev, budgets: false }))
    }
  }

  const fetchBudgetSummary = async (month: number, year: number) => {
    if (!user) return

    setLoading((prev) => ({ ...prev, budgetSummary: true }))
    setError(null)

    try {
      const response = await BudgetService.getBudgetSummary(month, year)
      setBudgetSummary(response.data)
    } catch (error: any) {
      console.error("Failed to fetch budget summary:", error)
      setError(error.response?.data?.error || "Failed to fetch budget summary")
    } finally {
      setLoading((prev) => ({ ...prev, budgetSummary: false }))
    }
  }

  const addBudget = async (data: {
    category: string
    amount: number
    month: number
    year: number
  }) => {
    if (!user) return

    setLoading((prev) => ({ ...prev, budgets: true }))
    setError(null)

    try {
      const response = await BudgetService.createBudget(data)
      setBudgets((prev) => [...prev, response.data])

      // Refresh budget summary after adding a budget
      fetchBudgetSummary(data.month, data.year)
    } catch (error: any) {
      console.error("Failed to add budget:", error)
      setError(error.response?.data?.error || "Failed to add budget")
      throw error
    } finally {
      setLoading((prev) => ({ ...prev, budgets: false }))
    }
  }

  const updateBudget = async (
    id: string,
    data: {
      category?: string
      amount?: number
      month?: number
      year?: number
    },
  ) => {
    if (!user) return

    setLoading((prev) => ({ ...prev, budgets: true }))
    setError(null)

    try {
      const response = await BudgetService.updateBudget(id, data)
      setBudgets((prev) => prev.map((budget) => (budget._id === id ? response.data : budget)))

      // Refresh budget summary after updating a budget
      const now = new Date()
      fetchBudgetSummary(now.getMonth() + 1, now.getFullYear())
    } catch (error: any) {
      console.error("Failed to update budget:", error)
      setError(error.response?.data?.error || "Failed to update budget")
      throw error
    } finally {
      setLoading((prev) => ({ ...prev, budgets: false }))
    }
  }

  const deleteBudget = async (id: string) => {
    if (!user) return

    setLoading((prev) => ({ ...prev, budgets: true }))
    setError(null)

    try {
      await BudgetService.deleteBudget(id)
      setBudgets((prev) => prev.filter((budget) => budget._id !== id))

      // Refresh budget summary after deleting a budget
      const now = new Date()
      fetchBudgetSummary(now.getMonth() + 1, now.getFullYear())
    } catch (error: any) {
      console.error("Failed to delete budget:", error)
      setError(error.response?.data?.error || "Failed to delete budget")
      throw error
    } finally {
      setLoading((prev) => ({ ...prev, budgets: false }))
    }
  }

  return (
    <ExpenseContext.Provider
      value={{
        // Categories
        categories,
        fetchCategories,
        addCategory,
        updateCategory,
        deleteCategory,

        // Transactions
        transactions,
        fetchTransactions,
        addTransaction,
        updateTransaction,
        deleteTransaction,

        // Budgets
        budgets,
        budgetSummary,
        fetchBudgets,
        fetchBudgetSummary,
        addBudget,
        updateBudget,
        deleteBudget,

        // Loading states
        loading,
        error,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  )
}

export function useExpense() {
  const context = useContext(ExpenseContext)
  if (context === undefined) {
    throw new Error("useExpense must be used within an ExpenseProvider")
  }
  return context
}
