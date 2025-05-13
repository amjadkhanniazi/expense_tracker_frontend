import apiClient from "./api-client"

export interface Budget {
  _id: string
  category: string
  amount: number
  month: number
  year: number
  user: string
  createdAt: string
  updatedAt: string
}

export interface CreateBudgetData {
  category: string
  amount: number
  month: number
  year: number
}

export interface UpdateBudgetData {
  category?: string
  amount?: number
  month?: number
  year?: number
}

export interface BudgetSummary {
  budget: number
  spent: number
  remaining: number
  categories: {
    [key: string]: {
      budget: number
      spent: number
      remaining: number
    }
  }
}

const BudgetService = {
  getAllBudgets: async () => {
    const response = await apiClient.get("/api/budgets")
    return response.data
  },

  getBudgetsByMonth: async (month: number, year: number) => {
    const response = await apiClient.get(`/api/budgets?month=${month}&year=${year}`)
    return response.data
  },

  getBudget: async (id: string) => {
    const response = await apiClient.get(`/api/budgets/${id}`)
    return response.data
  },

  createBudget: async (data: CreateBudgetData) => {
    const response = await apiClient.post("/api/budgets", data)
    return response.data
  },

  updateBudget: async (id: string, data: UpdateBudgetData) => {
    const response = await apiClient.put(`/api/budgets/${id}`, data)
    return response.data
  },

  deleteBudget: async (id: string) => {
    const response = await apiClient.delete(`/api/budgets/${id}`)
    return response.data
  },

  getBudgetSummary: async (month: number, year: number) => {
    const response = await apiClient.get(`/api/budgets/summary/${month}`)
    return response.data
  },
}

export default BudgetService
