"use client";

import React from "react";
import { useFinance, Transaction } from "@/context/finance-context";
import { generateAIInsights } from "@/utils/ai-engine";
import { detectRecurringTransactions, RecurringItem } from "@/utils/recurring-engine";
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
  CreditCard,
  ChevronLeft,
  ChevronRight,
  Tv,
  Coins
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
    transactions,
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

  const insights = React.useMemo(() => generateAIInsights(transactions), [transactions]);
  const [currentInsightIdx, setCurrentInsightIdx] = React.useState(0);

  const activeInsight = insights[currentInsightIdx] || insights[0];

  const handleNextInsight = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentInsightIdx((prev) => (prev + 1) % insights.length);
  };

  const handlePrevInsight = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentInsightIdx((prev) => (prev - 1 + insights.length) % insights.length);
  };

  const recurringItems = React.useMemo(() => detectRecurringTransactions(transactions), [transactions]);
  const upcomingRecurring = React.useMemo(() => {
    return recurringItems.filter(item => item.daysRemaining >= 0 && item.daysRemaining <= 14);
  }, [recurringItems]);

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
      <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3 md:gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Income */}
        <div className="rounded-2xl bg-kolo-dark border border-slate-800/40 p-4 sm:p-5 text-white shadow-sm flex flex-col justify-between min-h-[120px] sm:min-h-[140px]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">Income</span>
            <span className="flex items-center gap-0.5 rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[8px] sm:text-[10px] font-bold text-emerald-400">
              <TrendingUp size={10} />
              <span>12.4%</span>
            </span>
          </div>
          <div className="mt-2 sm:mt-4">
            <span className="text-lg sm:text-2xl md:text-3xl font-black font-sans">
              ₦{totalIncome.toLocaleString("en-NG")}
            </span>
            <p className="mt-0.5 sm:mt-1 text-[9px] sm:text-[11px] text-slate-400">2 sources</p>
          </div>
        </div>

        {/* Card 2: Expenses */}
        <div className="rounded-2xl bg-white border border-slate-100 p-4 sm:p-5 text-slate-800 shadow-sm flex flex-col justify-between min-h-[120px] sm:min-h-[140px]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">Expenses</span>
            <span className="flex items-center gap-0.5 rounded-full bg-rose-500/10 px-1.5 py-0.5 text-[8px] sm:text-[10px] font-bold text-rose-500">
              <TrendingDown size={10} />
              <span>6.2%</span>
            </span>
          </div>
          <div className="mt-2 sm:mt-4">
            <span className="text-lg sm:text-2xl md:text-3xl font-black font-sans">
              ₦{totalExpenses.toLocaleString("en-NG")}
            </span>
            <p className="mt-0.5 sm:mt-1 text-[9px] sm:text-[11px] text-slate-400">42 transactions</p>
          </div>
        </div>

        {/* Card 3: Savings rate */}
        <div className="rounded-2xl bg-kolo-green p-4 sm:p-5 text-kolo-dark shadow-sm flex flex-col justify-between min-h-[120px] sm:min-h-[140px]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold text-kolo-dark/70 uppercase tracking-wider">Savings</span>
            <span className="flex items-center gap-0.5 rounded-full bg-kolo-dark/10 px-1.5 py-0.5 text-[8px] sm:text-[10px] font-extrabold text-kolo-dark">
              <TrendingUp size={10} />
              <span>{savingsRate.toFixed(0)}%</span>
            </span>
          </div>
          <div className="mt-2 sm:mt-4">
            <span className="text-lg sm:text-2xl md:text-3xl font-black font-sans">
              ₦{savingsAmount.toLocaleString("en-NG")}
            </span>
            <p className="mt-0.5 sm:mt-1 text-[9px] sm:text-[11px] font-medium text-kolo-dark/70">{savingsRate.toFixed(0)}% rate</p>
          </div>
        </div>

        {/* Card 4: Top Category */}
        <div className="rounded-2xl bg-white border border-slate-100 p-4 sm:p-5 text-slate-800 shadow-sm flex flex-col justify-between min-h-[120px] sm:min-h-[140px]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">Top category</span>
          </div>
          <div className="mt-2 sm:mt-4">
            <span className="text-lg sm:text-2xl md:text-3xl font-black font-sans">
              ₦{topCategoryAmount.toLocaleString("en-NG")}
            </span>
            <p className="mt-0.5 sm:mt-1 text-[9px] sm:text-[11px] text-slate-400 truncate">{topCategoryName}</p>
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
            <div className="flex items-center justify-between">
              <div className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider ${
                activeInsight.type === "warning"
                  ? "bg-rose-500/15 text-rose-400 border border-rose-950/30"
                  : activeInsight.type === "suggestion"
                  ? "bg-sky-500/15 text-sky-400 border border-sky-950/30"
                  : "bg-kolo-green/15 text-kolo-green border border-emerald-950/30"
              }`}>
                <Sparkles size={10} className={activeInsight.type === "warning" ? "fill-rose-400/20" : activeInsight.type === "suggestion" ? "fill-sky-400/20" : "fill-kolo-green/20"} />
                <span>Kolo {activeInsight.type === "warning" ? "Warning" : activeInsight.type === "suggestion" ? "Tip" : "Insight"}</span>
              </div>

              {/* Navigation chevrons */}
              {insights.length > 1 && (
                <div className="flex items-center gap-1 relative z-10">
                  <button
                    onClick={handlePrevInsight}
                    className="p-1 rounded-full text-slate-500 hover:text-white hover:bg-slate-800/40 transition-all cursor-pointer"
                    title="Previous Insight"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button
                    onClick={handleNextInsight}
                    className="p-1 rounded-full text-slate-500 hover:text-white hover:bg-slate-800/40 transition-all cursor-pointer"
                    title="Next Insight"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              )}
            </div>

            <h3 className="text-base font-bold text-white mt-4 leading-snug">
              {activeInsight.title}
            </h3>
            <p className="text-[11px] text-slate-300 mt-2 leading-relaxed font-normal">
              {activeInsight.description}
            </p>
          </div>

          <div className="mt-6 flex flex-col gap-3">
            {/* Pagination Indicators */}
            {insights.length > 1 && (
              <div className="flex gap-1">
                {insights.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentInsightIdx(idx)}
                    className={`h-1 rounded-full transition-all cursor-pointer ${
                      idx === currentInsightIdx ? "w-4 bg-kolo-green" : "w-1.5 bg-slate-700"
                    }`}
                  />
                ))}
              </div>
            )}

            <button 
              onClick={() => setActiveTab("ai-assistant")}
              className="flex items-center gap-1 text-[11px] font-semibold text-kolo-green hover:text-kolo-green-hover transition-all group text-left w-fit cursor-pointer"
            >
              <span>{activeInsight.actionText || "Chat with AI Assistant"}</span>
              <ArrowUpRight size={12} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Upcoming Recurring Expenses Widget */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 gap-6">
        <div className="rounded-2xl bg-gradient-to-br from-[#090f0c] via-[#050907] to-[#020403] border border-emerald-950/40 p-6 shadow-xl relative overflow-hidden text-white">
          {/* Subtle Glow Overlay */}
          <div className="absolute top-0 right-0 h-48 w-48 rounded-full bg-emerald-500/5 blur-[80px]" />
          <div className="absolute bottom-0 left-10 h-32 w-32 rounded-full bg-kolo-green/5 blur-[60px]" />

          <div className="flex items-center justify-between mb-5 relative z-10">
            <div>
              <h2 className="text-md font-extrabold text-white tracking-tight">Upcoming bills & transfers</h2>
              <p className="text-xs text-slate-400 mt-0.5">Recurring outflows predicted in the next 14 days</p>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-kolo-green/10 border border-emerald-500/20 px-3 py-1 text-[10px] font-extrabold text-kolo-green uppercase tracking-wider">
              <span className="h-1.5 w-1.5 rounded-full bg-kolo-green animate-pulse" />
              <span>Smart Engine Active</span>
            </div>
          </div>

          {upcomingRecurring.length === 0 ? (
            <p className="text-xs text-slate-500 py-8 text-center relative z-10">No recurring bills due in the next 14 days.</p>
          ) : (
            <div className="grid grid-cols-2 gap-3 md:gap-4 sm:grid-cols-2 lg:grid-cols-4 relative z-10">
              {upcomingRecurring.map((item) => {
                const isUrgent = item.daysRemaining <= 2;
                return (
                  <div 
                    key={item.id} 
                    className={`relative rounded-xl border p-3.5 sm:p-4 transition-all duration-300 flex flex-col justify-between min-h-[115px] sm:min-h-[125px] group ${
                      isUrgent
                        ? "border-rose-500/30 bg-gradient-to-br from-rose-950/15 via-slate-900/60 to-slate-950/80 shadow-[0_0_20px_-5px_rgba(244,63,94,0.15)] hover:border-rose-500/50"
                        : "border-slate-800/80 bg-gradient-to-br from-slate-900/80 via-slate-900/50 to-slate-950/90 hover:border-emerald-500/30 hover:shadow-[0_0_20px_-5px_rgba(0,230,118,0.1)]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1.5">
                      <div className="flex items-center gap-2.5">
                        {/* Custom Visual Icons */}
                        <div className={`flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-full bg-slate-950 border transition-all duration-300 ${
                          isUrgent ? "border-rose-500/20 text-rose-400 group-hover:scale-105" : "border-slate-800 text-slate-300 group-hover:border-emerald-500/20 group-hover:scale-105"
                        }`}>
                          {item.title.toLowerCase().includes("mtn") ? (
                            <Smartphone size={13} className="text-amber-400" />
                          ) : item.title.toLowerCase().includes("netflix") ? (
                            <Tv size={13} className="text-rose-400" />
                          ) : item.title.toLowerCase().includes("spotify") ? (
                            <Tv size={13} className="text-emerald-400" />
                          ) : item.title.toLowerCase().includes("chatgpt") ? (
                            <Sparkles size={13} className="text-purple-400" />
                          ) : (
                            <Coins size={13} className="text-slate-400" />
                          )}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-bold text-slate-100 truncate leading-tight group-hover:text-white transition-colors">{item.title}</span>
                          <span className={`rounded px-1.5 py-0.2 text-[8px] font-extrabold tracking-wider uppercase w-fit mt-1.5 border border-slate-800/80 ${
                            item.bank === "GTBANK" ? "bg-orange-500/10 text-orange-400 border-orange-950/30" : 
                            item.bank === "KUDA" ? "bg-purple-500/10 text-purple-400 border-purple-950/30" :
                            "bg-emerald-500/10 text-kolo-green border-emerald-950/30"
                          }`}>
                            {item.bank}
                          </span>
                        </div>
                      </div>
                      <span className={`rounded-full px-2 py-0.5 text-[9px] font-extrabold shrink-0 tracking-wide uppercase ${
                        isUrgent
                          ? "bg-rose-500/15 text-rose-400 border border-rose-950/30 animate-pulse"
                          : item.daysRemaining <= 7
                          ? "bg-amber-500/15 text-amber-400 border border-amber-950/30"
                          : "bg-slate-800/60 text-slate-400 border border-slate-900"
                      }`}>
                        {item.daysRemaining === 0
                          ? "Due today"
                          : item.daysRemaining === 1
                          ? "Due tomorrow"
                          : `In ${item.daysRemaining} days`}
                      </span>
                    </div>
                    <div className="mt-4 flex items-end justify-between border-t border-slate-800/60 pt-2.5 shrink-0">
                      <div className="flex flex-col">
                        <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">Estimated</span>
                        <span className="text-xs font-black text-white mt-0.5 font-sans">₦{item.amount.toLocaleString("en-NG")}</span>
                      </div>
                      <button
                        onClick={() => setActiveTab("ai-assistant")}
                        className="text-[9px] font-extrabold text-kolo-green hover:text-kolo-green-hover transition-colors cursor-pointer group-hover:translate-x-0.5 transition-transform"
                      >
                        Adjust bill →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
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
