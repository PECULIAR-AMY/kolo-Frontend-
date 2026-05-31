"use client";

import React, { useState, useEffect } from "react";
import { FinanceProvider, useFinance, Transaction } from "@/context/finance-context";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/sidebar";
import Header from "@/components/header";
import DashboardView from "@/components/dashboard-view";
import TransactionsView from "@/components/transactions-view";
import ImportCsvView from "@/components/import-csv-view";
import { motion } from "framer-motion";

function AppContent() {
  const { activeTab } = useFinance();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Transaction Modal Form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  // Trigger add modal from Header
  const handleAddClick = () => {
    setEditingTx(null);
    setIsFormOpen(true);
  };

  const renderActiveView = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardView />;
      case "transactions":
        return (
          <TransactionsView
            isFormOpen={isFormOpen}
            setIsFormOpen={setIsFormOpen}
            editingTx={editingTx}
            setEditingTx={setEditingTx}
          />
        );
      case "import":
        return <ImportCsvView />;
    }
  };

  // Prevent UI flashing while checking authentication status
  if (authLoading || !isAuthenticated) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-kolo-dark text-white font-sans">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
          className="h-10 w-10 border-4 border-kolo-green border-t-transparent rounded-full mb-4"
        />
        <p className="text-sm font-semibold tracking-wider text-slate-400 animate-pulse">
          VERIFYING SESSION...
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-kolo-light font-sans text-slate-800">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      {/* Main Panel Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <Header 
          onMenuClick={() => setIsSidebarOpen(true)} 
          onAddClick={handleAddClick} 
        />

        {/* Scrollable View Area */}
        <main className="flex-1 overflow-y-auto">
          {renderActiveView()}
        </main>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <FinanceProvider>
      <AppContent />
    </FinanceProvider>
  );
}
