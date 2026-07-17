"use client";

import React, { useState, Suspense } from "react";
import { useAuth } from "@/context/auth-context";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Lock, Eye, EyeOff, ArrowLeft, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function ResetPasswordForm() {
  const { resetPassword } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const token = searchParams.get("token") || "";
  const emailParam = searchParams.get("email") || "";

  const [email, setEmail] = useState(emailParam);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !token) {
      setError("Missing email or token parameters in reset URL.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    const result = await resetPassword(email, token, password);
    setIsSubmitting(false);

    if (result.success) {
      setSuccessMessage(result.message);
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } else {
      setError(result.error || "Failed to reset password. The link may have expired.");
    }
  };

  return (
    <>
      <AnimatePresence mode="wait">
        {!successMessage ? (
          <motion.div
            key="reset-form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <h1 className="text-2xl font-black tracking-tight text-slate-950">Reset your password</h1>
            <p className="text-slate-500 text-sm mt-2 leading-relaxed">
              Enter a strong, secure new password for your account.
            </p>

            {error && (
              <div className="mt-5 flex items-center gap-2.5 rounded-2xl bg-red-50 border border-red-100 p-4 text-xs font-medium text-red-700">
                <AlertCircle size={16} className="text-red-500 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              {/* Readonly Email field */}
              <div className="space-y-1.5">
                <label htmlFor="email" className="text-xs font-semibold text-slate-600 tracking-wider uppercase">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 px-4 text-sm font-medium outline-none text-slate-500 shadow-sm cursor-not-allowed"
                  placeholder="name@kolo.ai"
                  required
                  disabled={!!emailParam}
                />
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <label htmlFor="password" className="text-xs font-semibold text-slate-600 tracking-wider uppercase">
                  New Password
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

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-kolo-dark py-4 text-sm font-bold text-white transition-all hover:bg-slate-900 active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer shadow-lg mt-6"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin text-kolo-green" />
                    <span>Resetting password...</span>
                  </>
                ) : (
                  <span>Reset Password</span>
                )}
              </button>
            </form>
          </motion.div>
        ) : (
          <motion.div
            key="success-message"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-4"
          >
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 mb-5">
              <CheckCircle2 size={28} />
            </div>
            
            <h2 className="text-2xl font-black tracking-tight text-slate-950">Password updated!</h2>
            
            <p className="text-slate-500 text-sm mt-3 leading-relaxed">
              {successMessage}
            </p>

            <p className="text-xs text-slate-400 mt-4 animate-pulse">
              Redirecting you to the sign in page...
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen w-screen bg-kolo-light font-sans text-slate-800 items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative Blur Spheres */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-kolo-green/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[90px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white/70 backdrop-blur-md rounded-3xl border border-slate-100 p-8 sm:p-10 shadow-xl relative z-10"
      >
        {/* Brand Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-kolo-green text-kolo-dark">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
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
          <span className="text-lg font-black text-slate-900 tracking-wider">kolo.</span>
        </div>

        <Suspense
          fallback={
            <div className="flex flex-col items-center justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-kolo-green mb-3" />
              <p className="text-xs text-slate-500 font-semibold tracking-wider animate-pulse">LOADING DETAILS...</p>
            </div>
          }
        >
          <ResetPasswordForm />
        </Suspense>

        <div className="mt-8 pt-6 border-t border-slate-100 flex justify-center">
          <Link
            href="/login"
            className="text-xs font-bold text-slate-500 hover:text-slate-950 flex items-center gap-2 transition-colors"
          >
            <ArrowLeft size={14} />
            Back to Sign In
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
