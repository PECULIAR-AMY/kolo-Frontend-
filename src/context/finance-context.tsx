"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from "react";

export interface Transaction {
  id: string;
  title: string;
  type: "income" | "expense";
  amount: number;
  category: string;
  bank: "KUDA" | "GTBANK" | "OPAY" | "PALMPAY" | "MONIEPOINT";
  subtitle: string;
  date: string; // ISO format string
}

export type TabType = "dashboard" | "transactions" | "import" | "ai-assistant";

interface FinanceContextType {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  transactions: Transaction[];
  addTransaction: (t: Omit<Transaction, "id">) => void;
  updateTransaction: (id: string, t: Omit<Transaction, "id">) => void;
  deleteTransaction: (id: string) => void;
  importTransactions: (ts: Omit<Transaction, "id">[]) => void;
  resetToDefault: () => void;
  
  // Computed metrics
  totalIncome: number;
  totalExpenses: number;
  savingsAmount: number;
  savingsRate: number;
  topCategoryName: string;
  topCategoryAmount: number;
  categoryPercentages: { name: string; amount: number; percentage: number; color: string }[];
  dailyChartData: { day: number; amount: number }[];
  recentActivity: Transaction[];
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

// Seed Data perfectly matching the screenshots
const SEED_TRANSACTIONS: Transaction[] = [
  // --- HISTORICAL RECURRING SUBSCRIPTIONS & TRANSFERS ---
  {
    id: "exp-netflix-april",
    title: "Netflix",
    type: "expense",
    amount: 5500,
    category: "Subscriptions",
    bank: "GTBANK",
    subtitle: "Subscriptions · NETFLIX.COM SUBSCRIPTION",
    date: "2026-04-27T22:11:00",
  },
  {
    id: "exp-spotify-may",
    title: "Spotify Premium",
    type: "expense",
    amount: 2500,
    category: "Subscriptions",
    bank: "KUDA",
    subtitle: "Subscriptions · SPOTIFY INDIVIDUAL NG",
    date: "2026-05-12T10:14:00",
  },
  {
    id: "exp-spotify-april",
    title: "Spotify Premium",
    type: "expense",
    amount: 2500,
    category: "Subscriptions",
    bank: "KUDA",
    subtitle: "Subscriptions · SPOTIFY INDIVIDUAL NG",
    date: "2026-04-12T10:14:00",
  },
  {
    id: "exp-mtn-may26",
    title: "MTN Renewal",
    type: "expense",
    amount: 5000,
    category: "Airtime & Data",
    bank: "OPAY",
    subtitle: "Airtime & Data · MTN DATA RENEWAL 10GB",
    date: "2026-05-26T08:00:00",
  },
  {
    id: "exp-mtn-may19",
    title: "MTN Renewal",
    type: "expense",
    amount: 5000,
    category: "Airtime & Data",
    bank: "OPAY",
    subtitle: "Airtime & Data · MTN DATA RENEWAL 10GB",
    date: "2026-05-19T08:00:00",
  },
  {
    id: "exp-mtn-may12",
    title: "MTN Renewal",
    type: "expense",
    amount: 5000,
    category: "Airtime & Data",
    bank: "OPAY",
    subtitle: "Airtime & Data · MTN DATA RENEWAL 10GB",
    date: "2026-05-12T08:00:00",
  },
  {
    id: "exp-mtn-may05",
    title: "MTN Renewal",
    type: "expense",
    amount: 5000,
    category: "Airtime & Data",
    bank: "OPAY",
    subtitle: "Airtime & Data · MTN DATA RENEWAL 10GB",
    date: "2026-05-05T08:00:00",
  },
  {
    id: "exp-chatgpt-may",
    title: "ChatGPT Plus",
    type: "expense",
    amount: 18000,
    category: "Subscriptions",
    bank: "GTBANK",
    subtitle: "Subscriptions · OPENAI CHATGPT PLUS",
    date: "2026-05-10T14:30:00",
  },
  {
    id: "exp-chatgpt-april",
    title: "ChatGPT Plus",
    type: "expense",
    amount: 18000,
    category: "Subscriptions",
    bank: "GTBANK",
    subtitle: "Subscriptions · OPENAI CHATGPT PLUS",
    date: "2026-04-10T14:30:00",
  },
  {
    id: "exp-rent-april",
    title: "Rent Contribution",
    type: "expense",
    amount: 150000,
    category: "Transfers",
    bank: "KUDA",
    subtitle: "Transfers · RENT FOR APRIL",
    date: "2026-04-02T10:00:00",
  },
  {
    id: "exp-savings-april",
    title: "Transfer to Savings",
    type: "expense",
    amount: 50000,
    category: "Transfers",
    bank: "GTBANK",
    subtitle: "Transfers · SAVINGS ACCOUNT TOP-UP",
    date: "2026-04-15T12:00:00",
  },
  // --- THURSDAY, MAY 28 ---
  {
    id: "exp-1",
    title: "Uber",
    type: "expense",
    amount: 3200,
    category: "Transport",
    bank: "KUDA",
    subtitle: "Transport · UBER BV AMSTERDAM NL",
    date: "2026-05-28T09:04:00",
  },
  {
    id: "inc-1",
    title: "Salary — Paystack Ltd",
    type: "income",
    amount: 850000,
    category: "Income",
    bank: "GTBANK",
    subtitle: "Income · NIP/PAYSTACK PAYMENTS/SALARY MAY",
    date: "2026-05-28T08:12:00",
  },
  
  // --- WEDNESDAY, MAY 27 ---
  {
    id: "exp-2",
    title: "Netflix",
    type: "expense",
    amount: 5500,
    category: "Subscriptions",
    bank: "GTBANK",
    subtitle: "Subscriptions · NETFLIX.COM SUBSCRIPTION",
    date: "2026-05-27T22:11:00",
  },
  {
    id: "exp-3",
    title: "Chicken Republic",
    type: "expense",
    amount: 7800,
    category: "Food & Dining",
    bank: "OPAY",
    subtitle: "Food & Dining · POS/CHICKEN REP LEKKI",
    date: "2026-05-27T19:30:00",
  },
  {
    id: "exp-4",
    title: "Bolt",
    type: "expense",
    amount: 2750,
    category: "Transport",
    bank: "PALMPAY",
    subtitle: "Transport · BOLT OPERATIONS NG VI",
    date: "2026-05-27T14:22:00",
  },

  // --- MONDAY, MAY 25 ---
  {
    id: "exp-jumia",
    title: "Jumia Food",
    type: "expense",
    amount: 9450,
    category: "Food & Dining",
    bank: "OPAY",
    subtitle: "Food & Dining · JUMIA FOOD ORDER #884221",
    date: "2026-05-25T20:14:00",
  },
  {
    id: "inc-google",
    title: "Consulting — Google Ireland",
    type: "income",
    amount: 186800,
    category: "Income",
    bank: "KUDA",
    subtitle: "Income · WIRE TRANSFER OUTBOUND GOOGLE IRL",
    date: "2026-05-25T10:15:00",
  },
  {
    id: "exp-pos",
    title: "POS Withdrawal",
    type: "expense",
    amount: 20000,
    category: "POS & Cash",
    bank: "MONIEPOINT",
    subtitle: "POS & Cash · POS WDL/MONIEPOINT AGT/IKEJA",
    date: "2026-05-25T09:12:00",
  },

  // --- SUNDAY, MAY 24 ---
  {
    id: "exp-shoprite",
    title: "Shoprite",
    type: "expense",
    amount: 28400,
    category: "Groceries",
    bank: "GTBANK",
    subtitle: "Groceries · SHOPRITE LEKKI MALL",
    date: "2026-05-24T16:33:00",
  },
  {
    id: "exp-bolt-24",
    title: "Bolt",
    type: "expense",
    amount: 3100,
    category: "Transport",
    bank: "PALMPAY",
    subtitle: "Transport · BOLT TRIP DOWNTOWN",
    date: "2026-05-24T08:02:00",
  },

  // --- SATURDAY, MAY 23 ---
  {
    id: "exp-sporty",
    title: "SportyBet",
    type: "expense",
    amount: 5000,
    category: "Betting",
    bank: "PALMPAY",
    subtitle: "Betting · SPORTYBET DEPOSIT/PALMPAY",
    date: "2026-05-23T21:00:00",
  },
  {
    id: "exp-airtel-23",
    title: "Airtel Data",
    type: "expense",
    amount: 6500,
    category: "Airtime & Data",
    bank: "KUDA",
    subtitle: "Airtime & Data · AIRTEL 15GB MONTHLY",
    date: "2026-05-23T11:17:00",
  },

  // --- FRIDAY, MAY 22 ---
  {
    id: "exp-spar-22",
    title: "Spar VI Shopping",
    type: "expense",
    amount: 12100,
    category: "Groceries",
    bank: "GTBANK",
    subtitle: "Groceries · SPAR RETAIL MALL",
    date: "2026-05-22T11:10:00",
  },
  {
    id: "exp-airtel-22",
    title: "Airtel Data",
    type: "expense",
    amount: 7700,
    category: "Airtime & Data",
    bank: "KUDA",
    subtitle: "Airtime & Data · AIRTEL DATA TOPUP",
    date: "2026-05-22T15:40:00",
  },

  // --- OLDER TRANSACTIONS IN MAY 2026 (Sums to 277,800 to make total 389,300) ---
  {
    id: "exp-old-1",
    title: "Rent Contribution",
    type: "expense",
    amount: 150000,
    category: "Transfers",
    bank: "KUDA",
    subtitle: "Transfers · RENT FOR MAY",
    date: "2026-05-02T10:00:00",
  },
  {
    id: "exp-old-2",
    title: "Transfer to Savings",
    type: "expense",
    amount: 50000,
    category: "Transfers",
    bank: "GTBANK",
    subtitle: "Transfers · SAVINGS ACCOUNT TOP-UP",
    date: "2026-05-15T12:00:00",
  },
  {
    id: "exp-old-3",
    title: "Shoprite Supermarket",
    type: "expense",
    amount: 18700,
    category: "Groceries",
    bank: "GTBANK",
    subtitle: "Groceries · SHOPRITE BULK GROCERIES",
    date: "2026-05-05T15:20:00",
  },
  {
    id: "exp-old-4",
    title: "AWS Cloud Services",
    type: "expense",
    amount: 36000,
    category: "Subscriptions",
    bank: "KUDA",
    subtitle: "Subscriptions · AMAZON WEB SERVICES AMZN.COM/BILL",
    date: "2026-05-18T02:00:00",
  },
  {
    id: "exp-old-5",
    title: "Cold Stone Creamery",
    type: "expense",
    amount: 15450,
    category: "Food & Dining",
    bank: "OPAY",
    subtitle: "Food & Dining · POS/COLD STONE LEKKI",
    date: "2026-05-18T14:30:00",
  },
  {
    id: "exp-old-6",
    title: "Utility Bill",
    type: "expense",
    amount: 7650,
    category: "Bills & Utilities",
    bank: "GTBANK",
    subtitle: "Bills & Utilities · PHCN ELECTRICITY BILL",
    date: "2026-05-20T12:00:00",
  }
];

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const local = localStorage.getItem("kolo_transactions");
    if (local) {
      try {
        setTransactions(JSON.parse(local));
      } catch (e) {
        setTransactions(SEED_TRANSACTIONS);
      }
    } else {
      setTransactions(SEED_TRANSACTIONS);
      localStorage.setItem("kolo_transactions", JSON.stringify(SEED_TRANSACTIONS));
    }
    setMounted(true);
  }, []);

  const addTransaction = React.useCallback((t: Omit<Transaction, "id">) => {
    const newT: Transaction = {
      ...t,
      id: "tx-" + Math.random().toString(36).substr(2, 9),
    };
    setTransactions((prev) => {
      const next = [newT, ...prev];
      localStorage.setItem("kolo_transactions", JSON.stringify(next));
      return next;
    });
  }, []);

  const updateTransaction = React.useCallback((id: string, updated: Omit<Transaction, "id">) => {
    setTransactions((prev) => {
      const next = prev.map((t) => (t.id === id ? { ...updated, id } : t));
      localStorage.setItem("kolo_transactions", JSON.stringify(next));
      return next;
    });
  }, []);

  const deleteTransaction = React.useCallback((id: string) => {
    setTransactions((prev) => {
      const next = prev.filter((t) => t.id !== id);
      localStorage.setItem("kolo_transactions", JSON.stringify(next));
      return next;
    });
  }, []);

  const importTransactions = React.useCallback((newTs: Omit<Transaction, "id">[]) => {
    const prepared = newTs.map((t) => ({
      ...t,
      id: "tx-" + Math.random().toString(36).substr(2, 9),
    }));
    setTransactions((prev) => {
      const next = [...prepared, ...prev];
      localStorage.setItem("kolo_transactions", JSON.stringify(next));
      return next;
    });
  }, []);

  const resetToDefault = React.useCallback(() => {
    setTransactions(SEED_TRANSACTIONS);
    localStorage.setItem("kolo_transactions", JSON.stringify(SEED_TRANSACTIONS));
  }, []);

  // Compute stats
  const stats = useMemo(() => {
    const incomeList = transactions.filter((t) => t.type === "income");
    const expenseList = transactions.filter((t) => t.type === "expense");

    const totalIncome = incomeList.reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = expenseList.reduce((sum, t) => sum + t.amount, 0);

    const savingsAmount = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? (savingsAmount / totalIncome) * 100 : 0;

    // Group expenses by category
    const catMap: Record<string, number> = {};
    expenseList.forEach((t) => {
      catMap[t.category] = (catMap[t.category] || 0) + t.amount;
    });

    const sortedCats = Object.entries(catMap)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount);

    const topCategoryName = sortedCats[0]?.name || "None";
    const topCategoryAmount = sortedCats[0]?.amount || 0;

    // Map top 5 categories & color palette
    const colors = [
      "#008080", // Teal/Blue-Green (Transfers)
      "#F97316", // Orange (Food & Dining)
      "#22C55E", // Green (Groceries)
      "#3B82F6", // Blue (Subscriptions)
      "#EF4444", // Red/Dark Orange (POS & Cash)
      "#A855F7", // Purple (Transport)
      "#EAB308", // Yellow (Other)
    ];

    const categoryPercentages = sortedCats.slice(0, 5).map((c, i) => ({
      name: c.name,
      amount: c.amount,
      percentage: totalExpenses > 0 ? (c.amount / totalExpenses) * 100 : 0,
      color: colors[i % colors.length],
    }));

    // Group daily expense trends for May 2026 (days 2 to 28)
    const dailyMap: Record<number, number> = {};
    // Seed days 2 to 28 with 0
    for (let d = 2; d <= 28; d++) {
      dailyMap[d] = 0;
    }

    expenseList.forEach((t) => {
      const date = new Date(t.date);
      if (date.getFullYear() === 2026 && date.getMonth() === 4) { // May
        const day = date.getDate();
        if (day >= 2 && day <= 28) {
          dailyMap[day] += t.amount;
        }
      }
    });

    const dailyChartData = Object.entries(dailyMap)
      .map(([dayStr, amount]) => ({
        day: parseInt(dayStr),
        amount,
      }))
      .sort((a, b) => a.day - b.day);

    // Recent Activity: Sort by date desc (exclude income? No, screenshots show Salary in recent activity! Let's display both, and sort by date desc)
    const recentActivity = [...transactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 6);

    return {
      totalIncome,
      totalExpenses,
      savingsAmount,
      savingsRate,
      topCategoryName,
      topCategoryAmount,
      categoryPercentages,
      dailyChartData,
      recentActivity,
    };
  }, [transactions]);

  if (!mounted) {
    // Return placeholder states during SSR to avoid mismatch hydration issues
    return (
      <FinanceContext.Provider
        value={{
          activeTab,
          setActiveTab,
          transactions: [],
          addTransaction: () => {},
          updateTransaction: () => {},
          deleteTransaction: () => {},
          importTransactions: () => {},
          resetToDefault: () => {},
          totalIncome: 1036800,
          totalExpenses: 389300,
          savingsAmount: 647500,
          savingsRate: 62.5,
          topCategoryName: "Transfers",
          topCategoryAmount: 65000,
          categoryPercentages: [],
          dailyChartData: [],
          recentActivity: [],
        }}
      >
        <div style={{ visibility: "hidden" }}>{children}</div>
      </FinanceContext.Provider>
    );
  }

  return (
    <FinanceContext.Provider
      value={{
        activeTab,
        setActiveTab,
        transactions,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        importTransactions,
        resetToDefault,
        ...stats,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error("useFinance must be used within a FinanceProvider");
  }
  return context;
}
