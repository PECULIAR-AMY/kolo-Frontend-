"use client";

import React, { useState, useMemo } from "react";
import { useFinance, Transaction } from "@/context/finance-context";
import { Search, Filter, Trash2, Edit2, Plus, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedBank, setSelectedBank] = useState<string>("All");

  // Form states (managed locally, synced on modal open)
  const [formTitle, setFormTitle] = useState("");
  const [formSubtitle, setFormSubtitle] = useState("");
  const [formType, setFormType] = useState<"income" | "expense">("expense");
  const [formAmount, setFormAmount] = useState("");
  const [formCategory, setFormCategory] = useState("Other");
  const [formBank, setFormBank] = useState<Transaction["bank"]>("GTBANK");
  const [formDate, setFormDate] = useState("");

  // Unique categories & banks from dataset for filter dropdowns
  const categories = useMemo(() => {
    const list = new Set(transactions.map((t) => t.category));
    return ["All", ...Array.from(list)];
  }, [transactions]);

  const banks = ["All", "GTBANK", "KUDA", "OPAY", "PALMPAY"];

  // Filtered transactions
  const filteredTxs = useMemo(() => {
    return transactions.filter((t) => {
      const matchesSearch = 
        t.title.toLowerCase().includes(search.toLowerCase()) || 
        t.subtitle.toLowerCase().includes(search.toLowerCase());
      
      const matchesCategory = selectedCategory === "All" || t.category === selectedCategory;
      const matchesBank = selectedBank === "All" || t.bank === selectedBank;

      return matchesSearch && matchesCategory && matchesBank;
    });
  }, [transactions, search, selectedCategory, selectedBank]);

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

    const payload = {
      title: formTitle,
      subtitle: formSubtitle || `${formCategory} · ${formTitle.toUpperCase()}`,
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

  return (
    <div className="px-6 py-6 md:px-10 space-y-6">
      {/* Filtering Actions Panel */}
      <div className="flex flex-col gap-4 rounded-2xl bg-white border border-slate-100 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search transactions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-full border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all focus:border-kolo-green focus:bg-white"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter */}
          <div className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50/30 px-3 py-1.5 text-xs text-slate-600">
            <span className="font-semibold text-slate-400">Cat:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent font-bold text-slate-700 outline-none cursor-pointer"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Bank Filter */}
          <div className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50/30 px-3 py-1.5 text-xs text-slate-600">
            <span className="font-semibold text-slate-400">Bank:</span>
            <select
              value={selectedBank}
              onChange={(e) => setSelectedBank(e.target.value)}
              className="bg-transparent font-bold text-slate-700 outline-none cursor-pointer"
            >
              {banks.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          {/* Create Button */}
          <button
            onClick={handleNewClick}
            className="flex items-center gap-1.5 rounded-full bg-kolo-green px-4 py-2 text-xs font-bold text-kolo-dark hover:bg-kolo-green-hover transition-colors active:scale-95 cursor-pointer ml-auto sm:ml-0"
          >
            <Plus size={14} />
            <span>New</span>
          </button>

          {/* Reset Seeding Data */}
          <button
            onClick={resetToDefault}
            className="rounded-full border border-slate-200 hover:bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-500 transition-colors"
          >
            Reset Data
          </button>
        </div>
      </div>

      {/* Database Grid Table */}
      <div className="overflow-hidden rounded-2xl bg-white border border-slate-100 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Transaction / Vendor</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Bank</th>
                <th className="px-6 py-4 text-right">Amount</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
              {filteredTxs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    No transactions match your search filters.
                  </td>
                </tr>
              ) : (
                filteredTxs.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-55/20 transition-colors">
                    {/* Date */}
                    <td className="px-6 py-4.5 whitespace-nowrap">
                      {new Date(tx.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                      <span className="block text-[10px] text-slate-400 mt-0.5">
                        {new Date(tx.date).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                        })}
                      </span>
                    </td>
                    {/* Description */}
                    <td className="px-6 py-4.5">
                      <span className="font-bold text-slate-900 block">{tx.title}</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5 max-w-xs truncate">
                        {tx.subtitle}
                      </span>
                    </td>
                    {/* Category */}
                    <td className="px-6 py-4.5 whitespace-nowrap">
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-600">
                        {tx.category}
                      </span>
                    </td>
                    {/* Bank */}
                    <td className="px-6 py-4.5 whitespace-nowrap">
                      <span className={`rounded-md px-2 py-0.5 text-[9px] font-bold uppercase ${
                        tx.bank === "KUDA" ? "bg-kuda-bg text-kuda-text" :
                        tx.bank === "GTBANK" ? "bg-gtbank-bg text-gtbank-text" :
                        tx.bank === "OPAY" ? "bg-opay-bg text-opay-text" :
                        "bg-palmpay-bg text-palmpay-text"
                      }`}>
                        {tx.bank}
                      </span>
                    </td>
                    {/* Amount */}
                    <td className={`px-6 py-4.5 text-right whitespace-nowrap font-bold text-sm font-sans ${
                      tx.type === "income" ? "text-emerald-500" : "text-slate-900"
                    }`}>
                      {tx.type === "income" ? "+ " : "- "}₦{tx.amount.toLocaleString("en-NG")}
                    </td>
                    {/* Actions */}
                    <td className="px-6 py-4.5 text-center whitespace-nowrap">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => handleEditClick(tx)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
                          title="Edit transaction"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => deleteTransaction(tx.id)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
                          title="Delete transaction"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form for Add/Edit */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFormOpen(false)}
              className="absolute inset-0 bg-slate-900"
            />
            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white p-6 shadow-2xl z-10"
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
                      <option value="Subscriptions">Subscriptions</option>
                      <option value="Transfers">Transfers</option>
                      <option value="POS & Cash">POS & Cash</option>
                      <option value="Airtime & Data">Airtime & Data</option>
                      <option value="Shopping">Shopping</option>
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

                {/* Submit */}
                <button
                  type="submit"
                  className="w-full rounded-xl bg-kolo-dark py-3.5 text-center text-sm font-bold text-white hover:bg-slate-800 transition-colors active:scale-95 mt-4 cursor-pointer"
                >
                  {editingTx ? "Save Changes" : "Create Transaction"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
