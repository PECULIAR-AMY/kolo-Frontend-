"use client";

import React from "react";
import { useFinance } from "@/context/finance-context";
import { ArrowUpRight, Plus, LayoutDashboard, Menu } from "lucide-react";

export default function Header({
  onMenuClick,
  onAddClick,
}: {
  onMenuClick: () => void;
  onAddClick: () => void;
}) {
  const { activeTab, setActiveTab } = useFinance();

  const getHeaderInfo = () => {
    switch (activeTab) {
      case "dashboard":
        return {
          breadcrumb: "May 2026 - overview",
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
          breadcrumb: "May 2026 - transactions database",
          title: "Transaction Manager",
          action: (
            <button
              onClick={onAddClick}
              className="flex items-center gap-1.5 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-slate-800 active:scale-95"
            >
              <Plus size={14} />
              <span>Add Transaction</span>
            </button>
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
    }
  };

  const info = getHeaderInfo();

  return (
    <header className="flex h-20 items-center justify-between px-6 bg-transparent border-b border-slate-100 md:px-10">
      <div className="flex items-center gap-3">
        {/* Mobile menu toggle */}
        <button
          onClick={onMenuClick}
          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 md:hidden"
        >
          <Menu size={20} />
        </button>

        <div className="flex flex-col">
          <span className="text-xs font-medium text-slate-400 capitalize">{info.breadcrumb}</span>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 md:text-2xl">{info.title}</h1>
        </div>
      </div>
      <div>{info.action}</div>
    </header>
  );
}
