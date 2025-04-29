import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import { getAuthToken } from "./auth";

// Types based on API Contract
interface Exception {
  unauthorized?: boolean;
  bad_request?: boolean;
  data_not_found?: boolean;
  internal_server_error?: boolean;
  data_duplicate?: boolean;
  query_error?: boolean;
  invalid_password_length?: boolean;
  message?: string;
}

interface BaseResponse {
  status: string;
  message: string;
  meta_data?: any;
}

interface SuccessResponse<T = any> extends BaseResponse {
  data: T;
}

interface ErrorResponse extends BaseResponse {
  errors: Exception;
  meta_data?: any;
}

type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

// User Types
interface UserAccount {
  id: number;
  uuid: string;
  email: string;
  password: string;
  is_email_verified: boolean;
  is_detail_completed: boolean;
  created_at: string;
  deleted_at: string | null;
}

interface UserDetails {
  id: number;
  account_id: number;
  initial_name: string;
  full_name: string | null;
  university: string | null;
  phone_number: string | null;
}

interface UserResponse {
  account: UserAccount;
  details: UserDetails;
}

interface LoginResponse {
  account: UserAccount;
  token: string;
}

interface RegisterResponse {
  id: number;
  uuid: string;
  email: string;
  password: string;
  is_email_verified: boolean;
  is_detail_completed: boolean;
  created_at: string;
  deleted_at: string | null;
}

// Member Types
interface Member {
  id: number;
  uuid: string;
  full_name: string;
  email: string;
  phone_number: string;
  gender: string;
  birth_date: string;
  address: string;
  created_at: string;
  updated_at: string;
}

// Request Types
interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  email: string;
  password: string;
}

interface UpdateProfileRequest {
  initial_name: string;
  full_name: string;
  university: string;
  phone_number: string;
}

interface MemberFormData {
  fullName: string;
  email: string;
  phoneNumber: string;
  gender: string;
  birthDate: string;
  address: string;
}

// Create axios instance with environment variable
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
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
  (error: AxiosError<ErrorResponse>) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Authentication API
export const authApi = {
  register: async (
    data: RegisterRequest
  ): Promise<ApiResponse<RegisterResponse>> => {
    try {
      const response = await api.post<SuccessResponse<RegisterResponse>>(
        "/auth/register",
        data
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorResponse: ErrorResponse = {
          status: "error",
          message: error.response?.data?.message || "Registration failed",
          errors: error.response?.data?.errors || {
            message: "Registration failed",
            internal_server_error: true,
          },
          meta_data: error.response?.data?.meta_data,
        };
        return errorResponse;
      }
      const unexpectedError: ErrorResponse = {
        status: "error",
        message: "An unexpected error occurred",
        errors: {
          message: "An unexpected error occurred",
          internal_server_error: true,
        },
        meta_data: null,
      };
      return unexpectedError;
    }
  },

  login: async (data: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
    try {
      const response = await api.post<SuccessResponse<LoginResponse>>(
        "/auth/login",
        data
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorResponse: ErrorResponse = {
          status: "error",
          message: error.response?.data?.message || "Login failed",
          errors: error.response?.data?.errors || {
            message: "Login failed",
            bad_request: true,
          },
          meta_data: error.response?.data?.meta_data,
        };
        return errorResponse;
      }
      const unexpectedError: ErrorResponse = {
        status: "error",
        message: "An unexpected error occurred",
        errors: {
          message: "An unexpected error occurred",
          internal_server_error: true,
        },
        meta_data: null,
      };
      return unexpectedError;
    }
  },

  getCurrentUser: async (): Promise<ApiResponse<UserResponse>> => {
    try {
      const response = await api.get<SuccessResponse<UserResponse>>("/user/me");
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorResponse: ErrorResponse = {
          status: "error",
          message:
            error.response?.data?.message || "Failed to fetch user profile",
          errors: error.response?.data?.errors || {
            message: "Failed to fetch user profile",
            unauthorized: error.response?.status === 401,
            data_not_found: error.response?.status === 404,
            internal_server_error: error.response?.status === 500,
          },
          meta_data: error.response?.data?.meta_data,
        };
        return errorResponse;
      }
      const unexpectedError: ErrorResponse = {
        status: "error",
        message: "An unexpected error occurred",
        errors: {
          message: "An unexpected error occurred",
          internal_server_error: true,
        },
        meta_data: null,
      };
      return unexpectedError;
    }
  },
};

// User API
export const userApi = {
  updateProfile: async (
    data: UpdateProfileRequest
  ): Promise<ApiResponse<UserResponse>> => {
    try {
      const response = await api.put<SuccessResponse<UserResponse>>(
        "/user/me",
        data
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorResponse: ErrorResponse = {
          status: "error",
          message: error.response?.data?.message || "Failed to update profile",
          errors: error.response?.data?.errors || {
            message: "Failed to update profile",
            unauthorized: error.response?.status === 401,
            bad_request: error.response?.status === 400,
            internal_server_error: error.response?.status === 500,
          },
          meta_data: error.response?.data?.meta_data,
        };
        return errorResponse;
      }
      const unexpectedError: ErrorResponse = {
        status: "error",
        message: "An unexpected error occurred",
        errors: {
          message: "An unexpected error occurred",
          internal_server_error: true,
        },
        meta_data: null,
      };
      return unexpectedError;
    }
  },

  getUserList: async (): Promise<ApiResponse<UserResponse[]>> => {
    try {
      const response = await api.get<SuccessResponse<UserResponse[]>>(
        "/user/list"
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorResponse: ErrorResponse = {
          status: "error",
          message: error.response?.data?.message || "Failed to fetch user list",
          errors: error.response?.data?.errors || {
            message: "Failed to fetch user list",
            unauthorized: error.response?.status === 401,
            internal_server_error: error.response?.status === 500,
          },
          meta_data: error.response?.data?.meta_data,
        };
        return errorResponse;
      }
      const unexpectedError: ErrorResponse = {
        status: "error",
        message: "An unexpected error occurred",
        errors: {
          message: "An unexpected error occurred",
          internal_server_error: true,
        },
        meta_data: null,
      };
      return unexpectedError;
    }
  },

  deleteUser: async (userId: number): Promise<ApiResponse<UserResponse[]>> => {
    try {
      const response = await api.delete<SuccessResponse<UserResponse[]>>(
        `/user/${userId}`
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorResponse: ErrorResponse = {
          status: "error",
          message: error.response?.data?.message || "Failed to delete user",
          errors: error.response?.data?.errors || {
            message: "Failed to delete user",
            unauthorized: error.response?.status === 401,
            data_not_found: error.response?.status === 404,
            internal_server_error: error.response?.status === 500,
          },
          meta_data: error.response?.data?.meta_data,
        };
        return errorResponse;
      }
      const unexpectedError: ErrorResponse = {
        status: "error",
        message: "An unexpected error occurred",
        errors: {
          message: "An unexpected error occurred",
          internal_server_error: true,
        },
        meta_data: null,
      };
      return unexpectedError;
    }
  },
};

// Members API
export const membersApi = {
  addMember: async (data: MemberFormData): Promise<ApiResponse<Member>> => {
    try {
      const response = await api.post<SuccessResponse<Member>>("/members", {
        full_name: data.fullName,
        email: data.email,
        phone_number: data.phoneNumber,
        gender: data.gender,
        birth_date: data.birthDate,
        address: data.address,
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorResponse: ErrorResponse = {
          status: "error",
          message: error.response?.data?.message || "Failed to add member",
          errors: error.response?.data?.errors || {},
        };
        return errorResponse;
      }
      const unexpectedError: ErrorResponse = {
        status: "error",
        message: "An unexpected error occurred",
        errors: {},
      };
      return unexpectedError;
    }
  },

  getMembers: async (): Promise<ApiResponse<Member[]>> => {
    try {
      const response = await api.get<SuccessResponse<Member[]>>("/members");
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorResponse: ErrorResponse = {
          status: "error",
          message: error.response?.data?.message || "Failed to fetch members",
          errors: error.response?.data?.errors || {
            message: "Failed to fetch members",
            unauthorized: error.response?.status === 401,
            internal_server_error: error.response?.status === 500,
          },
          meta_data: error.response?.data?.meta_data,
        };
        return errorResponse;
      }
      const unexpectedError: ErrorResponse = {
        status: "error",
        message: "An unexpected error occurred",
        errors: {
          message: "An unexpected error occurred",
          internal_server_error: true,
        },
        meta_data: null,
      };
      return unexpectedError;
    }
  },

  getMember: async (id: number): Promise<ApiResponse<Member>> => {
    try {
      const response = await api.get<SuccessResponse<Member>>(`/members/${id}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorResponse: ErrorResponse = {
          status: "error",
          message: error.response?.data?.message || "Failed to fetch member",
          errors: error.response?.data?.errors || {
            message: "Failed to fetch member",
            unauthorized: error.response?.status === 401,
            data_not_found: error.response?.status === 404,
            internal_server_error: error.response?.status === 500,
          },
          meta_data: error.response?.data?.meta_data,
        };
        return errorResponse;
      }
      const unexpectedError: ErrorResponse = {
        status: "error",
        message: "An unexpected error occurred",
        errors: {
          message: "An unexpected error occurred",
          internal_server_error: true,
        },
        meta_data: null,
      };
      return unexpectedError;
    }
  },
};

export default api;
