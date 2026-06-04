"use client";

import React, { useState, useEffect, useRef } from "react";
import { useFinance } from "@/context/finance-context";
import { useTheme } from "@/context/theme-context";
import { useAuth } from "@/context/auth-context";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  LayoutDashboard,
  ArrowRightLeft,
  Upload,
  Brain,
  Plus,
  Moon,
  Sun,
  RotateCcw,
  LogOut,
  Keyboard,
  FileText
} from "lucide-react";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  setIsFormOpen: (open: boolean) => void;
  setEditingTx: (tx: any | null) => void;
}

export default function CommandPalette({
  isOpen,
  onClose,
  setIsFormOpen,
  setEditingTx
}: CommandPaletteProps) {
  const { transactions, setActiveTab, resetToDefault } = useFinance();
  const { theme, toggleTheme } = useTheme();
  const { logout } = useAuth();

  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Build commands list
  const coreCommands = [
    {
      id: "nav-dash",
      title: "Go to Dashboard",
      category: "Navigation",
      icon: <LayoutDashboard className="h-4 w-4" />,
      shortcut: "G D",
      action: () => {
        setActiveTab("dashboard");
        onClose();
      }
    },
    {
      id: "nav-txs",
      title: "Go to Transactions",
      category: "Navigation",
      icon: <ArrowRightLeft className="h-4 w-4" />,
      shortcut: "G T",
      action: () => {
        setActiveTab("transactions");
        onClose();
      }
    },
    {
      id: "nav-import",
      title: "Go to CSV Statement Import",
      category: "Navigation",
      icon: <Upload className="h-4 w-4" />,
      shortcut: "G I",
      action: () => {
        setActiveTab("import");
        onClose();
      }
    },
    {
      id: "nav-ai",
      title: "Go to Kolo AI Copilot",
      category: "Navigation",
      icon: <Brain className="h-4 w-4" />,
      shortcut: "G A",
      action: () => {
        setActiveTab("ai-assistant");
        onClose();
      }
    },
    {
      id: "action-add",
      title: "Add New Transaction...",
      category: "Actions",
      icon: <Plus className="h-4 w-4" />,
      shortcut: "C",
      action: () => {
        setActiveTab("transactions");
        setEditingTx(null);
        setIsFormOpen(true);
        onClose();
      }
    },
    {
      id: "action-theme",
      title: `Toggle Theme (Currently ${theme === "light" ? "Light" : "Dark"})`,
      category: "Actions",
      icon: theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />,
      shortcut: "T",
      action: () => {
        toggleTheme();
        onClose();
      }
    },
    {
      id: "action-reset",
      title: "Reset Database to Seeds",
      category: "Danger Zone",
      icon: <RotateCcw className="h-4 w-4 text-red-500" />,
      action: () => {
        if (confirm("Reset financial dashboard back to demo statements?")) {
          resetToDefault();
          onClose();
        }
      }
    },
    {
      id: "action-logout",
      title: "Logout Current Session",
      category: "Account",
      icon: <LogOut className="h-4 w-4" />,
      action: () => {
        logout();
        onClose();
      }
    }
  ];

  // Filter commands by search text
  const filteredCommands = coreCommands.filter(cmd =>
    cmd.title.toLowerCase().includes(query.toLowerCase()) ||
    cmd.category.toLowerCase().includes(query.toLowerCase())
  );

  // Search transactions matching text
  const matchedTransactions = query.trim().length >= 2
    ? transactions.filter(t =>
        t.title.toLowerCase().includes(query.toLowerCase()) ||
        t.subtitle.toLowerCase().includes(query.toLowerCase()) ||
        t.category.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5)
    : [];

  // Combine items
  const items = [
    ...filteredCommands,
    ...matchedTransactions.map(t => ({
      id: `tx-${t.id}`,
      title: `Edit: ${t.title} (₦${t.amount.toLocaleString()} · ${t.category})`,
      category: "Matching Transactions",
      icon: <FileText className="h-4 w-4 text-kolo-green" />,
      shortcut: "",
      action: () => {
        setActiveTab("transactions");
        setEditingTx(t);
        setIsFormOpen(true);
        onClose();
      }
    }))
  ];

  // Handle keys for selection
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!isOpen) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % items.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + items.length) % items.length);
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (items[selectedIndex]) {
          items[selectedIndex].action();
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, items, selectedIndex, onClose]);

  // Adjust selection out-of-bounds
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[999] flex items-start justify-center bg-slate-950/45 dark:bg-slate-950/65 backdrop-blur-xs pt-[14vh] px-4">
          <motion.div
            ref={containerRef}
            initial={{ opacity: 0, y: -15, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.97 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 shadow-2xl backdrop-blur-xl flex flex-col max-h-[480px]"
          >
            {/* Search Input bar */}
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 px-4 py-3.5">
              <Search className="h-5 w-5 text-slate-400 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Type a command or search transactions..."
                className="w-full bg-transparent border-none outline-hidden text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 font-medium"
              />
              <span className="shrink-0 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-2 py-0.5 text-[10px] font-black text-slate-400 shadow-3xs select-none">
                ESC
              </span>
            </div>

            {/* Scrollable list */}
            <div className="flex-1 overflow-y-auto p-2 scrollbar-none">
              {items.length === 0 ? (
                <div className="py-12 text-center text-xs font-semibold text-slate-400">
                  No matching commands or transactions found.
                </div>
              ) : (
                <div className="flex flex-col gap-0.5">
                  {/* Category Grouping Headers */}
                  {(() => {
                    let currentCategory = "";
                    return items.map((item, idx) => {
                      const showHeader = item.category !== currentCategory;
                      if (showHeader) currentCategory = item.category;

                      return (
                        <React.Fragment key={item.id}>
                          {showHeader && (
                            <div className="px-3 pt-3 pb-1 text-[10px] font-black uppercase tracking-wider text-slate-400 select-none">
                              {item.category}
                            </div>
                          )}
                          <button
                            onClick={item.action}
                            className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left transition-all cursor-pointer ${
                              idx === selectedIndex
                                ? "bg-kolo-green/10 dark:bg-kolo-green/10 text-slate-950 dark:text-kolo-green font-bold"
                                : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900/40"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className={idx === selectedIndex ? "text-kolo-green" : "text-slate-400"}>
                                {item.icon}
                              </span>
                              <span className="text-xs">{item.title}</span>
                            </div>
                            {item.shortcut && (
                              <div className="flex items-center gap-1">
                                {item.shortcut.split(" ").map((key, kIdx) => (
                                  <kbd
                                    key={kIdx}
                                    className={`rounded-md border px-1.5 py-0.5 text-[9px] font-black shadow-3xs select-none ${
                                      idx === selectedIndex
                                        ? "border-kolo-green/20 bg-kolo-green/5 text-kolo-green"
                                        : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-400"
                                    }`}
                                  >
                                    {key}
                                  </kbd>
                                ))}
                              </div>
                            )}
                          </button>
                        </React.Fragment>
                      );
                    });
                  })()}
                </div>
              )}
            </div>

            {/* Helper Footer bar */}
            <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 px-4 py-2 text-[10px] text-slate-400 font-semibold bg-slate-50/50 dark:bg-slate-950/20 select-none">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 px-1 rounded-sm">↑↓</kbd> Navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 px-1 rounded-sm">Enter</kbd> Select
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Keyboard size={12} />
                <span>Press <kbd className="border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 px-1 rounded-sm">?</kbd> for help</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
