"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/auth-context";
import Link from "next/link";
import { Mail, ArrowLeft, Loader2, Sparkles, CheckCircle2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    const result = await forgotPassword(email);
    setIsSubmitting(false);

    if (result.success) {
      setSuccessMessage(result.message);
    } else {
      setError(result.error || "Failed to request password reset.");
    }
  };

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

        <AnimatePresence mode="wait">
          {!successMessage ? (
            <motion.div
              key="request-form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <h1 className="text-2xl font-black tracking-tight text-slate-950">Forgot password?</h1>
              <p className="text-slate-500 text-sm mt-2 leading-relaxed">
                Enter your email address and we will send you a secure link to reset your account credentials.
              </p>

              {error && (
                <div className="mt-5 flex items-center gap-2.5 rounded-2xl bg-red-50 border border-red-100 p-4 text-xs font-medium text-red-700">
                  <AlertCircle size={16} className="text-red-500 shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-6 space-y-5">
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

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-kolo-dark py-4 text-sm font-bold text-white transition-all hover:bg-slate-900 active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer shadow-lg mt-6"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin text-kolo-green" />
                      <span>Sending reset link...</span>
                    </>
                  ) : (
                    <span>Send Reset Link</span>
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
              
              <h2 className="text-2xl font-black tracking-tight text-slate-950">Check your email</h2>
              
              <p className="text-slate-500 text-sm mt-3 leading-relaxed">
                {successMessage}
              </p>

              <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3.5 py-1.5 text-[11px] font-semibold text-slate-600">
                <Sparkles size={12} className="text-kolo-green fill-kolo-green/20" />
                <span>Link logged to console for Dev</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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
