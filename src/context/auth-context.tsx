"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useToast } from "@/context/toast-context";
import api from "@/api/axios";

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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();

  // Initialize and check for existing session
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedUser = localStorage.getItem("kolo_current_user");
        const token = localStorage.getItem("kolo_access_token");
        
        if (storedUser && token) {
          setUser(JSON.parse(storedUser));
          
          // Verify/refresh token silently on mount to make sure session is active
          try {
            await api.post("/auth/refresh");
          } catch (refreshErr) {
            console.error("Mount session check failed, logging out:", refreshErr);
            setUser(null);
            localStorage.removeItem("kolo_current_user");
            localStorage.removeItem("kolo_access_token");
          }
        }
      } catch (error) {
        console.error("Failed to initialize user session:", error);
        localStorage.removeItem("kolo_current_user");
        localStorage.removeItem("kolo_access_token");
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
        localStorage.setItem("kolo_access_token", accessToken);

        setIsLoading(false);
        toast.success(`Welcome back, ${loggedInUser.name}! 👋`);
        return { success: true };
      } else {
        const errorMessage = response.data.message || "Invalid email or password. Please try again.";
        setIsLoading(false);
        toast.error(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (error: any) {
      setIsLoading(false);
      const errorMessage = error.response?.data?.message || error.message || "Invalid email or password. Please try again.";
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
        localStorage.setItem("kolo_access_token", accessToken);

        setIsLoading(false);
        toast.success("Account created successfully! Welcome to Kolo.");
        return { success: true };
      } else {
        const errorMessage = response.data.message || "Could not create account, Please try again.";
        setIsLoading(false);
        toast.error(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (error: any) {
      setIsLoading(false);
      const errorMessage = error.response?.data?.message || error.message || "Could not create account, Please try again.";
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
      localStorage.removeItem("kolo_access_token");
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
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to process request. Please try again.";
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
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to reset password. Please try again.";
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
