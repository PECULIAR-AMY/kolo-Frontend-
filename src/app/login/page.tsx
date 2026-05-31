"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff, Sparkles, ArrowRight, AlertCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function LoginPage() {
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setIsSubmitting(true);
    const result = await login(email, password);
    setIsSubmitting(false);

    if (result.success) {
      router.push("/");
    } else {
      setError(result.error || "Authentication failed.");
    }
  };

  const handleDemoFill = () => {
    setEmail("demo@kolo.ai");
    setPassword("Kolo123!");
    setError(null);
    
    // Auto-create the demo user in localStorage if not exists so it works instantly
    try {
      const storedUsers = localStorage.getItem("kolo_users");
      const users = storedUsers ? JSON.parse(storedUsers) : [];
      const exists = users.some((u: any) => u.email.toLowerCase() === "demo@kolo.ai");
      if (!exists) {
        users.push({
          id: "usr-demo",
          name: "Kolo Demo User",
          email: "demo@kolo.ai",
          password: "Kolo123!",
          createdAt: new Date().toISOString(),
        });
        localStorage.setItem("kolo_users", JSON.stringify(users));
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (authLoading || isAuthenticated) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-kolo-dark text-white font-sans">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
          className="h-10 w-10 border-4 border-kolo-green border-t-transparent rounded-full mb-4"
        />
        <p className="text-sm font-semibold tracking-wider text-slate-400 animate-pulse">
          PREPARING YOUR DASHBOARD...
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-screen bg-kolo-light font-sans text-slate-800">
      {/* Left Column: Branding (Visible only on md+) */}
      <div className="hidden md:flex md:w-1/2 bg-kolo-dark flex-col justify-between p-12 relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-kolo-green/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

        {/* Top Header */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-kolo-green text-kolo-dark">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 5c-1.5 0-2.8 1.4-3 2-2.5-1.5-6.5-1.5-9 0-.2-.6-1.5-2-3-2C2 5 2 7 2 8c0 5 3.8 9 8.5 9 1 0 1.9-.2 2.8-.5.8.3 1.7.5 2.7.5 4.7 0 8.5-4 8.5-9 0-1 0-3-2.5-3z" />
              <path d="M7 11h.01" />
              <path d="M11 11h.01" />
            </svg>
          </div>
          <span className="text-xl font-black text-white tracking-wider">kolo.</span>
        </div>

        {/* Visual Showcase Center */}
        <div className="relative z-10 my-auto max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-900/60 border border-slate-800/80 px-3.5 py-1.5 text-xs text-kolo-green mb-6">
              <Sparkles size={14} className="fill-kolo-green/20" />
              <span className="font-semibold tracking-wider uppercase">Finance Management Redefined</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-black text-white leading-tight tracking-tight mb-4">
              Spend Smarter,<br />Save More.
            </h2>
            
            <p className="text-slate-400 text-sm md:text-base leading-relaxed mb-10">
              Kolo helps you track daily expenses, import bank statements, and optimize your monthly budget seamlessly with local encryption.
            </p>
          </motion.div>

          {/* Glassmorphic Mock Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="rounded-3xl bg-slate-900/40 border border-slate-800/60 p-6 backdrop-blur-xl shadow-2xl relative overflow-hidden"
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Total Savings</p>
                <h3 className="text-2xl font-black text-white mt-1">₦647,500</h3>
              </div>
              <div className="rounded-full bg-kolo-green/10 px-2.5 py-1 text-[10px] font-bold text-kolo-green">
                +62.5% Rate
              </div>
            </div>
            
            {/* Visual Mini Chart bars */}
            <div className="flex gap-2.5 items-end h-24 pt-4 border-t border-slate-800/30">
              <div className="w-full bg-slate-800 rounded-t-md h-[40%]" />
              <div className="w-full bg-slate-800 rounded-t-md h-[55%]" />
              <div className="w-full bg-slate-800 rounded-t-md h-[30%]" />
              <div className="w-full bg-slate-800 rounded-t-md h-[80%]" />
              <div className="w-full bg-kolo-green rounded-t-md h-[95%] shadow-[0_0_15px_rgba(162,233,50,0.3)]" />
            </div>
          </motion.div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 text-xs text-slate-500">
          © 2026 Kolo AI Finance Tracker. All data stays client-side.
        </div>
      </div>

      {/* Right Column: Form Container */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 sm:p-12 md:p-20">
        <div className="w-full max-w-md">
          {/* Logo only visible on mobile */}
          <div className="flex items-center gap-3.5 mb-10 md:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-kolo-green text-kolo-dark">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 5c-1.5 0-2.8 1.4-3 2-2.5-1.5-6.5-1.5-9 0-.2-.6-1.5-2-3-2C2 5 2 7 2 8c0 5 3.8 9 8.5 9 1 0 1.9-.2 2.8-.5.8.3 1.7.5 2.7.5 4.7 0 8.5-4 8.5-9 0-1 0-3-2.5-3z" />
                <path d="M7 11h.01" />
                <path d="M11 11h.01" />
              </svg>
            </div>
            <span className="text-2xl font-black text-slate-900 tracking-wider">kolo.</span>
          </div>

          <h1 className="text-3xl font-black tracking-tight text-slate-950">Welcome back</h1>
          <p className="text-slate-500 text-sm mt-2">
            Sign in to manage your budget, view trends, and import statements.
          </p>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-6 flex items-center gap-2.5 rounded-2xl bg-red-50 border border-red-100 p-4 text-xs font-medium text-red-700"
              >
                <AlertCircle size={16} className="text-red-500 shrink-0" />
                <p>{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-semibold text-slate-600 tracking-wider uppercase">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400">
                  <Mail size={16} />
                </div>
                <input
                  id="email"
                  type="email"
                  placeholder="name@kolo.ai"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-sm font-medium outline-none transition-all focus:border-slate-800 placeholder:text-slate-400 shadow-sm"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="text-xs font-semibold text-slate-600 tracking-wider uppercase">
                  Password
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400">
                  <Lock size={16} />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-11 pr-12 text-sm font-medium outline-none transition-all focus:border-slate-800 placeholder:text-slate-400 shadow-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="relative w-full flex items-center justify-center gap-2 rounded-2xl bg-kolo-dark py-4 text-sm font-bold text-white transition-all hover:bg-slate-900 active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer shadow-lg mt-6"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin text-kolo-green" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={16} className="text-kolo-green" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Autofill Badge */}
          <div className="mt-6 flex flex-col items-center">
            <button
              type="button"
              onClick={handleDemoFill}
              className="text-xs font-semibold text-kolo-dark/70 hover:text-kolo-dark bg-slate-100 hover:bg-slate-200/80 px-3 py-1.5 rounded-full transition-colors inline-flex items-center gap-1.5"
            >
              <Sparkles size={12} className="text-kolo-green fill-kolo-green/20" />
              <span>Autofill Demo Credentials</span>
            </button>
            <p className="text-[10px] text-slate-400 mt-1.5">
              Click to quickly populate and login with local demo credentials
            </p>
          </div>

          <div className="mt-8 text-center text-sm font-medium text-slate-500">
            Don't have an account?{" "}
            <Link href="/signup" className="text-slate-950 font-bold hover:underline">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
