"use client";

import React from "react";
import { useFinance } from "@/context/finance-context";
import { LayoutDashboard, ArrowLeftRight, FileDown, Sparkles, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Sidebar({ isOpen, setIsOpen }: { isOpen: boolean; setIsOpen: (val: boolean) => void }) {
  const { activeTab, setActiveTab } = useFinance();

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "transactions", label: "Transactions", icon: ArrowLeftRight },
    { id: "import", label: "Import CSV", icon: FileDown },
  ] as const;

  return (
    <>
      {/* Mobile Toggle Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black md:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-kolo-dark text-slate-400 transition-transform duration-300 md:static md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo Section */}
        <div className="flex h-20 items-center justify-between px-6 border-b border-slate-800/40">
          <div className="flex items-center gap-3">
            {/* Custom Styled Piggy Logo */}
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
            <span className="text-xl font-bold tracking-tight text-white font-sans">Kolo</span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white md:hidden"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 space-y-1.5 px-4 py-6 font-medium">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsOpen(false);
                }}
                className={`relative flex w-full items-center gap-3.5 rounded-full px-4 py-3 text-sm transition-all duration-300 ${
                  isActive
                    ? "text-kolo-dark font-semibold bg-kolo-green"
                    : "hover:bg-slate-800/40 hover:text-slate-100"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-pill"
                    className="absolute inset-0 rounded-full bg-kolo-green -z-10"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <Icon size={18} className={isActive ? "text-kolo-dark" : "text-slate-400"} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* KOLO AI Bottom Card */}
        <div className="p-4">
          <div className="rounded-2xl bg-slate-900/60 border border-slate-800/60 p-4 shadow-xl">
            <div className="flex items-center gap-2 mb-2">
              <div className="rounded-md bg-kolo-green/10 p-1 text-kolo-green">
                <Sparkles size={14} className="fill-kolo-green/20" />
              </div>
              <span className="text-xs font-semibold tracking-wider text-kolo-green uppercase">Kolo AI</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-400">
              Connect more accounts to unlock smarter spending insights and custom budgets.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
