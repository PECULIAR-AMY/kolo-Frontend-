"use client";

import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Keyboard } from "lucide-react";

interface ShortcutsHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ShortcutsHelpModal({ isOpen, onClose }: ShortcutsHelpModalProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  const shortcutGroups = [
    {
      title: "Global Shortcuts",
      items: [
        { keys: ["⌘ / Ctrl", "K"], description: "Toggle Command Palette" },
        { keys: ["?"], description: "Open Keyboard Shortcuts Help" },
        { keys: ["Esc"], description: "Close Active Modal / Dropdowns" },
        { keys: ["T"], description: "Toggle Dark / Light Theme" }
      ]
    },
    {
      title: "Navigation Shortcuts",
      items: [
        { keys: ["G", "D"], description: "Go to Dashboard Tab" },
        { keys: ["G", "T"], description: "Go to Transactions Tab" },
        { keys: ["G", "I"], description: "Go to CSV Ingestion Tab" },
        { keys: ["G", "A"], description: "Go to Kolo AI Copilot Tab" }
      ]
    },
    {
      title: "Finance Actions",
      items: [
        { keys: ["C"], description: "Open 'Add Transaction' Sheet" }
      ]
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-950/45 dark:bg-slate-950/65 backdrop-blur-xs px-4">
          <motion.div
            ref={containerRef}
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 shadow-2xl backdrop-blur-xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-5 py-4">
              <div className="flex items-center gap-2">
                <Keyboard className="h-5 w-5 text-kolo-green" />
                <h2 className="text-sm font-black text-slate-800 dark:text-slate-100">
                  Keyboard Shortcuts Help
                </h2>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-100 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-all cursor-pointer"
                aria-label="Close shortcuts modal"
              >
                <X size={16} />
              </button>
            </div>

            {/* List */}
            <div className="p-5 flex flex-col gap-6 max-h-[380px] overflow-y-auto scrollbar-none">
              {shortcutGroups.map((group, gIdx) => (
                <div key={gIdx} className="flex flex-col gap-2.5">
                  <h3 className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    {group.title}
                  </h3>
                  <div className="flex flex-col gap-2">
                    {group.items.map((item, iIdx) => (
                      <div key={iIdx} className="flex items-center justify-between">
                        <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                          {item.description}
                        </span>
                        <div className="flex items-center gap-1">
                          {item.keys.map((key, kIdx) => (
                            <React.Fragment key={kIdx}>
                              {kIdx > 0 && <span className="text-[10px] text-slate-400 font-bold">+</span>}
                              <kbd className="rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-2 py-0.5 text-[9px] font-black text-slate-400 shadow-3xs select-none">
                                {key}
                              </kbd>
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="border-t border-slate-100 dark:border-slate-800 px-5 py-3 text-[10px] text-center text-slate-400 font-semibold bg-slate-50/50 dark:bg-slate-950/20">
              Press any of these key combos outside inputs to trigger action instantly!
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
