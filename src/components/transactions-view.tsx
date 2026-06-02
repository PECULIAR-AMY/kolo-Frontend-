"use client";

import React, { useState, useMemo } from "react";
import { useFinance, Transaction } from "@/context/finance-context";
import { 
  Search, 
  Trash2, 
  Edit2, 
  Plus, 
  X,
  Car, 
  Wallet, 
  Utensils, 
  RefreshCw, 
  ShoppingCart, 
  Smartphone, 
  ArrowLeftRight, 
  CreditCard, 
  Trophy, 
  Zap, 
  Tv, 
  ShoppingBag, 
  HelpCircle 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Helper to get transaction category icon
const getCategoryIcon = (category: string, type: "income" | "expense") => {
  if (type === "income") return <Wallet className="h-5 w-5 text-slate-500" />;
  
  switch (category) {
    case "Transport":
      return <Car className="h-5 w-5 text-slate-500" />;
    case "Food & Dining":
      return <Utensils className="h-5 w-5 text-slate-500" />;
    case "Subscriptions":
      return <RefreshCw className="h-5 w-5 text-slate-500" />;
    case "Groceries":
      return <ShoppingCart className="h-5 w-5 text-slate-500" />;
    case "Airtime & Data":
      return <Smartphone className="h-5 w-5 text-slate-500" />;
    case "Transfers":
      return <ArrowLeftRight className="h-5 w-5 text-slate-500" />;
    case "POS & Cash":
      return <CreditCard className="h-5 w-5 text-slate-500" />;
    case "Betting":
      return <Trophy className="h-5 w-5 text-slate-500" />;
    case "Bills & Utilities":
      return <Zap className="h-5 w-5 text-slate-500" />;
    case "Entertainment":
      return <Tv className="h-5 w-5 text-slate-500" />;
    case "Shopping":
      return <ShoppingBag className="h-5 w-5 text-slate-500" />;
    default:
      return <HelpCircle className="h-5 w-5 text-slate-500" />;
  }
};

// Helper to get bank badge styling
const getBankBadgeStyle = (bank: Transaction["bank"]) => {
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
    default:
      return "bg-slate-100 text-slate-600";
  }
};

export default function TransactionsView({ 
  isFormOpen, 
  setIsFormOpen, 
  editingTx, 
  setEditingTx 
}: { 
  isFormOpen: boolean; 
  setIsFormOpen: (open: boolean) => void;
  editingTx: Transaction | null;
  setEditingTx: (tx: Transaction | null) => void;
}) {
  const { transactions, addTransaction, updateTransaction, deleteTransaction, resetToDefault } = useFinance();
  
  // Search & Filter state
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState<"all" | "spent" | "received">("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  // Form states (managed locally, synced on modal open)
  const [formTitle, setFormTitle] = useState("");
  const [formSubtitle, setFormSubtitle] = useState("");
  const [formType, setFormType] = useState<"income" | "expense">("expense");
  const [formAmount, setFormAmount] = useState("");
  const [formCategory, setFormCategory] = useState("Other");
  const [formBank, setFormBank] = useState<Transaction["bank"]>("GTBANK");
  const [formDate, setFormDate] = useState("");

  const categories = [
    "Transport",
    "Food & Dining",
    "Groceries",
    "Bills & Utilities",
    "Airtime & Data",
    "Subscriptions",
    "Entertainment",
    "Transfers",
    "POS & Cash",
    "Income",
    "Shopping",
    "Betting"
  ];

  // Filtered transactions
  const filteredTxs = useMemo(() => {
    return transactions.filter((t) => {
      // 1. Search text matches title, subtitle, category or bank
      const matchesSearch = 
        t.title.toLowerCase().includes(search.toLowerCase()) || 
        t.subtitle.toLowerCase().includes(search.toLowerCase()) ||
        t.category.toLowerCase().includes(search.toLowerCase());
      
      // 2. Filter by transaction type: all, spent (expense), received (income)
      let matchesType = true;
      if (selectedType === "spent") matchesType = t.type === "expense";
      else if (selectedType === "received") matchesType = t.type === "income";

      // 3. Filter by category pill selection
      const matchesCategory = selectedCategory === "All" || t.category === selectedCategory;

      return matchesSearch && matchesType && matchesCategory;
    });
  }, [transactions, search, selectedType, selectedCategory]);

  // Group transactions by day and calculate daily spent
  const groupedTxs = useMemo(() => {
    // Sort transactions by date descending
    const sorted = [...filteredTxs].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const groups: Record<string, { dateStr: string; dayExpenses: number; txs: Transaction[] }> = {};

    sorted.forEach((tx) => {
      const d = new Date(tx.date);
      // Format day header: e.g., "THURSDAY, MAY 28"
      const dateStr = d.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric"
      }).toUpperCase();

      if (!groups[dateStr]) {
        groups[dateStr] = {
          dateStr,
          dayExpenses: 0,
          txs: []
        };
      }

      groups[dateStr].txs.push(tx);
      if (tx.type === "expense") {
        groups[dateStr].dayExpenses += tx.amount;
      }
    });

    return Object.values(groups);
  }, [filteredTxs]);

  // Subtitle/Date formatter: e.g., "May 28 · 09:04"
  const formatDateSub = (dateStr: string) => {
    const d = new Date(dateStr);
    const month = d.toLocaleDateString("en-US", { month: "short" });
    const day = d.getDate();
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return `${month} ${day} · ${hours}:${minutes}`;
  };

  // Open form for adding
  const handleNewClick = () => {
    setEditingTx(null);
    setFormTitle("");
    setFormSubtitle("");
    setFormType("expense");
    setFormAmount("");
    setFormCategory("Other");
    setFormBank("GTBANK");
    // Default to current local date/time
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    setFormDate(now.toISOString().slice(0, 16));
    setIsFormOpen(true);
  };

  // Open form for editing
  const handleEditClick = (tx: Transaction) => {
    setEditingTx(tx);
    setFormTitle(tx.title);
    setFormSubtitle(tx.subtitle);
    setFormType(tx.type);
    setFormAmount(tx.amount.toString());
    setFormCategory(tx.category);
    setFormBank(tx.bank);
    // Format date string for datetime-local input
    const d = new Date(tx.date);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    setFormDate(d.toISOString().slice(0, 16));
    setIsFormOpen(true);
  };

  // Form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formAmount || isNaN(Number(formAmount))) return;

    // Standardize subtitle format: "Category · SUBTITLE TEXT IN UPPERCASE"
    const cleanedSub = formSubtitle || `${formCategory} · ${formTitle.toUpperCase()}`;

    const payload = {
      title: formTitle,
      subtitle: cleanedSub,
      type: formType,
      amount: Math.abs(Number(formAmount)),
      category: formCategory,
      bank: formBank,
      date: new Date(formDate).toISOString(),
    };

    if (editingTx) {
      updateTransaction(editingTx.id, payload);
    } else {
      addTransaction(payload);
    }
    setIsFormOpen(false);
  };

  // Form Category helper logic
  const handleCategoryChange = (cat: string) => {
    setFormCategory(cat);
    // Auto-update standard income category
    if (cat === "Income") {
      setFormType("income");
    } else if (formType === "income" && cat !== "Income") {
      setFormType("expense");
    }
  };

  const [isMobileView, setIsMobileView] = useState(false);

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 640);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="px-4 py-4 md:px-10 md:py-6 space-y-6">
      {/* Filtering Actions Panel */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative w-full sm:max-w-lg">
          <Search className="absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search merchant, narration, category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-full border border-slate-200 bg-white pl-11 pr-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all focus:border-slate-350 focus:bg-white"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Spent / Received toggle */}
          <div className="flex items-center rounded-full bg-slate-100 p-1 border border-slate-250/20 flex-1 sm:flex-none justify-between">
            <button
              onClick={() => setSelectedType("all")}
              className={`flex-1 sm:flex-none rounded-full px-3.5 sm:px-4.5 py-1.5 text-xs font-bold transition-all ${
                selectedType === "all"
                  ? "bg-slate-950 text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedType("spent")}
              className={`flex-1 sm:flex-none rounded-full px-3.5 sm:px-4.5 py-1.5 text-xs font-bold transition-all ${
                selectedType === "spent"
                  ? "bg-slate-950 text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Spent
            </button>
            <button
              onClick={() => setSelectedType("received")}
              className={`flex-1 sm:flex-none rounded-full px-3.5 sm:px-4.5 py-1.5 text-xs font-bold transition-all ${
                selectedType === "received"
                  ? "bg-slate-950 text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Received
            </button>
          </div>

          {/* Create Button */}
          <button
            onClick={handleNewClick}
            className="flex items-center gap-1.5 rounded-full bg-kolo-green px-4.5 py-2.5 text-xs font-black text-kolo-dark hover:bg-kolo-green-hover transition-colors active:scale-95 cursor-pointer shadow-sm"
          >
            <Plus size={14} className="stroke-[3]" />
            <span>New</span>
          </button>

          {/* Reset Seeding Data */}
          <button
            onClick={resetToDefault}
            className="rounded-full border border-slate-200 bg-white hover:bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-slate-500 transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Category Pills Row */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4 md:-mx-10 md:px-10">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(isSelected ? "All" : cat)}
              className={`rounded-full px-4.5 py-1.5 text-xs font-bold whitespace-nowrap border transition-all ${
                isSelected 
                  ? "bg-slate-950 border-slate-950 text-white" 
                  : "bg-white border-slate-200/80 text-slate-650 hover:bg-slate-50"
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Grouped Day-by-Day List */}
      <div className="space-y-6">
        {groupedTxs.length === 0 ? (
          <div className="rounded-3xl bg-white border border-slate-100 p-12 text-center text-slate-400 font-semibold shadow-sm">
            No transactions match your search filters.
          </div>
        ) : (
          groupedTxs.map((group) => (
            <div key={group.dateStr} className="space-y-2">
              {/* Day Header */}
              <div className="flex items-center justify-between text-[10px] sm:text-xs font-black tracking-wider text-slate-400 px-1 uppercase">
                <span>{group.dateStr}</span>
                {group.dayExpenses > 0 && (
                  <span className="font-semibold capitalize text-slate-400">₦{group.dayExpenses.toLocaleString("en-NG")} spent</span>
                )}
              </div>

              {/* Day Transactions Card Box */}
              <div className="rounded-2xl sm:rounded-3xl bg-white border border-slate-100/80 shadow-3xs overflow-hidden divide-y divide-slate-100/50">
                {group.txs.map((tx) => (
                  <div
                    key={tx.id}
                    onClick={() => handleEditClick(tx)}
                    className="group relative flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4.5 hover:bg-slate-50/40 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                      {/* Icon Circular Background */}
                      <div className="flex h-9 w-9 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-full bg-slate-100/80 text-slate-500">
                        {getCategoryIcon(tx.category, tx.type)}
                      </div>

                      {/* Merchant details */}
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center flex-wrap gap-1.5">
                          <span className="text-xs sm:text-sm font-extrabold text-slate-950 truncate max-w-[120px] sm:max-w-none">{tx.title}</span>
                          <span className={`px-1.5 py-0.5 text-[7px] sm:text-[8px] font-black rounded uppercase tracking-wider ${getBankBadgeStyle(tx.bank)}`}>
                            {tx.bank}
                          </span>
                        </div>
                        <span className="text-[10px] sm:text-xs text-slate-400 font-semibold mt-0.5 truncate max-w-[180px] sm:max-w-none">
                          {tx.category} · {tx.subtitle.includes("·") ? tx.subtitle.split("·").slice(1).join("·").trim() : tx.subtitle}
                        </span>
                      </div>
                    </div>

                    {/* Amount, Date and Hover Action Buttons */}
                    <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                      {/* Hover action overlay */}
                      <div className="hidden md:flex opacity-0 group-hover:opacity-100 transition-opacity items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditClick(tx);
                          }}
                          className="rounded-full p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                          title="Edit transaction"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteTransaction(tx.id);
                          }}
                          className="rounded-full p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
                          title="Delete transaction"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>

                      {/* Price / Subtitle info */}
                      <div className="flex flex-col items-end shrink-0">
                        <span className={`text-xs sm:text-sm font-black font-sans ${
                          tx.type === "income" ? "text-[#22c55e]" : "text-slate-950"
                        }`}>
                          {tx.type === "income" ? "+ " : "- "}₦{tx.amount.toLocaleString("en-NG")}
                        </span>
                        <span className="text-[9px] sm:text-[10px] text-slate-400 font-semibold mt-0.5">
                          {formatDateSub(tx.date)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Form for Add/Edit */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFormOpen(false)}
              className="absolute inset-0 bg-slate-900"
            />
            {/* Modal Body: Slide-up Bottom Sheet on Mobile, Centered Modal on Desktop */}
            <motion.div
              initial={isMobileView ? { y: "100%" } : { opacity: 0, scale: 0.95, y: 10 }}
              animate={isMobileView ? { y: 0 } : { opacity: 1, scale: 1, y: 0 }}
              exit={isMobileView ? { y: "100%" } : { opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", damping: 30, stiffness: 350 }}
              className="relative w-full sm:max-w-md overflow-hidden rounded-t-3xl sm:rounded-3xl bg-white p-6 shadow-2xl z-10 max-h-[92vh] sm:max-h-none overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-md font-bold text-slate-950">
                  {editingTx ? "Edit Transaction" : "New Transaction"}
                </h3>
                <button
                  onClick={() => setIsFormOpen(false)}
                  className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold text-slate-700">
                {/* Title */}
                <div className="space-y-1.5">
                  <label htmlFor="tx-title" className="block text-[11px] text-slate-500">Transaction Title / Vendor</label>
                  <input
                    id="tx-title"
                    type="text"
                    required
                    placeholder="e.g. Uber, Spar VI, Salary"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none focus:border-kolo-green"
                  />
                </div>

                {/* Subtitle */}
                <div className="space-y-1.5">
                  <label htmlFor="tx-sub" className="block text-[11px] text-slate-500">Description / Subtitle (Optional)</label>
                  <input
                    id="tx-sub"
                    type="text"
                    placeholder="e.g. Transport · UBER TRIP"
                    value={formSubtitle}
                    onChange={(e) => setFormSubtitle(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none focus:border-kolo-green"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Category */}
                  <div className="space-y-1.5">
                    <label htmlFor="tx-cat" className="block text-[11px] text-slate-500">Category</label>
                    <select
                      id="tx-cat"
                      value={formCategory}
                      onChange={(e) => handleCategoryChange(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none focus:border-kolo-green bg-white cursor-pointer"
                    >
                      <option value="Income">Income</option>
                      <option value="Transport">Transport</option>
                      <option value="Food & Dining">Food & Dining</option>
                      <option value="Groceries">Groceries</option>
                      <option value="Bills & Utilities">Bills & Utilities</option>
                      <option value="Airtime & Data">Airtime & Data</option>
                      <option value="Subscriptions">Subscriptions</option>
                      <option value="Entertainment">Entertainment</option>
                      <option value="Transfers">Transfers</option>
                      <option value="POS & Cash">POS & Cash</option>
                      <option value="Shopping">Shopping</option>
                      <option value="Betting">Betting</option>
                      <option value="Health">Health & Wellness</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* Bank */}
                  <div className="space-y-1.5">
                    <label htmlFor="tx-bank" className="block text-[11px] text-slate-500">Bank Partner</label>
                    <select
                      id="tx-bank"
                      value={formBank}
                      onChange={(e) => setFormBank(e.target.value as Transaction["bank"])}
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none focus:border-kolo-green bg-white cursor-pointer"
                    >
                      <option value="GTBANK">GTBANK</option>
                      <option value="KUDA">KUDA</option>
                      <option value="OPAY">OPAY</option>
                      <option value="PALMPAY">PALMPAY</option>
                      <option value="MONIEPOINT">MONIEPOINT</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Type */}
                  <div className="space-y-1.5">
                    <label htmlFor="tx-type" className="block text-[11px] text-slate-500">Transaction Flow</label>
                    <select
                      id="tx-type"
                      value={formType}
                      onChange={(e) => setFormType(e.target.value as "income" | "expense")}
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none focus:border-kolo-green bg-white cursor-pointer"
                    >
                      <option value="expense">Expense (-)</option>
                      <option value="income">Income (+)</option>
                    </select>
                  </div>

                  {/* Amount */}
                  <div className="space-y-1.5">
                    <label htmlFor="tx-amount" className="block text-[11px] text-slate-500">Amount (₦)</label>
                    <input
                      id="tx-amount"
                      type="number"
                      required
                      min="1"
                      placeholder="0.00"
                      value={formAmount}
                      onChange={(e) => setFormAmount(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none focus:border-kolo-green font-bold font-sans text-sm"
                    />
                  </div>
                </div>

                {/* Date */}
                <div className="space-y-1.5">
                  <label htmlFor="tx-date" className="block text-[11px] text-slate-500">Transaction Date & Time</label>
                  <input
                    id="tx-date"
                    type="datetime-local"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none focus:border-kolo-green cursor-pointer"
                  />
                </div>

                {/* Buttons container */}
                <div className="flex gap-3 pt-3">
                  {editingTx && (
                    <button
                      type="button"
                      onClick={() => {
                        deleteTransaction(editingTx.id);
                        setIsFormOpen(false);
                      }}
                      className="flex-1 rounded-xl bg-rose-50 text-rose-600 py-3.5 text-center text-sm font-bold hover:bg-rose-100 transition-colors cursor-pointer"
                    >
                      Delete
                    </button>
                  )}
                  <button
                    type="submit"
                    className="flex-2 rounded-xl bg-kolo-dark py-3.5 text-center text-sm font-bold text-white hover:bg-slate-800 transition-colors active:scale-95 cursor-pointer"
                  >
                    {editingTx ? "Save Changes" : "Create Transaction"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
