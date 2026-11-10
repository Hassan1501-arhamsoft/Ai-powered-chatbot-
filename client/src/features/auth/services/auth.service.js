// src/features/auth/services/auth.service.js
import api from "../../../api/axios.js"; // Adjust the relative path if necessary based on your structure

export const authService = {
  async register(userData) {
    try {
      const response = await api.post("/auth/register", userData);
      return response.data;
    } catch (error) {
      // Axios wraps backend error responses in error.response.data
      const errorMessage = error.response?.data?.message || error.response?.data?.error || "Registration failed";
      throw new Error(errorMessage, { cause: error });
    }
  },

  async login(credentials) {
    try {
      const response = await api.post("/auth/login", credentials);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data?.error || "Login failed";
      throw new Error(errorMessage, { cause: error });
    }
  },

  async logout() {
    try {
      const response = await api.get("/auth/logout");
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data?.error || "Logout failed";
      throw new Error(errorMessage, { cause: error });
    }
  }
};