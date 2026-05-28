"use client";

import React from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface ChartData {
  day: number;
  amount: number;
}

export default function SpendingTrend({ data }: { data: ChartData[] }) {
  // Format Naira values for Y-axis
  const formatYAxis = (value: number) => {
    if (value === 0) return "₦0k";
    return `₦${(value / 1000).toFixed(0)}k`;
  };

  // Custom Tooltip component
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-xl border border-slate-100 bg-white p-3 shadow-lg">
          <p className="text-xs font-semibold text-slate-400">May {payload[0].payload.day}, 2026</p>
          <p className="text-sm font-bold text-slate-900 mt-0.5">
            ₦{payload[0].value.toLocaleString("en-NG")}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-64 w-full md:h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#a2e932" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#a2e932" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#f1f5f9"
          />
          <XAxis
            dataKey="day"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#94a3b8", fontSize: 10 }}
            dy={10}
            // Skip 8 to match the screenshot
            ticks={[2, 3, 4, 5, 6, 7, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28]}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#94a3b8", fontSize: 10 }}
            tickFormatter={formatYAxis}
            domain={[0, 60000]}
            ticks={[0, 15000, 30000, 45000, 60000]}
            dx={-5}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="amount"
            stroke="#a2e932"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorSpend)"
            dot={{ r: 0 }}
            activeDot={{ r: 4, stroke: "#a2e932", strokeWidth: 2, fill: "#fff" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
