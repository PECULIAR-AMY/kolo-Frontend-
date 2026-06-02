"use client";

import React from "react";

export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3.5 sm:gap-6 lg:grid-cols-4 animate-pulse">
      {[...Array(4)].map((_, idx) => (
        <div
          key={idx}
          className="rounded-2xl border border-slate-100 bg-white p-4.5 sm:p-6 shadow-3xs flex flex-col justify-between min-h-[105px] sm:min-h-[135px]"
        >
          <div className="flex items-center justify-between">
            <div className="h-3 w-16 bg-slate-200 rounded-full" />
            <div className="h-8.5 w-8.5 rounded-full bg-slate-150" />
          </div>
          <div className="space-y-2 mt-4">
            <div className="h-5 w-24 bg-slate-200 rounded" />
            <div className="h-3.5 w-12 bg-slate-150 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm flex flex-col min-h-[360px] animate-pulse">
      <div className="flex justify-between items-center mb-6">
        <div className="space-y-2">
          <div className="h-4 w-32 bg-slate-200 rounded" />
          <div className="h-3 w-48 bg-slate-150 rounded" />
        </div>
        <div className="h-8 w-24 bg-slate-100 rounded-full" />
      </div>
      <div className="flex-1 flex items-end gap-2.5 pt-4">
        {[45, 60, 25, 75, 40, 90, 50, 70, 30, 85, 65, 55].map((h, i) => (
          <div
            key={i}
            className="w-full bg-slate-100 rounded-t-md"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 py-4 md:px-10 md:py-6">
      {/* 4 Stats Cards */}
      <StatsSkeleton />

      {/* Main Grid: Chart & Insights */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ChartSkeleton />
        </div>
        <div className="rounded-3xl bg-slate-900 border border-slate-950 p-6 min-h-[360px] flex flex-col justify-between animate-pulse">
          <div className="space-y-3">
            <div className="h-3 w-16 bg-emerald-500/20 rounded-full" />
            <div className="h-5 w-40 bg-slate-800 rounded" />
            <div className="h-4.5 w-full bg-slate-850 rounded" />
            <div className="h-4.5 w-5/6 bg-slate-850 rounded" />
          </div>
          <div className="h-4 w-28 bg-emerald-500/20 rounded mt-6" />
        </div>
      </div>

      {/* Bills Skeleton */}
      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm animate-pulse space-y-4">
        <div className="h-4 w-40 bg-slate-200 rounded" />
        <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, idx) => (
            <div key={idx} className="rounded-xl border border-slate-100 p-4 h-28 bg-slate-50/50" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function TransactionsSkeleton() {
  return (
    <div className="px-4 py-4 md:px-10 md:py-6 space-y-6 animate-pulse">
      {/* Search and Filters row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="h-10 w-full sm:max-w-lg bg-slate-200 rounded-full" />
        <div className="flex gap-2.5">
          <div className="h-9 w-40 bg-slate-150 rounded-full" />
          <div className="h-9 w-20 bg-slate-200 rounded-full" />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex gap-2 pb-2 overflow-x-hidden">
        {[...Array(6)].map((_, idx) => (
          <div key={idx} className="h-8 w-20 bg-slate-150 rounded-full shrink-0" />
        ))}
      </div>

      {/* Grouped Day list */}
      <div className="space-y-6">
        {[...Array(2)].map((_, idx) => (
          <div key={idx} className="space-y-3">
            <div className="h-3.5 w-32 bg-slate-200 rounded" />
            <div className="rounded-2xl border border-slate-100 bg-white divide-y divide-slate-100">
              {[...Array(3)].map((_, rowIdx) => (
                <div key={rowIdx} className="flex justify-between items-center p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-slate-150" />
                    <div className="space-y-2">
                      <div className="h-4 w-28 bg-slate-200 rounded" />
                      <div className="h-3 w-16 bg-slate-150 rounded" />
                    </div>
                  </div>
                  <div className="h-4 w-16 bg-slate-200 rounded" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ImportCsvSkeleton() {
  return (
    <div className="px-4 py-4 md:px-10 md:py-6 max-w-6xl mx-auto space-y-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-3 w-16 bg-slate-200 rounded" />
        <div className="h-8 w-48 bg-slate-200 rounded" />
        <div className="h-4.5 w-[80%] bg-slate-150 rounded" />
      </div>

      <div className="space-y-3 mt-8">
        <div className="h-3.5 w-24 bg-slate-200 rounded" />
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
          {[...Array(5)].map((_, idx) => (
            <div key={idx} className="rounded-2xl border border-slate-150 bg-white h-24" />
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/20 h-64 flex flex-col items-center justify-center space-y-3">
        <div className="h-12 w-12 rounded-xl bg-slate-250" />
        <div className="h-4 w-40 bg-slate-200 rounded" />
        <div className="h-3.5 w-24 bg-slate-150 rounded" />
      </div>
    </div>
  );
}

export function AiAssistantSkeleton() {
  return (
    <div className="flex h-[calc(100vh-80px)] flex-col bg-kolo-light pb-20 md:pb-0 animate-pulse">
      {/* Header */}
      <div className="border-b border-slate-100 bg-white px-6 py-4 md:px-10 flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-5 w-32 bg-slate-200 rounded" />
          <div className="h-3 w-56 bg-slate-150 rounded" />
        </div>
      </div>

      {/* Chat messages */}
      <div className="flex-1 px-6 py-6 md:px-10 space-y-6 overflow-y-hidden">
        <div className="mx-auto max-w-3xl space-y-6">
          <div className="flex gap-3 justify-start">
            <div className="h-9 w-9 rounded-full bg-slate-200" />
            <div className="h-16 w-80 bg-white border border-slate-100 rounded-2xl rounded-tl-none p-4" />
          </div>
          <div className="flex gap-3 justify-end">
            <div className="h-12 w-48 bg-slate-900 rounded-2xl rounded-tr-none p-4" />
            <div className="h-9 w-9 rounded-full bg-slate-200" />
          </div>
          <div className="flex gap-3 justify-start">
            <div className="h-9 w-9 rounded-full bg-slate-200" />
            <div className="h-28 w-96 bg-white border border-slate-100 rounded-2xl rounded-tl-none p-4" />
          </div>
        </div>
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-slate-100">
        <div className="mx-auto max-w-3xl h-12 bg-slate-50 border border-slate-200 rounded-full" />
      </div>
    </div>
  );
}
