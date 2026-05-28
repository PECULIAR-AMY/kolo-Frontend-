"use client";

import React, { useState, useRef } from "react";
import { useFinance, Transaction } from "@/context/finance-context";
import Papa from "papaparse";
import { UploadCloud, CheckCircle, FileSpreadsheet, AlertTriangle, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function ImportCsvView() {
  const { importTransactions, setActiveTab } = useFinance();
  
  const [file, setFile] = useState<File | null>(null);
  const [parsedHeaders, setParsedHeaders] = useState<string[]>([]);
  const [parsedData, setParsedData] = useState<Record<string, any>[]>([]);
  
  // Mapping configuration states
  const [titleCol, setTitleCol] = useState("");
  const [subtitleCol, setSubtitleCol] = useState("");
  const [amountCol, setAmountCol] = useState("");
  const [categoryCol, setCategoryCol] = useState("");
  const [bankCol, setBankCol] = useState("");
  const [dateCol, setDateCol] = useState("");
  const [typeCol, setTypeCol] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // File Upload Handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (selectedFile: File) => {
    if (selectedFile.type !== "text/csv" && !selectedFile.name.endsWith(".csv")) {
      alert("Please upload a valid CSV file.");
      return;
    }

    setFile(selectedFile);
    Papa.parse(selectedFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.data && results.data.length > 0) {
          const headers = Object.keys(results.data[0] as any);
          setParsedHeaders(headers);
          setParsedData(results.data as any[]);
          
          // Auto-map common headers
          autoMapHeaders(headers);
        } else {
          alert("CSV file seems to be empty.");
        }
      },
      error: (error) => {
        alert("Failed to parse CSV: " + error.message);
      }
    });
  };

  // Helper to automap based on common name matches
  const autoMapHeaders = (headers: string[]) => {
    const findHeader = (aliases: string[]) => {
      return headers.find(h => aliases.some(alias => h.toLowerCase().includes(alias.toLowerCase()))) || "";
    };

    setTitleCol(findHeader(["title", "vendor", "merchant", "name", "description"]));
    setSubtitleCol(findHeader(["subtitle", "details", "memo", "narration"]));
    setAmountCol(findHeader(["amount", "value", "price", "cost"]));
    setCategoryCol(findHeader(["category", "sector", "type_tag"]));
    setBankCol(findHeader(["bank", "account", "institution"]));
    setDateCol(findHeader(["date", "time", "timestamp", "created"]));
    setTypeCol(findHeader(["type", "flow", "direction"]));
  };

  // Trigger file selection window
  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  // Build and download a template CSV file
  const downloadTemplate = () => {
    const csvContent = 
      "date,title,subtitle,category,bank,type,amount\n" +
      "2026-05-28T09:00:00,Mega Grocery,Groceries Mall Shop,Groceries,KUDA,expense,15000\n" +
      "2026-05-27T14:30:00,Contract Billing,Freelance Web Dev,Income,GTBANK,income,250000\n" +
      "2026-05-26T21:40:00,Uber Ride,Uber trip lagos,Transport,PALMPAY,expense,3500\n" +
      "2026-05-25T11:00:00,Buka Restaurant,Amala Spot Lekki,Food & Dining,OPAY,expense,8000\n";

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "kolo_sample_statement.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Ingest parsed rows
  const handleImport = () => {
    if (!titleCol || !amountCol) {
      alert("Please map at least Title/Vendor and Amount columns.");
      return;
    }

    const mappedTransactions: Omit<Transaction, "id">[] = parsedData.map((row) => {
      const amountVal = Math.abs(Number(row[amountCol]?.toString().replace(/[^\d.]/g, "")) || 0);
      
      // Determine flow
      let typeVal: "income" | "expense" = "expense";
      if (typeCol && row[typeCol]) {
        const tStr = row[typeCol].toLowerCase();
        if (tStr.includes("in") || tStr.includes("credit") || tStr.includes("plus") || tStr.includes("income")) {
          typeVal = "income";
        }
      } else if (row[categoryCol]?.toLowerCase() === "income") {
        typeVal = "income";
      }

      // Bank normalize
      let bankVal: Transaction["bank"] = "GTBANK";
      const bStr = (row[bankCol] || "").toUpperCase();
      if (bStr.includes("KUDA")) bankVal = "KUDA";
      else if (bStr.includes("OPAY")) bankVal = "OPAY";
      else if (bStr.includes("PALM")) bankVal = "PALMPAY";

      // Date normalize
      let dateVal = new Date().toISOString();
      if (dateCol && row[dateCol]) {
        const parsedDate = new Date(row[dateCol]);
        if (!isNaN(parsedDate.getTime())) {
          dateVal = parsedDate.toISOString();
        }
      }

      const catVal = row[categoryCol] || (typeVal === "income" ? "Income" : "Other");

      return {
        title: row[titleCol] || "Untitled Transaction",
        subtitle: row[subtitleCol] || `${catVal} · Imported`,
        amount: amountVal,
        type: typeVal,
        category: catVal,
        bank: bankVal,
        date: dateVal,
      };
    });

    importTransactions(mappedTransactions);
    setActiveTab("dashboard");
  };

  return (
    <div className="px-6 py-6 md:px-10 space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Upload Column */}
        <div className="lg:col-span-1 space-y-4">
          <div className="rounded-2xl bg-white border border-slate-100 p-6 shadow-sm">
            <h2 className="text-sm font-extrabold text-slate-900 mb-2">Upload CSV Statement</h2>
            <p className="text-xs text-slate-400 mb-6">Import transactions from your bank statements or personal sheets.</p>

            {/* Drag & Drop Frame */}
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={triggerFileSelect}
              className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors min-h-[200px] ${
                file ? "border-kolo-green/50 bg-kolo-green/5" : "border-slate-200 hover:border-slate-300 bg-slate-50/50"
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".csv"
                className="hidden"
              />
              {file ? (
                <>
                  <div className="rounded-full bg-kolo-green/10 p-3 text-kolo-green mb-3">
                    <FileSpreadsheet size={32} />
                  </div>
                  <span className="text-xs font-bold text-slate-800 truncate max-w-full block">{file.name}</span>
                  <span className="text-[10px] text-slate-400 mt-1">{(file.size / 1024).toFixed(1)} KB · Click to change</span>
                </>
              ) : (
                <>
                  <div className="rounded-full bg-slate-100 p-3 text-slate-400 mb-3">
                    <UploadCloud size={32} />
                  </div>
                  <span className="text-xs font-bold text-slate-800">Drag & drop CSV file here</span>
                  <span className="text-[10px] text-slate-400 mt-1">or click to browse from device</span>
                </>
              )}
            </div>

            {/* Actions */}
            <div className="mt-6 flex flex-col gap-2.5">
              <button
                onClick={downloadTemplate}
                className="w-full text-center text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors py-2 rounded-lg border border-slate-100 bg-slate-55/10"
              >
                Download Test Template CSV
              </button>
            </div>
          </div>

          {/* Mapping settings card */}
          {file && parsedHeaders.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl bg-white border border-slate-100 p-6 shadow-sm space-y-4"
            >
              <h2 className="text-sm font-extrabold text-slate-900 mb-3">Map CSV Columns</h2>

              <div className="space-y-3 text-xs font-semibold text-slate-600">
                {/* Title */}
                <div className="space-y-1">
                  <label className="block text-[10px] text-slate-400">Title / Vendor (Required)</label>
                  <select
                    value={titleCol}
                    onChange={(e) => setTitleCol(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none bg-white font-bold text-slate-700"
                  >
                    <option value="">-- Select Column --</option>
                    {parsedHeaders.map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>

                {/* Amount */}
                <div className="space-y-1">
                  <label className="block text-[10px] text-slate-400">Amount (Required)</label>
                  <select
                    value={amountCol}
                    onChange={(e) => setAmountCol(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none bg-white font-bold text-slate-700"
                  >
                    <option value="">-- Select Column --</option>
                    {parsedHeaders.map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>

                {/* Subtitle */}
                <div className="space-y-1">
                  <label className="block text-[10px] text-slate-400">Description / Subtitle</label>
                  <select
                    value={subtitleCol}
                    onChange={(e) => setSubtitleCol(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none bg-white font-bold text-slate-700"
                  >
                    <option value="">-- Select Column (Optional) --</option>
                    {parsedHeaders.map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>

                {/* Category */}
                <div className="space-y-1">
                  <label className="block text-[10px] text-slate-400">Category</label>
                  <select
                    value={categoryCol}
                    onChange={(e) => setCategoryCol(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none bg-white font-bold text-slate-700"
                  >
                    <option value="">-- Select Column (Optional) --</option>
                    {parsedHeaders.map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>

                {/* Bank */}
                <div className="space-y-1">
                  <label className="block text-[10px] text-slate-400">Bank Partner</label>
                  <select
                    value={bankCol}
                    onChange={(e) => setBankCol(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none bg-white font-bold text-slate-700"
                  >
                    <option value="">-- Select Column (Optional) --</option>
                    {parsedHeaders.map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>

                {/* Date */}
                <div className="space-y-1">
                  <label className="block text-[10px] text-slate-400">Transaction Date</label>
                  <select
                    value={dateCol}
                    onChange={(e) => setDateCol(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none bg-white font-bold text-slate-700"
                  >
                    <option value="">-- Select Column (Optional) --</option>
                    {parsedHeaders.map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>

                {/* Flow Type */}
                <div className="space-y-1">
                  <label className="block text-[10px] text-slate-400">Flow Direction (Income/Expense)</label>
                  <select
                    value={typeCol}
                    onChange={(e) => setTypeCol(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none bg-white font-bold text-slate-700"
                  >
                    <option value="">-- Select Column (Optional) --</option>
                    {parsedHeaders.map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleImport}
                  disabled={!titleCol || !amountCol}
                  className={`w-full flex items-center justify-center gap-1.5 rounded-xl py-3 text-center text-xs font-bold transition-all mt-4 cursor-pointer active:scale-95 ${
                    titleCol && amountCol
                      ? "bg-slate-900 text-white hover:bg-slate-800"
                      : "bg-slate-100 text-slate-400 cursor-not-allowed"
                  }`}
                >
                  <span>Import {parsedData.length} records</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Data Preview Column */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl bg-white border border-slate-100 p-6 shadow-sm h-full flex flex-col">
            <h2 className="text-sm font-extrabold text-slate-900 mb-2">Statement Data Preview</h2>
            <p className="text-xs text-slate-400 mb-5">Preview parsed row data contents from the CSV file.</p>

            <div className="flex-1 overflow-auto border border-slate-100 rounded-xl max-h-[500px]">
              {parsedData.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
                  <FileSpreadsheet size={40} className="stroke-1 mb-2.5 text-slate-300" />
                  <span className="text-xs">No statement loaded yet. Please select or drag a CSV.</span>
                </div>
              ) : (
                <table className="w-full text-left border-collapse text-[11px] text-slate-600">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50 font-bold uppercase tracking-wider text-slate-400 sticky top-0">
                      {parsedHeaders.map((h) => (
                        <th key={h} className="px-4 py-3 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {parsedData.slice(0, 15).map((row, i) => (
                      <tr key={i} className="hover:bg-slate-55/10 transition-colors">
                        {parsedHeaders.map((h) => (
                          <td key={h} className="px-4 py-2.5 whitespace-nowrap truncate max-w-[150px]" title={row[h]}>
                            {row[h]}
                          </td>
                        ))}
                      </tr>
                    ))}
                    {parsedData.length > 15 && (
                      <tr>
                        <td colSpan={parsedHeaders.length} className="px-4 py-2 text-center text-slate-400 bg-slate-50/50 italic">
                          Showing first 15 of {parsedData.length} records.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
