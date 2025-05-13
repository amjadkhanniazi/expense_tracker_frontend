import apiClient from "./api-client"

export interface Transaction {
  _id: string
  amount: number
  type: "income" | "expense"
  category: string
  description: string
  date: string
  user: string
  createdAt: string
  updatedAt: string
}

export interface CreateTransactionData {
  amount: number
  type: "income" | "expense"
  category: string
  description: string
  date?: string
}

export interface UpdateTransactionData {
  amount?: number
  type?: "income" | "expense"
  category?: string
  description?: string
  date?: string
}

const TransactionService = {
  getAllTransactions: async () => {
    const response = await apiClient.get("/api/transactions")
    return response.data
  },

  getTransaction: async (id: string) => {
    const response = await apiClient.get(`/api/transactions/${id}`)
    return response.data
  },

  createTransaction: async (data: CreateTransactionData) => {
    const response = await apiClient.post("/api/transactions", data)
    return response.data
  },

  updateTransaction: async (id: string, data: UpdateTransactionData) => {
    const response = await apiClient.put(`/api/transactions/${id}`, data)
    return response.data
  },

  deleteTransaction: async (id: string) => {
    const response = await apiClient.delete(`/api/transactions/${id}`)
    return response.data
  },
}

export default TransactionService
