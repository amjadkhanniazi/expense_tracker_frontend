import apiClient from "./api-client"

export interface RegisterData {
  username: string
  email: string
  password: string
}

export interface LoginData {
  email: string
  password: string
}

export interface UpdateUserData {
  username?: string
  email?: string
}

export interface UpdatePasswordData {
  currentPassword: string
  newPassword: string
}

export interface ForgotPasswordData {
  email: string
}

export interface ResetPasswordData {
  password: string
}

const AuthService = {
  register: async (data: RegisterData) => {
    const response = await apiClient.post("/api/auth/register", data)
    return response.data
  },

  login: async (data: LoginData) => {
    const response = await apiClient.post("/api/auth/login", data)
    return response.data
  },

  logout: async () => {
    const response = await apiClient.get("/api/auth/logout")
    return response.data
  },

  getCurrentUser: async () => {
    const response = await apiClient.get("/api/auth/me")
    return response.data
  },

  updateUserDetails: async (data: UpdateUserData) => {
    const response = await apiClient.put("/api/auth/updatedetails", data)
    return response.data
  },

  updatePassword: async (data: UpdatePasswordData) => {
    const response = await apiClient.put("/api/auth/updatepassword", data)
    return response.data
  },

  forgotPassword: async (data: ForgotPasswordData) => {
    const response = await apiClient.post("/api/auth/forgotpassword", data)
    return response.data
  },

  resetPassword: async (token: string, data: ResetPasswordData) => {
    const response = await apiClient.put(`/api/auth/resetpassword/${token}`, data)
    return response.data
  },
}

export default AuthService
