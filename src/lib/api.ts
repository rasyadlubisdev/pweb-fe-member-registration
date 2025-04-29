import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import {
  ApiResponse,
  LoginFormData,
  Member,
  RegisterFormData,
  User,
  UserFormData,
} from "./types";
import { getAuthToken } from "./auth";

// Define API base URL - update this to match your backend
const API_BASE_URL = "https://api.example.com";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token to requests
api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Handle token expiration (401 Unauthorized)
    if (error.response?.status === 401) {
      // Clear local storage and redirect to login
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Authentication API calls
export const authApi = {
  // Login user
  login: async (
    data: LoginFormData
  ): Promise<ApiResponse<{ token: string; user: User }>> => {
    try {
      const response: AxiosResponse<
        ApiResponse<{ token: string; user: User }>
      > = await api.post("/auth/login", data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return {
          status: "error",
          message:
            error.response?.data?.message || "Login failed. Please try again.",
        };
      }
      return {
        status: "error",
        message: "Something went wrong. Please try again.",
      };
    }
  },

  // Register new user
  register: async (
    data: RegisterFormData
  ): Promise<ApiResponse<{ token: string; user: User }>> => {
    try {
      const response: AxiosResponse<
        ApiResponse<{ token: string; user: User }>
      > = await api.post("/auth/register", data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return {
          status: "error",
          message:
            error.response?.data?.message ||
            "Registration failed. Please try again.",
        };
      }
      return {
        status: "error",
        message: "Something went wrong. Please try again.",
      };
    }
  },

  // Get current user's profile
  getCurrentUser: async (): Promise<ApiResponse<User>> => {
    try {
      const response: AxiosResponse<ApiResponse<User>> = await api.get(
        "/user/me"
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return {
          status: "error",
          message:
            error.response?.data?.message || "Failed to fetch user profile.",
        };
      }
      return {
        status: "error",
        message: "Something went wrong. Please try again.",
      };
    }
  },
};

// Members API calls
export const membersApi = {
  // Get all members
  getAllMembers: async (): Promise<ApiResponse<Member[]>> => {
    try {
      const response: AxiosResponse<ApiResponse<Member[]>> = await api.get(
        "/members"
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return {
          status: "error",
          message: error.response?.data?.message || "Failed to fetch members.",
        };
      }
      return {
        status: "error",
        message: "Something went wrong. Please try again.",
      };
    }
  },

  // Add a new member
  addMember: async (
    data: Omit<Member, "id" | "registrationDate">
  ): Promise<ApiResponse<Member>> => {
    try {
      const response: AxiosResponse<ApiResponse<Member>> = await api.post(
        "/members",
        data
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return {
          status: "error",
          message: error.response?.data?.message || "Failed to add member.",
        };
      }
      return {
        status: "error",
        message: "Something went wrong. Please try again.",
      };
    }
  },

  // Delete a member (ADMIN only)
  deleteMember: async (id: string): Promise<ApiResponse<null>> => {
    try {
      const response: AxiosResponse<ApiResponse<null>> = await api.delete(
        `/members/${id}`
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return {
          status: "error",
          message: error.response?.data?.message || "Failed to delete member.",
        };
      }
      return {
        status: "error",
        message: "Something went wrong. Please try again.",
      };
    }
  },
};

// User profile API calls
export const userApi = {
  // Update user profile
  updateProfile: async (data: UserFormData): Promise<ApiResponse<User>> => {
    try {
      const response: AxiosResponse<ApiResponse<User>> = await api.put(
        "/user/me",
        data
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return {
          status: "error",
          message: error.response?.data?.message || "Failed to update profile.",
        };
      }
      return {
        status: "error",
        message: "Something went wrong. Please try again.",
      };
    }
  },
};

export default api;
