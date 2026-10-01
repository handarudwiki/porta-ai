"use client";

import { UniversalEventEnvelope } from "@/types/event";
import { AlertTriangle, ArrowUpRight, CheckCircle2, ChevronRight, Layers, Send, ShieldAlert, Sparkles, TrendingDown, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface EventCardProps {
  event: UniversalEventEnvelope;
  onSendTelegram?: (event: UniversalEventEnvelope) => void;
}

export default function EventCard({ event, onSendTelegram }: EventCardProps) {
  const [isSending, setIsSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(event.telegram_sent || false);

  const isHighRelevance = event.portfolio_impact.relevance === "HIGH";
  const isHighMateriality = event.market_impact.materiality >= 0.85;
  const netImpact = event.portfolio_impact.netEstValueImpactIdr;
  const netPct = event.portfolio_impact.netEstPctImpact;

  const handleTelegramClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!onSendTelegram) return;
    setIsSending(true);
    await onSendTelegram(event);
    setIsSending(false);
    setSentSuccess(true);
  };

  return (
    <div
      className={`glass-panel rounded-2xl p-5 border transition-all duration-300 relative group flex flex-col justify-between ${
        isHighRelevance
          ? "border-rose-500/30 hover:border-rose-500/60 bg-gradient-to-br from-rose-950/10 via-slate-900/60 to-slate-900/80"
          : "border-white/10 hover:border-cyan-500/30 hover:shadow-lg hover:shadow-cyan-500/5"
      }`}
    >
      <div>
        {/* Header Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold font-mono tracking-wider bg-slate-800 text-cyan-300 border border-slate-700">
              {event.category}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {event.event_type}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Portfolio Relevance Badge */}
            <span
              className={`flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                isHighRelevance
                  ? "bg-rose-500/15 text-rose-400 border-rose-500/30 animate-pulse"
                  : event.portfolio_impact.relevance === "MEDIUM"
                  ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                  : "bg-slate-800 text-slate-400 border-slate-700"
              }`}
            >
              {isHighRelevance && <ShieldAlert className="w-3 h-3" />}
              Relevance: {event.portfolio_impact.relevance}
            </span>

            {/* Materiality Score */}
            <span className="text-[11px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-white/5 font-mono">
              Mat: {(event.market_impact.materiality * 100).toFixed(0)}%
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-2 mb-2 leading-snug">
          {event.title}
        </h3>

        {/* Summary */}
        <p className="text-xs text-slate-300 line-clamp-2 mb-4 leading-relaxed">
          {event.summary}
        </p>

        {/* Transmission Preview Flow */}
        <div className="bg-slate-950/60 rounded-xl p-3 border border-white/5 mb-4 space-y-2">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3 h-3 text-cyan-400" />
            Economic Transmission Mechanism
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] py-1">
            {event.economic_mechanism.slice(0, 3).map((step, idx) => (
              <div key={idx} className="flex items-center gap-1.5 shrink-0">
                <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[10px] font-mono border border-white/5">
                  {step.label}
                </span>
                {idx < Math.min(2, event.economic_mechanism.length - 1) && (
                  <ChevronRight className="w-3 h-3 text-slate-500 shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Impact Metric & Affected Stock Pills */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/5 mb-4">
          <div>
            <div className="text-[10px] uppercase text-slate-400 font-semibold tracking-wider">
              Net Portfolio Impact
            </div>
            <div className="flex items-center gap-1.5">
              {netImpact > 0 ? (
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              ) : netImpact < 0 ? (
                <TrendingDown className="w-4 h-4 text-rose-400" />
              ) : null}
              <span
                className={`text-sm font-bold font-mono ${
                  netImpact > 0
                    ? "text-emerald-400"
                    : netImpact < 0
                    ? "text-rose-400"
                    : "text-slate-300"
                }`}
              >
                {netImpact > 0 ? "+" : ""}
                {netPct}% (Rp {Math.abs(netImpact).toLocaleString("id-ID")})
              </span>
            </div>
          </div>

          {/* Affected Stock Tickers */}
          <div className="flex items-center gap-1">
            {event.portfolio_impact.affectedHoldings.map((h) => (
              <span
                key={h.ticker}
                className={`px-2 py-0.5 text-[10px] font-bold font-mono rounded ${
                  h.sentiment === "BULLISH"
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    : h.sentiment === "BEARISH"
                    ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                    : "bg-slate-800 text-slate-300"
                }`}
              >
                {h.ticker}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between gap-2 pt-2">
        <button
          onClick={handleTelegramClick}
          disabled={isSending || sentSuccess}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            sentSuccess
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10"
          }`}
        >
          {sentSuccess ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Telegram Alert Sent</span>
            </>
          ) : (
            <>
              <Send className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isSending ? "Sending..." : "Send Telegram"}</span>
            </>
          )}
        </button>

        <Link
          href={`/event/${event.event_id}`}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 shadow-sm transition-all"
        >
          <span>Interactive Detail</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
