"use client";

import React from "react";
import { useFinance } from "@/context/finance-context";
import { LayoutDashboard, ArrowLeftRight, FileDown, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function MobileNav() {
  const { activeTab, setActiveTab } = useFinance();

  const navItems = [
    { id: "dashboard", label: "Home", icon: LayoutDashboard },
    { id: "transactions", label: "History", icon: ArrowLeftRight },
    { id: "import", label: "Import", icon: FileDown },
    { id: "ai-assistant", label: "Kolo AI", icon: Sparkles },
  ] as const;

  return (
    <div className="fixed bottom-5 left-4 right-4 z-40 md:hidden bg-slate-950/95 backdrop-blur-xl border border-slate-800/60 rounded-2xl py-2 px-3 shadow-2xl flex items-center justify-between pointer-events-auto">
      {navItems.map((item) => {
        const isActive = activeTab === item.id;
        const Icon = item.icon;

        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className="relative flex flex-col items-center justify-center flex-1 py-1 text-slate-400 active:scale-90 transition-transform duration-150 cursor-pointer"
          >
            {/* Active Pill Highlight */}
            {isActive && (
              <motion.div
                layoutId="mobile-active-nav"
                className="absolute -inset-1 rounded-xl bg-kolo-green/10 -z-10"
                transition={{ type: "spring", stiffness: 350, damping: 25 }}
              />
            )}

            <div className={`relative flex items-center justify-center p-1 rounded-lg transition-colors ${
              isActive ? "text-kolo-green" : "text-slate-400"
            }`}>
              <Icon size={18} className={isActive ? "stroke-[2.5px]" : "stroke-2"} />
              {item.id === "ai-assistant" && (
                <span className="absolute -top-0.5 -right-0.5 flex h-1.5 w-1.5 rounded-full bg-kolo-green" />
              )}
            </div>
            
            <span className={`text-[9px] font-bold mt-0.5 tracking-wide ${
              isActive ? "text-kolo-green" : "text-slate-500"
            }`}>
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
