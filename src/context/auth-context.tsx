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
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();

  // Initialize and check for existing session
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("kolo_current_user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse stored user session:", error);
      localStorage.removeItem("kolo_current_user");
    } finally {
      setIsLoading(false);
    }
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

  const logout = () => {
    setUser(null);
    localStorage.removeItem("kolo_current_user");
    toast.info("You have logged out successfully.");
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
