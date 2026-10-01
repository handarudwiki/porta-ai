"use client";

import { TOTAL_PORTFOLIO_VALUE, USER_PORTFOLIO } from "@/lib/portfolio";
import { Building2, Coins, Layers, PieChart, ShieldCheck, TrendingUp, Wallet } from "lucide-react";

export default function PortfolioWidget() {
  const sectors = [
    { name: "Banking (BBCA, BMRI)", pct: 45.0, color: "bg-cyan-500", glow: "shadow-cyan-500/30" },
    { name: "Mining (INCO, ANTM)", pct: 25.0, color: "bg-emerald-500", glow: "shadow-emerald-500/30" },
    { name: "Automotive (ASII)", pct: 10.0, color: "bg-amber-500", glow: "shadow-amber-500/30" },
    { name: "Property (CTRA)", pct: 10.0, color: "bg-rose-500", glow: "shadow-rose-500/30" },
    { name: "Cash Buffer", pct: 10.0, color: "bg-slate-500", glow: "shadow-slate-500/30" }
  ];

  return (
    <div className="glass-panel rounded-2xl p-5 border border-white/10 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
            <Wallet className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Active User Portfolio</h3>
            <p className="text-[11px] text-slate-400">Hardcoded Baseline Engine</p>
          </div>
        </div>

        <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
          <ShieldCheck className="w-3 h-3" />
          Tracked Live
        </span>
      </div>

      {/* Portfolio Value Display */}
      <div>
        <div className="text-xs text-slate-400 mb-1">Total Assets Under Management</div>
        <div className="flex items-baseline justify-between">
          <div className="text-2xl font-bold text-white font-mono tracking-tight">
            Rp {TOTAL_PORTFOLIO_VALUE.toLocaleString("id-ID")}
          </div>
          <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
            +4.2% YTD
          </span>
        </div>
      </div>

      {/* Sector Allocation Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-300 font-medium flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            Sector Weightings
          </span>
          <span className="text-slate-400 text-[11px]">7 Asset Holdings</span>
        </div>

        <div className="w-full h-3 rounded-full bg-slate-900 overflow-hidden flex p-0.5 gap-0.5 border border-white/5">
          {sectors.map((s, idx) => (
            <div
              key={idx}
              className={`h-full rounded-sm ${s.color} transition-all duration-500`}
              style={{ width: `${s.pct}%` }}
              title={`${s.name}: ${s.pct}%`}
            />
          ))}
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
          {sectors.map((s, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${s.color}`} />
              <span className="text-slate-300 truncate">{s.name}</span>
              <span className="text-slate-400 ml-auto font-mono">{s.pct}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Holdings List */}
      <div className="pt-2 border-t border-white/5 space-y-2">
        <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
          <Coins className="w-3.5 h-3.5 text-indigo-400" />
          Positions Summary
        </div>

        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          {USER_PORTFOLIO.map((item) => (
            <div
              key={item.ticker}
              className="flex items-center justify-between p-2 rounded-lg bg-slate-900/50 border border-white/5 hover:border-white/10 transition-colors text-xs"
            >
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-cyan-300 w-12">{item.ticker}</span>
                <span className="text-slate-400 truncate max-w-[110px]">{item.name}</span>
              </div>
              <div className="text-right">
                <div className="font-mono text-white font-medium">
                  Rp {(item.valueIdr / 1000000).toFixed(1)}M
                </div>
                <div className="text-[10px] text-slate-400">{item.weightPct}% weight</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
