"use client";

import React, { useState, useEffect } from "react";
import { FinanceProvider, useFinance, Transaction } from "@/context/finance-context";
import { useAuth } from "@/context/auth-context";
import { useTheme } from "@/context/theme-context";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/sidebar";
import Header from "@/components/header";
import MobileNav from "@/components/mobile-nav";
import CommandPalette from "@/components/command-palette";
import ShortcutsHelpModal from "@/components/shortcuts-help-modal";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import {
  DashboardSkeleton,
  TransactionsSkeleton,
  ImportCsvSkeleton,
  AiAssistantSkeleton
} from "@/components/skeleton-loaders";

const DashboardView = dynamic(() => import("@/components/dashboard-view"), {
  loading: () => <DashboardSkeleton />,
});

const TransactionsView = dynamic(() => import("@/components/transactions-view"), {
  loading: () => <TransactionsSkeleton />,
});

const ImportCsvView = dynamic(() => import("@/components/import-csv-view"), {
  loading: () => <ImportCsvSkeleton />,
});

const AiAssistantView = dynamic(() => import("@/components/ai-assistant-view"), {
  loading: () => <AiAssistantSkeleton />,
});

function AppContent() {
  const { activeTab, setActiveTab } = useFinance();
  const { toggleTheme } = useTheme();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isShortcutsHelpOpen, setIsShortcutsHelpOpen] = useState(false);
  
  // Transaction Modal Form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  // Global Keyboard Shortcuts event listener
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Toggle Command Palette on Ctrl+K or Cmd+K
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
        return;
      }

      // Check if user is typing in a form input
      const activeEl = document.activeElement;
      const isInput =
        activeEl &&
        (activeEl.tagName === "INPUT" ||
          activeEl.tagName === "TEXTAREA" ||
          activeEl.tagName === "SELECT" ||
          activeEl.getAttribute("contenteditable") === "true");

      if (isInput) return;

      // Handle Escape to close command palette or shortcuts help
      if (e.key === "Escape") {
        setIsCommandPaletteOpen(false);
        setIsShortcutsHelpOpen(false);
        return;
      }

      // Single character commands
      const key = e.key.toLowerCase();

      if (key === "?") {
        e.preventDefault();
        setIsShortcutsHelpOpen((prev) => !prev);
        return;
      }

      if (key === "t") {
        e.preventDefault();
        toggleTheme();
        return;
      }

      if (key === "c") {
        e.preventDefault();
        setActiveTab("transactions");
        setEditingTx(null);
        setIsFormOpen(true);
        return;
      }

      // Handle sequence commands (e.g. "g" then "d")
      if (key === "g") {
        const handleNextKey = (nextEvent: KeyboardEvent) => {
          document.removeEventListener("keydown", handleNextKey);
          const nextKey = nextEvent.key.toLowerCase();
          if (nextKey === "d") {
            nextEvent.preventDefault();
            setActiveTab("dashboard");
          } else if (nextKey === "t") {
            nextEvent.preventDefault();
            setActiveTab("transactions");
          } else if (nextKey === "i") {
            nextEvent.preventDefault();
            setActiveTab("import");
          } else if (nextKey === "a") {
            nextEvent.preventDefault();
            setActiveTab("ai-assistant");
          }
        };
        document.addEventListener("keydown", handleNextKey);
        // Clean up the temporary listener if no key is pressed in 1 second
        setTimeout(() => {
          document.removeEventListener("keydown", handleNextKey);
        }, 1000);
      }
    };

    document.addEventListener("keydown", handleGlobalKeyDown);
    return () => {
      document.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, [toggleTheme, setActiveTab]);

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
      case "ai-assistant":
        return <AiAssistantView />;
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
    <div className="flex h-screen w-screen overflow-hidden bg-kolo-light font-sans text-slate-800 relative">
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
        <main className="flex-1 overflow-y-auto pb-24 md:pb-0">
          {renderActiveView()}
        </main>
      </div>

      {/* Floating Mobile bottom navigation tab bar */}
      <MobileNav />

      {/* Command Palette Overlay */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        setIsFormOpen={setIsFormOpen}
        setEditingTx={setEditingTx}
      />

      {/* Shortcuts Help dialog */}
      <ShortcutsHelpModal
        isOpen={isShortcutsHelpOpen}
        onClose={() => setIsShortcutsHelpOpen(false)}
      />
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
