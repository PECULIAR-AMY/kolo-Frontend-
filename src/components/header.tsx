"use client";

import React from "react";
import { useFinance } from "@/context/finance-context";
import { useAuth } from "@/context/auth-context";
import { ArrowUpRight, Plus, LayoutDashboard, Menu } from "lucide-react";

export default function Header({
  onMenuClick,
  onAddClick,
}: {
  onMenuClick: () => void;
  onAddClick: () => void;
}) {
  const { activeTab, setActiveTab, totalExpenses, totalIncome } = useFinance();
  const { user } = useAuth();
 
  const getHeaderInfo = () => {
    switch (activeTab) {
      case "dashboard":
        const firstName = user?.name ? user.name.split(" ")[0] : "there";
        return {
          breadcrumb: `Hello, ${firstName}! 👋`,
          title: "Where did your money go?",
          action: (
            <button
              onClick={() => setActiveTab("transactions")}
              className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-800 transition-all hover:bg-slate-50 active:scale-95"
            >
              <span>View all transactions</span>
              <ArrowUpRight size={14} className="text-slate-500" />
            </button>
          ),
        };
      case "transactions":
        return {
          breadcrumb: "All accounts · May 2026",
          title: "Transactions",
          action: (
            <div className="flex items-center gap-5 text-sm">
              <span className="text-slate-600 font-medium">
                Out <span className="text-slate-950 font-black ml-1 font-sans">₦{totalExpenses.toLocaleString("en-NG")}</span>
              </span>
              <span className="text-slate-600 font-medium">
                In <span className="text-[#22c55e] font-black ml-1 font-sans">₦{totalIncome.toLocaleString("en-NG")}</span>
              </span>
            </div>
          ),
        };
      case "import":
        return {
          breadcrumb: "May 2026 - data ingestion",
          title: "Import CSV Statement",
          action: (
            <button
              onClick={() => setActiveTab("dashboard")}
              className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-800 transition-all hover:bg-slate-50 active:scale-95"
            >
              <LayoutDashboard size={14} className="text-slate-500" />
              <span>Back to Dashboard</span>
            </button>
          ),
        };
      case "ai-assistant":
        return {
          breadcrumb: "Interactive copilot",
          title: "Kolo AI Assistant",
          action: (
            <button
              onClick={() => setActiveTab("dashboard")}
              className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-800 transition-all hover:bg-slate-50 active:scale-95"
            >
              <LayoutDashboard size={14} className="text-slate-500" />
              <span>Back to Dashboard</span>
            </button>
          ),
        };
    }
  };
 
  const info = getHeaderInfo();
 
  return (
    <header className="flex h-20 items-center justify-between px-6 bg-transparent border-b border-slate-100/50 md:px-10">
      <div className="flex items-center gap-3">
        {/* Mobile menu toggle */}
        <button
          onClick={onMenuClick}
          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 md:hidden"
        >
          <Menu size={20} />
        </button>
 
        <div className="flex flex-col">
          <span className={`text-xs font-medium text-slate-400 ${activeTab !== "transactions" ? "capitalize" : ""}`}>{info.breadcrumb}</span>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-950 mt-1">{info.title}</h1>
        </div>
      </div>
      <div>{info.action}</div>
    </header>
  );
}
