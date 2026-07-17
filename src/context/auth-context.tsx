"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { useToast } from "@/context/toast-context";
import api, { setAccessToken } from "@/api/axios";

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<{ success: boolean; message: string; error?: string }>;
  resetPassword: (email: string, token: string, newPassword: string) => Promise<{ success: boolean; message: string; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const getErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || error.message || fallback;
  }
  if (error instanceof Error) {
    return error.message || fallback;
  }
  return fallback;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();

  // Initialize and check for existing session
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedUser = localStorage.getItem("kolo_current_user");
        
        if (storedUser) {
          // Verify/refresh token silently on mount to make sure session is active and get access token in memory
          try {
            const response = await api.post("/auth/refresh");
            if (response.data.success && response.data.accessToken) {
              setAccessToken(response.data.accessToken);
              setUser(JSON.parse(storedUser));
            } else {
              throw new Error("Invalid token refresh response");
            }
          } catch (refreshErr) {
            console.error("Mount session check failed, logging out:", refreshErr);
            setUser(null);
            localStorage.removeItem("kolo_current_user");
            setAccessToken(null);
          }
        }
      } catch (error) {
        console.error("Failed to initialize user session:", error);
        localStorage.removeItem("kolo_current_user");
        setAccessToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);

    try {
      const response = await api.post("/auth/login", {
        email: email.trim().toLowerCase(),
        password,
      });

      if (response.data.success) {
        const { user: backendUser, accessToken } = response.data;

        // Map backend user to local User interface
        const loggedInUser: User = {
          id: backendUser.id,
          name: backendUser.fullName,
          email: backendUser.email,
          createdAt: backendUser.createdAt,
        };

        setUser(loggedInUser);
        localStorage.setItem("kolo_current_user", JSON.stringify(loggedInUser));
        setAccessToken(accessToken);

        setIsLoading(false);
        toast.success(`Welcome back, ${loggedInUser.name}! 👋`);
        return { success: true };
      } else {
        const errorMessage = response.data.message || "Invalid email or password. Please try again.";
        setIsLoading(false);
        toast.error(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (error: unknown) {
      setIsLoading(false);
      const errorMessage = getErrorMessage(error, "Invalid email or password. Please try again.");
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const signup = async (name: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);

    try {
      const response = await api.post("/auth/register", {
        fullName: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      });

      if (response.data.success) {
        const { user: backendUser, accessToken } = response.data;

        // Map backend user to local User interface
        const loggedInUser: User = {
          id: backendUser.id,
          name: backendUser.fullName,
          email: backendUser.email,
          createdAt: backendUser.createdAt,
        };

        setUser(loggedInUser);
        localStorage.setItem("kolo_current_user", JSON.stringify(loggedInUser));
        setAccessToken(accessToken);

        setIsLoading(false);
        toast.success("Account created successfully! Welcome to Kolo.");
        return { success: true };
      } else {
        const errorMessage = response.data.message || "Could not create account, Please try again.";
        setIsLoading(false);
        toast.error(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (error: unknown) {
      setIsLoading(false);
      const errorMessage = getErrorMessage(error, "Could not create account, Please try again.");
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Failed to log out on backend:", error);
    } finally {
      setUser(null);
      localStorage.removeItem("kolo_current_user");
      setAccessToken(null);
      toast.info("You have logged out successfully.");
    }
  };

  const forgotPassword = async (email: string): Promise<{ success: boolean; message: string; error?: string }> => {
    try {
      const response = await api.post("/auth/forgot-password", {
        email: email.trim().toLowerCase(),
      });

      if (response.data.message) {
        return { success: true, message: response.data.message };
      }
      return { success: true, message: "If an account with that email exists, a password reset link has been sent." };
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, "Failed to process request. Please try again.");
      return { success: false, message: errorMessage, error: errorMessage };
    }
  };

  const resetPassword = async (email: string, token: string, newPassword: string): Promise<{ success: boolean; message: string; error?: string }> => {
    try {
      const response = await api.post("/auth/reset-password", {
        email: email.trim().toLowerCase(),
        token,
        newPassword,
      });

      if (response.data.success) {
        return { success: true, message: response.data.message || "Password reset successful." };
      }
      return { success: false, message: response.data.message || "Failed to reset password.", error: response.data.message };
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, "Failed to reset password. Please try again.");
      return { success: false, message: errorMessage, error: errorMessage };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
        forgotPassword,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
