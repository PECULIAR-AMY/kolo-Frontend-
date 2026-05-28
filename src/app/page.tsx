"use client";

import React, { useState } from "react";
import { FinanceProvider, useFinance, Transaction } from "@/context/finance-context";
import Sidebar from "@/components/sidebar";
import Header from "@/components/header";
import DashboardView from "@/components/dashboard-view";
import TransactionsView from "@/components/transactions-view";
import ImportCsvView from "@/components/import-csv-view";

function AppContent() {
  const { activeTab } = useFinance();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Transaction Modal Form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

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
