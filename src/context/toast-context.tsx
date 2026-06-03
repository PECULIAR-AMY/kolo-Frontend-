"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "warning" | "info";

type Toast = {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
};

type ToastContextType = {
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
  dismiss: (id: string) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message: string, type: ToastType, duration = 4000) => {
    const id = "toast-" + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type, duration }]);

    if (duration > 0) {
      setTimeout(() => {
        dismiss(id);
      }, duration);
    }
  }, [dismiss]);

  const success = useCallback((msg: string, dur?: number) => addToast(msg, "success", dur), [addToast]);
  const error = useCallback((msg: string, dur?: number) => addToast(msg, "error", dur), [addToast]);
  const warning = useCallback((msg: string, dur?: number) => addToast(msg, "warning", dur), [addToast]);
  const info = useCallback((msg: string, dur?: number) => addToast(msg, "info", dur), [addToast]);

  return (
    <ToastContext.Provider value={{ success, error, warning, info, dismiss }}>
      {children}
      
      {/* Toast Overlay Container */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 w-full max-w-[360px] pointer-events-none px-4 sm:px-0">
        <AnimatePresence>
          {toasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} onDismiss={dismiss} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const getIcon = () => {
    switch (toast.type) {
      case "success":
        return <CheckCircle2 className="h-5 w-5 text-kolo-green" />;
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case "info":
        return <Info className="h-5 w-5 text-sky-500" />;
    }
  };

  const getBorderColor = () => {
    switch (toast.type) {
      case "success":
        return "border-kolo-green/20 dark:border-kolo-green/10 shadow-[0_4px_24px_rgba(162,233,50,0.1)]";
      case "error":
        return "border-red-500/20 dark:border-red-500/10 shadow-[0_4px_24px_rgba(239,68,68,0.1)]";
      case "warning":
        return "border-orange-500/20 dark:border-orange-500/10 shadow-[0_4px_24px_rgba(249,115,22,0.1)]";
      case "info":
        return "border-sky-500/20 dark:border-sky-500/10 shadow-[0_4px_24px_rgba(56,189,248,0.1)]";
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.2 } }}
      transition={{ type: "spring", stiffness: 350, damping: 28 }}
      className={`pointer-events-auto flex items-center justify-between gap-3 rounded-2xl border bg-white/80 dark:bg-slate-900/80 p-4.5 backdrop-blur-xl shadow-lg ${getBorderColor()}`}
    >
      <div className="flex items-center gap-3">
        <div className="shrink-0">{getIcon()}</div>
        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-snug">
          {toast.message}
        </p>
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="shrink-0 rounded-lg p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-100 transition-colors hover:bg-slate-100/50 dark:hover:bg-slate-800/50 cursor-pointer"
        aria-label="Dismiss toast"
      >
        <X size={14} />
      </button>
    </motion.div>
  );
}
