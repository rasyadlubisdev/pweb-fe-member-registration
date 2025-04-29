"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { User, AuthState, LoginFormData, RegisterFormData } from "@/lib/types";
import { authApi } from "@/lib/api";
import {
  setAuthToken,
  setUser,
  getUser,
  getAuthToken,
  removeAuthToken,
  removeUser,
} from "@/lib/auth";

// Define the shape of the context
interface AuthContextType extends AuthState {
  login: (data: LoginFormData) => Promise<boolean>;
  register: (data: RegisterFormData) => Promise<boolean>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    loading: true,
    error: null,
  });

  // Check for stored authentication on mount
  useEffect(() => {
    const initAuth = () => {
      const token = getAuthToken();
      const user = getUser();

      if (token && user) {
        setState({
          isAuthenticated: true,
          user,
          loading: false,
          error: null,
        });
      } else {
        setState({
          isAuthenticated: false,
          user: null,
          loading: false,
          error: null,
        });
      }
    };

    initAuth();
  }, []);

  // Login user
  const login = async (data: LoginFormData): Promise<boolean> => {
    setState({ ...state, loading: true, error: null });

    try {
      const response = await authApi.login(data);

      // Check if response has successful status and is a SuccessResponse type (has data property)
      if (response.status === "success" && "data" in response) {
        const { account, token } = response.data;

        // Create a user object that conforms to the User type
        const user: User = {
          id: String(account.id),
          uuid: account.uuid,
          email: account.email,
          isEmailVerified: account.is_email_verified,
          isDetailCompleted: account.is_detail_completed,
          fullName: "",
          phoneNumber: "",
          gender: "male", // Default to male
          birthDate: "",
          university: "",
          address: "",
          birthPlace: "",
          initialName: "",
          role: "USER", // ✅ default role
          registrationDate: new Date().toISOString(), // ✅ default current time
        };

        // Store token and user info
        setAuthToken(token);
        setUser(user);

        setState({
          isAuthenticated: true,
          user,
          loading: false,
          error: null,
        });

        return true;
      } else {
        setState({
          ...state,
          loading: false,
          error: response.message || "Login failed. Please try again.",
        });
        return false;
      }
    } catch (error) {
      setState({
        ...state,
        loading: false,
        error: "Something went wrong. Please try again.",
      });
      return false;
    }
  };

  // Register user
  const register = async (data: RegisterFormData): Promise<boolean> => {
    setState({ ...state, loading: true, error: null });

    try {
      const response = await authApi.register(data);

      // Check if response has successful status and is a SuccessResponse type (has data property)
      if (response.status === "success" && "data" in response) {
        // For registration, we need to perform a login to get the token
        const loginResult = await login({
          email: data.email,
          password: data.password,
        });

        return loginResult;
      } else {
        setState({
          ...state,
          loading: false,
          error: response.message || "Registration failed. Please try again.",
        });
        return false;
      }
    } catch (error) {
      setState({
        ...state,
        loading: false,
        error: "Something went wrong. Please try again.",
      });
      return false;
    }
  };

  // Logout user
  const logout = () => {
    removeAuthToken();
    removeUser();

    setState({
      isAuthenticated: false,
      user: null,
      loading: false,
      error: null,
    });

    router.push("/login");
  };

  // Refresh user data
  const refreshUser = async (): Promise<void> => {
    if (!state.isAuthenticated) return;

    setState({ ...state, loading: true });

    try {
      const response = await authApi.getCurrentUser();

      // Check if response has successful status and is a SuccessResponse type (has data property)
      if (response.status === "success" && "data" in response) {
        const { account, details } = response.data;

        // Create a user object that conforms to the User type
        const user: User = {
          id: String(account.id), // ✅ Konversi number → string
          uuid: account.uuid,
          email: account.email,
          isEmailVerified: account.is_email_verified,
          isDetailCompleted: account.is_detail_completed,
          fullName: details.full_name || "",
          phoneNumber: details.phone_number || "",
          gender: "male", // ✅ Default, Anda bisa update jika backend mengembalikan gender
          birthDate: "", // ✅ Kosong karena tidak tersedia
          university: details.university || "",
          address: "", // ✅ Kosong karena tidak tersedia
          birthPlace: "", // ✅ Kosong karena tidak tersedia
          initialName: details.initial_name || "",
          role: "USER", // ✅ Default role
          registrationDate: new Date().toISOString(), // ✅ Default ke waktu sekarang
        };

        // Update user data
        setUser(user);

        setState({
          ...state,
          user,
          loading: false,
        });
      } else {
        setState({
          ...state,
          loading: false,
        });
      }
    } catch (error) {
      setState({
        ...state,
        loading: false,
      });
    }
  };

  // Context value
  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
