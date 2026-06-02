"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff, User, ArrowRight, AlertCircle, Loader2, Sparkles, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export default function SignupPage() {
  const { signup, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Password strength state
  const [strength, setStrength] = useState({ score: 0, label: "Empty", color: "bg-slate-200" });

  // Calculate password strength
  useEffect(() => {
    if (!password) {
      setStrength({ score: 0, label: "Empty", color: "bg-slate-200" });
      return;
    }
    
    let score = 0;
    if (password.length >= 6) score += 1;
    if (password.length >= 10) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    let label = "Weak";
    let color = "bg-red-500";

    if (score >= 4) {
      label = "Strong";
      color = "bg-kolo-green";
    } else if (score >= 2) {
      label = "Medium";
      color = "bg-orange-500";
    }

    setStrength({ score, label, color });
  }, [password]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic Validations
    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    const result = await signup(name, email, password);
    setIsSubmitting(false);

    if (result.success) {
      router.push("/");
    } else {
      setError(result.error || "Could not register user.");
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
              <span className="font-semibold tracking-wider uppercase">Join Kolo Today</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-black text-white leading-tight tracking-tight mb-4">
              Take Control of<br />Your Finances.
            </h2>
            
            <p className="text-slate-400 text-sm md:text-base leading-relaxed mb-6">
              Sign up in seconds to start building healthier savings habits. Your data is encrypted and saved directly to your browser.
            </p>
          </motion.div>

          {/* Optimized Mock Card Preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="rounded-2xl border border-slate-800/40 overflow-hidden shadow-2xl relative bg-slate-950/40 p-1 mb-6"
          >
            <Image
              src="/kolo_showcase.png"
              alt="Kolo Showcase Dashboard"
              width={500}
              height={320}
              className="w-full h-auto object-cover rounded-xl opacity-90 hover:opacity-100 transition-opacity duration-500"
              priority
            />
          </motion.div>

          {/* Bullet Points */}
          <div className="space-y-3.5 text-sm text-slate-350">
            <div className="flex items-center gap-3">
              <CheckCircle2 size={16} className="text-kolo-green shrink-0" />
              <span>Full CSV import mapping for major Nigerian Banks</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 size={16} className="text-kolo-green shrink-0" />
              <span>Beautiful category expense allocation charts</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 size={16} className="text-kolo-green shrink-0" />
              <span>Secure local-first database encryption</span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 text-xs text-slate-500">
          © 2026 Kolo AI Finance Tracker. All data stays client-side.
        </div>
      </div>

      {/* Right Column: Form Container */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 sm:p-12 md:p-16 overflow-y-auto">
        <div className="w-full max-w-md my-auto py-8">
          {/* Logo only visible on mobile */}
          <div className="flex items-center gap-3.5 mb-8 md:hidden">
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

          <h1 className="text-3xl font-black tracking-tight text-slate-950">Create an account</h1>
          <p className="text-slate-500 text-sm mt-2">
            Register below to unlock budgeting dashboards and tools.
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

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            {/* Full Name Field */}
            <div className="space-y-1.5">
              <label htmlFor="name" className="text-xs font-semibold text-slate-600 tracking-wider uppercase">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400">
                  <User size={16} />
                </div>
                <input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-sm font-medium outline-none transition-all focus:border-slate-800 placeholder:text-slate-400 shadow-sm"
                  required
                />
              </div>
            </div>

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
              <label htmlFor="password" className="text-xs font-semibold text-slate-600 tracking-wider uppercase">
                Password
              </label>
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
              
              {/* Password Strength Indicator */}
              {password && (
                <div className="pt-1.5 space-y-1">
                  <div className="flex justify-between items-center text-[10px] font-bold tracking-wider uppercase">
                    <span className="text-slate-400">Password Strength</span>
                    <span className={strength.score >= 4 ? "text-kolo-green" : strength.score >= 2 ? "text-orange-500" : "text-red-500"}>
                      {strength.label}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden flex gap-0.5">
                    <div className={`h-full rounded-l-full transition-all duration-300 ${strength.score >= 1 ? strength.color : "bg-transparent"}`} style={{ width: "20%" }} />
                    <div className={`h-full transition-all duration-300 ${strength.score >= 2 ? strength.color : "bg-transparent"}`} style={{ width: "20%" }} />
                    <div className={`h-full transition-all duration-300 ${strength.score >= 3 ? strength.color : "bg-transparent"}`} style={{ width: "20%" }} />
                    <div className={`h-full transition-all duration-300 ${strength.score >= 4 ? strength.color : "bg-transparent"}`} style={{ width: "20%" }} />
                    <div className={`h-full rounded-r-full transition-all duration-300 ${strength.score >= 5 ? strength.color : "bg-transparent"}`} style={{ width: "20%" }} />
                  </div>
                  <p className="text-[10px] text-slate-400 leading-normal">
                    Tip: Use at least 6 characters, mixed case, numbers, and special characters.
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-1.5">
              <label htmlFor="confirmPassword" className="text-xs font-semibold text-slate-600 tracking-wider uppercase">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400">
                  <Lock size={16} />
                </div>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-11 pr-12 text-sm font-medium outline-none transition-all focus:border-slate-800 placeholder:text-slate-400 shadow-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Register Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="relative w-full flex items-center justify-center gap-2 rounded-2xl bg-kolo-dark py-4 text-sm font-bold text-white transition-all hover:bg-slate-900 active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer shadow-lg mt-6"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin text-kolo-green" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight size={16} className="text-kolo-green" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-sm font-medium text-slate-500">
            Already have an account?{" "}
            <Link href="/login" className="text-slate-950 font-bold hover:underline">
              Sign in instead
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
