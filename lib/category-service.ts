import apiClient from "./api-client"

export interface Category {
  _id: string
  name: string
  user: string
  createdAt: string
  updatedAt: string
  color?: string // Added for UI purposes
}

export interface CreateCategoryData {
  name: string
  color?: string // Added for UI purposes
}

export interface UpdateCategoryData {
  name?: string
  color?: string // Added for UI purposes
}

const CategoryService = {
  getAllCategories: async () => {
    const response = await apiClient.get("/api/categories")
    return response.data
  },

  getCategory: async (id: string) => {
    const response = await apiClient.get(`/api/categories/${id}`)
    return response.data
  },

  createCategory: async (data: CreateCategoryData) => {
    const response = await apiClient.post("/api/categories", data)
    return response.data
  },

  updateCategory: async (id: string, data: UpdateCategoryData) => {
    const response = await apiClient.put(`/api/categories/${id}`, data)
    return response.data
  },

  deleteCategory: async (id: string) => {
    const response = await apiClient.delete(`/api/categories/${id}`)
    return response.data
  },
}

export default CategoryService
