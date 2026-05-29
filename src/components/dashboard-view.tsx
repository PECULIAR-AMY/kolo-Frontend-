"use client";

import React from "react";
import { useFinance, Transaction } from "@/context/finance-context";
import SpendingTrend from "./spending-trend";
import { motion } from "framer-motion";
import { 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  Car, 
  Wallet, 
  DollarSign, 
  RefreshCw, 
  Utensils, 
  Smartphone, 
  ShoppingBag,
  Heart,
  HelpCircle,
  Sparkles,
  CreditCard
} from "lucide-react";

// Helper to get transaction category icon
const getCategoryIcon = (category: string, type: "income" | "expense") => {
  if (type === "income") return <Wallet className="h-4 w-4 text-emerald-600" />;
  
  switch (category) {
    case "Transport":
      return <Car className="h-4 w-4 text-slate-600" />;
    case "Food & Dining":
      return <Utensils className="h-4 w-4 text-slate-600" />;
    case "Subscriptions":
      return <RefreshCw className="h-4 w-4 text-slate-600" />;
    case "Groceries":
      return <ShoppingBag className="h-4 w-4 text-slate-600" />;
    case "Airtime & Data":
      return <Smartphone className="h-4 w-4 text-slate-600" />;
    case "Transfers":
      return <RefreshCw className="h-4 w-4 text-slate-600" />;
    case "POS & Cash":
      return <CreditCard className="h-4 w-4 text-slate-600" />;
    case "Health":
      return <Heart className="h-4 w-4 text-slate-600" />;
    default:
      return <HelpCircle className="h-4 w-4 text-slate-600" />;
  }
};

// Helper to get bank badge styling
const getBankStyle = (bank: Transaction["bank"]) => {
  switch (bank) {
    case "KUDA":
      return "bg-kuda-bg text-kuda-text";
    case "GTBANK":
      return "bg-gtbank-bg text-gtbank-text";
    case "OPAY":
      return "bg-opay-bg text-opay-text";
    case "PALMPAY":
      return "bg-palmpay-bg text-palmpay-text";
    case "MONIEPOINT":
      return "bg-moniepoint-bg text-moniepoint-text";
  }
};

export default function DashboardView() {
  const {
    totalIncome,
    totalExpenses,
    savingsAmount,
    savingsRate,
    topCategoryName,
    topCategoryAmount,
    categoryPercentages,
    dailyChartData,
    recentActivity,
    setActiveTab,
  } = useFinance();

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 260, damping: 25 } },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6 px-6 py-6 md:px-10"
    >
      {/* 4 Stats Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Income */}
        <div className="rounded-2xl bg-kolo-dark border border-slate-800/40 p-5 text-white shadow-sm flex flex-col justify-between min-h-[140px]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Income</span>
            <span className="flex items-center gap-0.5 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
              <TrendingUp size={10} />
              <span>12.4%</span>
            </span>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-black md:text-3xl font-sans">
              ₦{totalIncome.toLocaleString("en-NG")}
            </span>
            <p className="mt-1 text-[11px] text-slate-400">2 sources</p>
          </div>
        </div>

        {/* Card 2: Expenses */}
        <div className="rounded-2xl bg-white border border-slate-100 p-5 text-slate-800 shadow-sm flex flex-col justify-between min-h-[140px]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Expenses</span>
            <span className="flex items-center gap-0.5 rounded-full bg-rose-500/10 px-2 py-0.5 text-[10px] font-bold text-rose-500">
              <TrendingDown size={10} />
              <span>6.2%</span>
            </span>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-black md:text-3xl font-sans">
              ₦{totalExpenses.toLocaleString("en-NG")}
            </span>
            <p className="mt-1 text-[11px] text-slate-400">42 transactions</p>
          </div>
        </div>

        {/* Card 3: Savings rate */}
        <div className="rounded-2xl bg-kolo-green p-5 text-kolo-dark shadow-sm flex flex-col justify-between min-h-[140px]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-kolo-dark/70 uppercase tracking-wider">Savings rate</span>
            <span className="flex items-center gap-0.5 rounded-full bg-kolo-dark/10 px-2 py-0.5 text-[10px] font-extrabold text-kolo-dark">
              <TrendingUp size={10} />
              <span>{savingsRate.toFixed(1)}%</span>
            </span>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-black md:text-3xl font-sans">
              ₦{savingsAmount.toLocaleString("en-NG")}
            </span>
            <p className="mt-1 text-[11px] font-medium text-kolo-dark/70">{savingsRate.toFixed(1)}% of income</p>
          </div>
        </div>

        {/* Card 4: Top Category */}
        <div className="rounded-2xl bg-white border border-slate-100 p-5 text-slate-800 shadow-sm flex flex-col justify-between min-h-[140px]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Top category</span>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-black md:text-3xl font-sans">
              ₦{topCategoryAmount.toLocaleString("en-NG")}
            </span>
            <p className="mt-1 text-[11px] text-slate-400">{topCategoryName}</p>
          </div>
        </div>
      </motion.div>

      {/* Grid: Graph and AI Card */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Spending Trend Chart */}
        <div className="rounded-2xl bg-white border border-slate-100 p-6 shadow-sm lg:col-span-2">
          <div className="mb-4">
            <h2 className="text-md font-extrabold text-slate-900">Spending trend</h2>
            <p className="text-xs text-slate-400">Daily outflow across all connected accounts</p>
          </div>
          <SpendingTrend data={dailyChartData} />
        </div>

        {/* KOLO Insight Card */}
        <div className="rounded-2xl bg-gradient-to-br from-[#0c1811] via-[#09100c] to-[#040807] border border-emerald-950 p-6 shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[300px]">
          {/* Subtle Glow Overlay */}
          <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-emerald-500/10 blur-[60px]" />
          
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-kolo-green/10 px-2.5 py-1 text-[10px] font-extrabold text-kolo-green uppercase tracking-wider">
              <Sparkles size={10} className="fill-kolo-green/20" />
              <span>Kolo Insight</span>
            </div>
            <h3 className="text-base font-bold text-white mt-4 leading-snug">
              Transport spending increased by 18% this month.
            </h3>
            <p className="text-[11px] text-slate-300 mt-2 leading-relaxed font-normal">
              You spent ₦31,950 on Uber and Bolt — mostly weekday morning rides. Try batching errands on Saturdays to save up to ₦8k next month.
            </p>
          </div>
          <button 
            onClick={() => setActiveTab("transactions")}
            className="flex items-center gap-1 text-[11px] font-semibold text-kolo-green hover:text-kolo-green-hover transition-all mt-6 group text-left"
          >
            <span>See transport breakdown</span>
            <ArrowUpRight size={12} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </button>
        </div>
      </motion.div>

      {/* Grid: Top Categories and Recent Activity */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Top Categories */}
        <div className="rounded-2xl bg-white border border-slate-100 p-6 shadow-sm md:col-span-1">
          <h2 className="text-md font-extrabold text-slate-900 mb-5">Top categories</h2>
          
          {categoryPercentages.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No categories recorded yet.</p>
          ) : (
            <div className="space-y-4">
              {categoryPercentages.map((cat) => (
                <div key={cat.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">{cat.name}</span>
                    <span className="font-bold text-slate-900">₦{cat.amount.toLocaleString("en-NG")}</span>
                  </div>
                  {/* Custom Colored Progress Bar */}
                  <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${cat.percentage}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: cat.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="rounded-2xl bg-white border border-slate-100 p-6 shadow-sm md:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-md font-extrabold text-slate-900">Recent activity</h2>
            <button
              onClick={() => setActiveTab("transactions")}
              className="text-xs font-semibold text-slate-400 hover:text-slate-800 transition-colors"
            >
              See all
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {recentActivity.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3">
                  {/* Icon Frame */}
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                    tx.type === "income" ? "bg-emerald-500/10 text-emerald-600" : "bg-slate-100 text-slate-500"
                  }`}>
                    {getCategoryIcon(tx.category, tx.type)}
                  </div>
                  {/* Details */}
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900">{tx.title}</span>
                      <span className={`rounded px-1.5 py-0.5 text-[8px] font-extrabold tracking-wider uppercase ${getBankStyle(tx.bank)}`}>
                        {tx.bank}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-0.5">{tx.subtitle}</span>
                  </div>
                </div>

                {/* Amount / Date */}
                <div className="flex flex-col items-end">
                  <span className={`text-xs font-black font-sans ${
                    tx.type === "income" ? "text-emerald-500" : "text-slate-900"
                  }`}>
                    {tx.type === "income" ? "+ " : "- "}₦{tx.amount.toLocaleString("en-NG")}
                  </span>
                  <span className="text-[9px] text-slate-400 mt-0.5">
                    {new Date(tx.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })} · {
                      new Date(tx.date).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })
                    }
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
