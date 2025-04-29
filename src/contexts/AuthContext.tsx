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

      if (response.status === "success" && response.data) {
        const { token, user } = response.data;

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

      if (response.status === "success" && response.data) {
        const { token, user } = response.data;

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

      if (response.status === "success" && response.data) {
        // Update user data
        setUser(response.data);

        setState({
          ...state,
          user: response.data,
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
