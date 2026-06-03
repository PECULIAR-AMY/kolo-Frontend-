"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

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
    // Simulate a minor API delay for premium feel
    await new Promise((resolve) => setTimeout(resolve, 800));

    try {
      const storedUsers = localStorage.getItem("kolo_users");
      const users: User[] = storedUsers ? JSON.parse(storedUsers) : [];

      const foundUser = users.find(
        (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
      );

      if (foundUser) {
        const { password: _, ...safeUser } = foundUser;
        setUser(safeUser);
        localStorage.setItem("kolo_current_user", JSON.stringify(safeUser));
        setIsLoading(false);
        return { success: true };
      } else {
        setIsLoading(false);
        return { success: false, error: "Invalid email or password. Please try again." };
      }
    } catch (error) {
      setIsLoading(false);
      return { success: false, error: "An unexpected error occurred. Please try again." };
    }
  };

  const signup = async (name: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    // Simulate minor network delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    try {
      const storedUsers = localStorage.getItem("kolo_users");
      const users: User[] = storedUsers ? JSON.parse(storedUsers) : [];

      const userExists = users.some((u) => u.email.toLowerCase() === email.toLowerCase());

      if (userExists) {
        setIsLoading(false);
        return { success: false, error: "An account with this email already exists." };
      }

      const newUser: User = {
        id: "usr-" + Math.random().toString(36).substr(2, 9),
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        createdAt: new Date().toISOString(),
      };

      users.push(newUser);
      localStorage.setItem("kolo_users", JSON.stringify(users));

      // Auto login the user after signing up
      const { password: _, ...safeUser } = newUser;
      setUser(safeUser);
      localStorage.setItem("kolo_current_user", JSON.stringify(safeUser));
      
      setIsLoading(false);
      return { success: true };
    } catch (error) {
      setIsLoading(false);
      return { success: false, error: "Could not create account, Please try again." };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("kolo_current_user");
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
