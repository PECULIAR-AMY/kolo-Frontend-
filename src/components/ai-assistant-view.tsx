"use client";

import React, { useState, useEffect, useRef } from "react";
import { useFinance } from "@/context/finance-context";
import { generateAIInsights, AIInsight } from "@/utils/ai-engine";
import { detectRecurringTransactions, RecurringItem } from "@/utils/recurring-engine";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Send,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  ArrowRight,
  User,
  CheckSquare,
  Square,
  HelpCircle,
  Car,
  Utensils,
  Smartphone,
  CreditCard,
  Tv,
  Coins
} from "lucide-react";

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: Date;
  richContent?: {
    type: "comparison" | "checklist" | "analysis" | "warnings" | "recurring";
    data: any;
  };
}

export default function AiAssistantView() {
  const { transactions, totalIncome, totalExpenses, savingsAmount, savingsRate, topCategoryName } = useFinance();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Checklist state for Savings calculator
  const [checkedSavings, setCheckedSavings] = useState<Record<string, boolean>>({});

  const insights = React.useMemo(() => generateAIInsights(transactions), [transactions]);

  // Initial welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: "welcome",
          sender: "ai",
          text: `Hello! I am Kolo AI, your personal financial copilot. I have analyzed your ${transactions.length} active transactions this month. 

I can help you audit your spending patterns, spot overspending warnings, and calculate custom savings suggestions. 

What would you like to explore today?`,
          timestamp: new Date(),
        },
      ]);
    }
  }, [transactions, messages.length]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const quickPrompts = [
    { label: "📊 Analyze my spending", query: "Analyze my spending this month" },
    { label: "📅 Upcoming subscriptions", query: "What are my upcoming subscriptions and bills?" },
    { label: "⚠️ Check overspending warnings", query: "Do I have any overspending warnings?" },
    { label: "💡 Custom savings suggestions", query: "Give me savings suggestions" },
    { label: "🚗 Compare Bolt vs. Food", query: "Compare Bolt vs Food & Dining" },
  ];

  // local engine to respond to questions
  const getAIResponse = (query: string): Omit<Message, "id" | "timestamp"> => {
    const q = query.toLowerCase();

    // 0. SMART RECURRING DETECTION & BILLING SCHEDULE
    if (q.includes("upcoming") || q.includes("recurring") || q.includes("subscription") || q.includes("bill") || q.includes("renew") || q.includes("netflix") || q.includes("spotify") || q.includes("mtn") || q.includes("chatgpt")) {
      const items = detectRecurringTransactions(transactions);
      const upcoming = items.filter(item => item.daysRemaining >= 0 && item.daysRemaining <= 30);

      if (upcoming.length === 0) {
        return {
          sender: "ai",
          text: "🔍 **No upcoming subscriptions detected.** I audited your active history but didn't identify any recurring billing patterns due in the next 30 days. You can import more transaction history to trigger automated cycle prediction!",
        };
      }

      const totalDue = upcoming.reduce((sum, item) => sum + item.amount, 0);

      return {
        sender: "ai",
        text: `📅 **Smart Billing Audit.** I scanned your history and identified **${upcoming.length} active recurring expenses** due in the next 30 days. You will need a total budget buffer of **₦${totalDue.toLocaleString("en-NG")}** to cover these upcoming withdrawals.

Here is your visual June 2026 payment calendar roadmap:`,
        richContent: {
          type: "recurring",
          data: {
            items: upcoming,
            totalDue,
          }
        }
      };
    }

    // 1. COMPARISON: Bolt vs Food
    if (q.includes("bolt") || q.includes("food") || q.includes("compare")) {
      const expenses = transactions.filter((t) => t.type === "expense");
      const boltTransactions = expenses.filter(t => t.title.toLowerCase().includes("bolt"));
      const boltTotal = boltTransactions.reduce((s, t) => s + t.amount, 0);

      const foodDining = expenses.filter(t => t.category === "Food & Dining").reduce((s, t) => s + t.amount, 0);
      const groceries = expenses.filter(t => t.category === "Groceries").reduce((s, t) => s + t.amount, 0);
      const foodTotal = foodDining + groceries;

      if (boltTotal === 0 && foodTotal === 0) {
        return {
          sender: "ai",
          text: "I checked your transactions but couldn't find any recorded Transport (Bolt) or Food transactions yet. Try uploading a CSV statement containing these categories to analyze!",
        };
      }

      const comparisonText = boltTotal > foodTotal
        ? `🚨 **Warning: High Transport Outflow.** You spent more on Bolt (₦${boltTotal.toLocaleString("en-NG")}) than food and groceries (₦${foodTotal.toLocaleString("en-NG")}) this month. That is ${((boltTotal / foodTotal)).toFixed(1)}x more on rides than on food! Downgrading Bolt frequency could immediately boost your savings rate.`
        : `✅ **Food & Groceries dominate.** You spent ₦${foodTotal.toLocaleString("en-NG")} on food and groceries, compared to ₦${boltTotal.toLocaleString("en-NG")} on Bolt rides. Food represents a healthy portion of your monthly survival budget.`;

      return {
        sender: "ai",
        text: comparisonText + "\n\nHere is a visual comparison of your Transport (Bolt) and Food spending:",
        richContent: {
          type: "comparison",
          data: {
            bolt: boltTotal,
            food: foodTotal,
            boltCount: boltTransactions.length,
          }
        }
      };
    }

    // 2. ANALYZE SPENDING
    if (q.includes("analyze") || q.includes("spending") || q.includes("summary")) {
      const topCat = topCategoryName || "None";
      const topCatAmt = expensesSummary().topCategoryAmt;
      
      return {
        sender: "ai",
        text: `Here is a high-level audit of your finances based on active records. You have recorded **₦${totalIncome.toLocaleString("en-NG")}** in total income and **₦${totalExpenses.toLocaleString("en-NG")}** in total expenses, leaving you with a solid savings buffer of **₦${savingsAmount.toLocaleString("en-NG")}** (${savingsRate.toFixed(1)}% savings rate). 

Your top spending avenue is **${topCat}**, accounting for ₦${topCatAmt.toLocaleString("en-NG")}.`,
        richContent: {
          type: "analysis",
          data: {
            income: totalIncome,
            expenses: totalExpenses,
            savings: savingsAmount,
            rate: savingsRate,
            topCategory: topCat,
            topCategoryAmt: topCatAmt,
          }
        }
      };
    }

    // 3. OVERSPENDING WARNINGS
    if (q.includes("warning") || q.includes("overspend") || q.includes("alert")) {
      const warnings = insights.filter(i => i.type === "warning");
      
      if (warnings.length === 0) {
        return {
          sender: "ai",
          text: "Excellent! I did not detect any immediate overspending alerts or financial risks in your transactions. Your spending relative to income remains safe, and there are no erratic category outlays.",
        };
      }

      return {
        sender: "ai",
        text: `I have identified **${warnings.length} warning alerts** regarding your outflow. Check out these overspending areas and consider capping budgets next month to prevent savings leakages:`,
        richContent: {
          type: "warnings",
          data: warnings
        }
      };
    }

    // 4. SAVINGS SUGGESTIONS
    if (q.includes("save") || q.includes("suggestion") || q.includes("saving") || q.includes("tip")) {
      // Calculate dynamic savings potentials
      const boltTotal = transactions.filter(t => t.title.toLowerCase().includes("bolt") || t.title.toLowerCase().includes("uber")).reduce((s, t) => s + t.amount, 0);
      const foodOut = transactions.filter(t => t.title.toLowerCase().includes("jumia") || t.title.toLowerCase().includes("republic") || t.title.toLowerCase().includes("cold stone")).reduce((s, t) => s + t.amount, 0);
      const subTotal = transactions.filter(t => t.category === "Subscriptions").reduce((s, t) => s + t.amount, 0);

      const items = [
        {
          id: "cook",
          label: "Reduce Jumia Food / fast food by 60% (cook at home)",
          value: foodOut > 0 ? Math.round(foodOut * 0.6) : 15000,
          desc: "Batch-prep simple meals instead of frequent single-orders."
        },
        {
          id: "commute",
          label: "Batch Uber/Bolt rides & off-peak commuting",
          value: boltTotal > 0 ? Math.round(boltTotal * 0.35) : 10000,
          desc: "Save on price surges by planning morning commutes earlier."
        },
        {
          id: "subs",
          label: "Cancel unused subscriptions (Netflix/AWS/etc.)",
          value: subTotal > 0 ? Math.round(subTotal * 0.4) : 8000,
          desc: "Audit recurring bills and pause accounts not used daily."
        },
        {
          id: "autosave",
          label: "Auto-save 10% of next incoming paycheck",
          value: totalIncome > 0 ? Math.round(totalIncome * 0.1) : 45000,
          desc: "Create an automated transfer trigger to 'pay yourself first'."
        }
      ];

      return {
        sender: "ai",
        text: `Here are **4 personalized action items** I generated for you. Use the **Interactive Savings Checklist** below to estimate exactly how much money you can reclaim next month:`,
        richContent: {
          type: "checklist",
          data: { items }
        }
      };
    }

    // DEFAULT FALLBACK
    return {
      sender: "ai",
      text: `Interesting question! While I don't have a direct answer for "${query}", I can inspect your transaction categories, run an automated budget audit, or compare Bolt vs Food spending. 

Try selecting one of the quick prompts below to get started!`,
    };
  };

  const expensesSummary = () => {
    const expenses = transactions.filter((t) => t.type === "expense");
    const catMap: Record<string, number> = {};
    expenses.forEach((t) => {
      catMap[t.category] = (catMap[t.category] || 0) + t.amount;
    });
    const sorted = Object.entries(catMap).sort((a, b) => b[1] - a[1]);
    return {
      topCategory: sorted[0]?.[0] || "None",
      topCategoryAmt: sorted[0]?.[1] || 0,
    };
  };

  const handleSend = (text: string) => {
    if (!text.trim()) return;

    // Add user message
    const userMsg: Message = {
      id: "user-" + Date.now(),
      sender: "user",
      text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsTyping(true);

    // Simulate thinking delay
    setTimeout(() => {
      const response = getAIResponse(text);
      const aiMsg: Message = {
        id: "ai-" + Date.now(),
        ...response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1200);
  };

  const toggleChecklist = (itemId: string, value: number) => {
    setCheckedSavings((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  const totalCalculatedSavings = (items: { id: string; value: number }[]) => {
    return items.reduce((sum, item) => {
      if (checkedSavings[item.id]) {
        return sum + item.value;
      }
      return sum;
    }, 0);
  };

  return (
    <div className="flex h-[calc(100vh-80px)] flex-col bg-kolo-light font-sans text-slate-800 pb-20 md:pb-0">
      {/* Upper header */}
      <div className="border-b border-slate-100 bg-white px-6 py-4 md:px-10 flex items-center justify-between shadow-sm">
        <div>
          <h1 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Sparkles className="text-kolo-green fill-kolo-green/20 h-5 w-5" />
            <span>Kolo AI Assistant</span>
          </h1>
          <p className="text-xs text-slate-400">Personalized spending patterns & saving recommendations</p>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] font-bold text-emerald-600">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Local Intel Engine Active</span>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 overflow-y-auto px-6 py-6 md:px-10 space-y-6">
        <div className="mx-auto max-w-3xl space-y-6">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 25 }}
                className={`flex gap-3.5 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {/* Avatar */}
                {msg.sender === "ai" && (
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-kolo-dark text-kolo-green border border-slate-800 shadow-md">
                    <Sparkles size={16} className="fill-kolo-green/25 animate-pulse" />
                  </div>
                )}

                {/* Message bubble */}
                <div
                  className={`max-w-[85%] rounded-2xl p-4 shadow-sm flex flex-col ${
                    msg.sender === "user"
                      ? "bg-kolo-dark text-white rounded-tr-none"
                      : "bg-white border border-slate-100 text-slate-800 rounded-tl-none"
                  }`}
                >
                  {/* Text body */}
                  <p className="text-xs leading-relaxed font-normal whitespace-pre-wrap">{msg.text}</p>

                  {/* RICH CUSTOM COMPONENT LAYOUTS (Recruiter Signals) */}
                  {msg.richContent && (
                    <div className="mt-4 border-t border-slate-100/80 pt-4 space-y-4">
                      {/* Rich Content Type: Comparison (Bolt vs Food) */}
                      {msg.richContent.type === "comparison" && (
                        <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 space-y-4">
                          <div className="grid grid-cols-2 gap-3 text-center">
                            <div className="p-3 bg-white rounded-lg border border-slate-100 shadow-sm flex flex-col justify-center items-center">
                              <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1 mb-1">
                                <Car size={12} className="text-purple-500" />
                                Bolt
                              </span>
                              <span className="text-sm font-black text-slate-800">
                                ₦{msg.richContent.data.bolt.toLocaleString("en-NG")}
                              </span>
                              <span className="text-[9px] text-slate-400 mt-0.5">
                                {msg.richContent.data.boltCount} rides
                              </span>
                            </div>
                            <div className="p-3 bg-white rounded-lg border border-slate-100 shadow-sm flex flex-col justify-center items-center">
                              <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1 mb-1">
                                <Utensils size={12} className="text-amber-500" />
                                Food & Dining
                              </span>
                              <span className="text-sm font-black text-slate-800">
                                ₦{msg.richContent.data.food.toLocaleString("en-NG")}
                              </span>
                              <span className="text-[9px] text-slate-400 mt-0.5">All meals</span>
                            </div>
                          </div>

                          {/* Custom Visual Bar Chart */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-[10px] font-bold text-slate-400 px-1">
                              <span>Bolt Commute</span>
                              <span>Food Supply</span>
                            </div>
                            <div className="h-3 w-full rounded-full bg-slate-200 overflow-hidden flex">
                              <div
                                className="bg-purple-500 h-full transition-all duration-500"
                                style={{
                                  width: `${(msg.richContent.data.bolt / (msg.richContent.data.bolt + msg.richContent.data.food)) * 100}%`
                                }}
                              />
                              <div
                                className="bg-amber-500 h-full transition-all duration-500"
                                style={{
                                  width: `${(msg.richContent.data.food / (msg.richContent.data.bolt + msg.richContent.data.food)) * 100}%`
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Rich Content Type: Analysis (Financial Health Grid) */}
                      {msg.richContent.type === "analysis" && (
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-100 flex flex-col justify-between">
                            <span className="text-[9px] uppercase font-bold text-slate-400">Total Income</span>
                            <span className="text-sm font-black text-slate-800 mt-1">
                              ₦{msg.richContent.data.income.toLocaleString("en-NG")}
                            </span>
                          </div>
                          <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-100 flex flex-col justify-between">
                            <span className="text-[9px] uppercase font-bold text-slate-400">Total Expenses</span>
                            <span className="text-sm font-black text-slate-800 mt-1">
                              ₦{msg.richContent.data.expenses.toLocaleString("en-NG")}
                            </span>
                          </div>
                          <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-100 flex flex-col justify-between">
                            <span className="text-[9px] uppercase font-bold text-slate-400">Savings Rate</span>
                            <span className="text-sm font-black text-kolo-green-dark mt-1 flex items-center gap-1">
                              <TrendingUp size={14} />
                              {msg.richContent.data.rate.toFixed(1)}%
                            </span>
                          </div>
                          <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-100 flex flex-col justify-between">
                            <span className="text-[9px] uppercase font-bold text-slate-400">Top Outflow</span>
                            <span className="text-xs font-black text-slate-800 mt-1 truncate">
                              {msg.richContent.data.topCategory}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Rich Content Type: Warnings (List of threats) */}
                      {msg.richContent.type === "warnings" && (
                        <div className="space-y-2.5">
                          {msg.richContent.data.map((warn: AIInsight) => (
                            <div key={warn.id} className="flex gap-3 p-3 bg-rose-500/5 rounded-xl border border-rose-500/10">
                              <AlertTriangle className="text-rose-500 shrink-0 mt-0.5" size={16} />
                              <div className="flex flex-col">
                                <span className="text-xs font-bold text-slate-800">{warn.title}</span>
                                <span className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{warn.description}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Rich Content Type: Savings Checklist (Interactive Calculator) */}
                      {msg.richContent.type === "checklist" && (
                        <div className="rounded-xl border border-emerald-950/20 bg-emerald-500/5 p-4 space-y-4">
                          <div className="flex justify-between items-center bg-white px-3.5 py-2.5 rounded-lg border border-emerald-500/10 shadow-sm">
                            <div className="flex flex-col">
                              <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-600">Total Potential Savings</span>
                              <span className="text-base font-black text-slate-900">
                                ₦{totalCalculatedSavings(msg.richContent.data.items).toLocaleString("en-NG")} / mo
                              </span>
                            </div>
                            <Coins className="text-emerald-500" size={24} />
                          </div>

                          <div className="space-y-3">
                            {msg.richContent.data.items.map((item: any) => {
                              const isChecked = !!checkedSavings[item.id];
                              return (
                                <button
                                  key={item.id}
                                  onClick={() => toggleChecklist(item.id, item.value)}
                                  className="w-full flex items-start gap-3 p-2.5 rounded-lg text-left bg-white hover:bg-slate-50/50 border border-slate-100 transition-colors shadow-xs group"
                                >
                                  <div className="shrink-0 mt-0.5 text-emerald-500 group-hover:scale-105 transition-transform">
                                    {isChecked ? (
                                      <CheckSquare size={16} className="fill-emerald-500/10" />
                                    ) : (
                                      <Square size={16} className="text-slate-300" />
                                    )}
                                  </div>
                                  <div className="flex flex-col flex-1 min-w-0">
                                    <div className="flex justify-between items-center gap-1.5">
                                      <span className={`text-xs font-bold ${isChecked ? "text-slate-500 line-through" : "text-slate-800"}`}>
                                        {item.label}
                                      </span>
                                      <span className="text-xs font-black text-emerald-600 shrink-0">
                                        +₦{item.value.toLocaleString("en-NG")}
                                      </span>
                                    </div>
                                    <span className="text-[10px] text-slate-400 mt-0.5 leading-normal">{item.desc}</span>
                                  </div>
                                </button>
                              );
                            })}
                          </div>

                          {totalCalculatedSavings(msg.richContent.data.items) >= 30000 && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="text-[10px] font-bold text-center bg-kolo-green text-kolo-dark rounded-lg p-2 uppercase tracking-wider"
                            >
                              🎉 Excellent goal! You will save ₦{totalCalculatedSavings(msg.richContent.data.items).toLocaleString("en-NG")} next month!
                            </motion.div>
                          )}
                        </div>
                      )}

                      {/* Rich Content Type: Recurring Subscriptions Roadmap (fintech behavior) */}
                      {msg.richContent.type === "recurring" && (
                        <div className="rounded-xl border border-emerald-950 bg-[#050a07] p-4 space-y-4 font-sans text-white relative overflow-hidden shadow-xl">
                          <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-emerald-500/5 blur-[50px] pointer-events-none" />

                          <div className="flex justify-between items-center bg-slate-900/60 backdrop-blur-md px-3.5 py-2.5 rounded-lg border border-emerald-950 shadow-xs">
                            <div className="flex flex-col">
                              <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-400">Total Monthly Outflow</span>
                              <span className="text-sm font-black text-white mt-1">
                                ₦{msg.richContent.data.totalDue.toLocaleString("en-NG")}
                              </span>
                            </div>
                            <span className="text-[9px] font-extrabold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded text-kolo-green uppercase tracking-wider">
                              June 2026
                            </span>
                          </div>

                          {/* Horizontal Timeline Visualization */}
                          <div className="space-y-1 bg-slate-900/40 border border-slate-900 p-3.5 rounded-lg relative overflow-hidden">
                            <div className="text-[9px] uppercase font-bold text-slate-400 mb-2">June Payment Roadmap</div>
                            
                            {/* Visual Timeline Track */}
                            <div className="relative h-12 flex items-center justify-between border-t border-slate-800/50 pt-2 px-1 mt-2">
                              {/* Horizontal Line */}
                              <div className="absolute top-5 left-1 right-1 h-0.5 bg-slate-800" />
                              
                              {/* Standard Timeline dates markers */}
                              <span className="absolute top-8 left-1 text-[8px] font-bold text-slate-500">June 1</span>
                              <span className="absolute top-8 left-[33%] text-[8px] font-bold text-slate-500">June 10</span>
                              <span className="absolute top-8 left-[66%] text-[8px] font-bold text-slate-500">June 20</span>
                              <span className="absolute top-8 right-1 text-[8px] font-bold text-slate-500">June 30</span>

                              {/* Map icons dynamically on their due days */}
                              {msg.richContent.data.items.map((item: any, idx: number) => {
                                const dueDate = new Date(item.nextDueDate);
                                const dayOfMonth = dueDate.getDate();
                                // Calculate percentage position along June (1 to 30)
                                const percent = ((dayOfMonth - 1) / 29) * 90 + 5; // bound position to 5% - 95%
                                
                                return (
                                  <div
                                    key={idx}
                                    className="absolute -top-1 flex flex-col items-center group cursor-help transition-all duration-300"
                                    style={{ left: `${percent}%` }}
                                    title={`${item.title} - ₦${item.amount.toLocaleString("en-NG")} on June ${dayOfMonth}`}
                                  >
                                    <div className="w-5 h-5 rounded-full bg-slate-950 text-kolo-green flex items-center justify-center text-[8px] font-black shadow-xs border border-emerald-500/40 hover:border-kolo-green hover:scale-115 transition-all duration-300 animate-pulse">
                                      {item.title.toLowerCase().includes("netflix") ? "N" : item.title.toLowerCase().includes("spotify") ? "S" : item.title.toLowerCase().includes("chatgpt") ? "C" : item.title.toLowerCase().includes("mtn") ? "M" : "T"}
                                    </div>
                                    <span className="text-[7px] font-black text-slate-400 mt-1">
                                      {dayOfMonth}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* List of items */}
                          <div className="space-y-2 pt-1">
                            {msg.richContent.data.items.map((item: any) => {
                              const isUrgent = item.daysRemaining <= 2;
                              return (
                                <div key={item.id} className={`flex items-center justify-between p-2.5 rounded-lg border transition-all duration-300 ${
                                  isUrgent 
                                    ? "bg-rose-950/15 border-rose-950/50 hover:border-rose-500/40" 
                                    : "bg-slate-900/40 border-slate-900/60 hover:border-emerald-950/60"
                                }`}>
                                  <div className="flex items-center gap-2.5">
                                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                      isUrgent ? "bg-rose-500 animate-pulse" : item.daysRemaining <= 7 ? "bg-amber-500" : "bg-emerald-500"
                                    }`} />
                                    <div className="flex flex-col min-w-0">
                                      <span className="text-xs font-bold text-slate-100 truncate">{item.title}</span>
                                      <span className="text-[9px] text-slate-500 mt-0.5">
                                        Last paid: {new Date(item.lastDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex flex-col items-end shrink-0">
                                    <span className="text-xs font-black text-slate-100">
                                      ₦{item.amount.toLocaleString("en-NG")}
                                    </span>
                                    <span className={`text-[8px] font-extrabold uppercase mt-0.5 tracking-wider ${
                                      isUrgent ? "text-rose-400 animate-pulse" : "text-slate-400"
                                    }`}>
                                      {item.daysRemaining === 0 ? "Due today" : item.daysRemaining === 1 ? "Due tomorrow" : `Due in ${item.daysRemaining} days`}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Timestamp */}
                  <span className={`text-[9px] mt-1.5 ${msg.sender === "user" ? "text-slate-400 text-right" : "text-slate-400 text-left"}`}>
                    {msg.timestamp.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })}
                  </span>
                </div>

                {/* User avatar */}
                {msg.sender === "user" && (
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-kolo-green text-kolo-dark font-bold shadow-md">
                    <User size={16} />
                  </div>
                )}
              </motion.div>
            ))}

            {/* AI Typing indicator */}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="flex gap-3.5 justify-start"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-kolo-dark text-kolo-green border border-slate-800 shadow-md">
                  <Sparkles size={16} className="fill-kolo-green/20 animate-pulse" />
                </div>
                <div className="bg-white border border-slate-100 text-slate-800 rounded-2xl rounded-tl-none p-4 shadow-sm flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest animate-pulse">Analyzing...</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Suggested chips panel (only visible if not typing) */}
      {!isTyping && (
        <div className="px-6 py-2 md:px-10 border-t border-slate-50 bg-white">
          <div className="mx-auto max-w-3xl flex gap-2 overflow-x-auto py-2 scrollbar-none">
            {quickPrompts.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(chip.query)}
                className="flex-none rounded-full bg-slate-50 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 border border-slate-100 hover:border-emerald-200/50 px-3.5 py-1.5 text-xs font-semibold transition-all active:scale-95 cursor-pointer shadow-xs"
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Inputs form */}
      <div className="p-4 bg-white border-t border-slate-100">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(inputValue);
          }}
          className="mx-auto max-w-3xl flex gap-3 relative"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask Kolo AI (e.g. 'Compare Bolt vs Food', 'Am I overspending?')..."
            className="flex-1 rounded-full bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200 focus:border-kolo-green focus:outline-none px-5 py-3.5 text-xs transition-all shadow-inner text-slate-800 pr-12 font-medium placeholder-slate-400"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isTyping}
            className="absolute right-2 top-2 h-10 w-10 flex items-center justify-center rounded-full bg-kolo-dark text-kolo-green hover:text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer active:scale-95 shadow-sm"
          >
            <Send size={14} />
          </button>
        </form>
      </div>
    </div>
  );
}
