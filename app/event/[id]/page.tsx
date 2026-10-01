"use client";

import Navbar from "@/app/components/Navbar";
import { SAMPLE_IDX_NEWS_DATASET } from "@/lib/sectors-api";
import { extractEventFromNews } from "@/lib/event-extractor";
import { TOTAL_PORTFOLIO_VALUE, USER_PORTFOLIO } from "@/lib/portfolio";
import { UniversalEventEnvelope } from "@/types/event";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  Code2,
  ExternalLink,
  Info,
  Layers,
  RefreshCw,
  Send,
  ShieldAlert,
  Sliders,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Workflow
} from "lucide-react";
import Link from "next/link";
import { use, useEffect, useState } from "react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EventDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const eventId = resolvedParams.id;

  const [event, setEvent] = useState<UniversalEventEnvelope | null>(null);
  const [activeTab, setActiveTab] = useState<"TRANSMISSION" | "SIMULATOR" | "JSON">("TRANSMISSION");
  
  // Interactive Simulator Slider State
  const [simParam, setSimParam] = useState<number>(0);
  const [isSendingTelegram, setIsSendingTelegram] = useState<boolean>(false);
  const [telegramSuccess, setTelegramSuccess] = useState<boolean>(false);

  useEffect(() => {
    // Fetch or generate event matching eventId
    fetch("/api/poll")
      .then((res) => res.json())
      .then((data) => {
        if (data.events) {
          const found = data.events.find((e: UniversalEventEnvelope) => e.event_id === eventId);
          if (found) {
            setEvent(found);
            return;
          }
        }
        // Fallback matching
        const sampleArt = SAMPLE_IDX_NEWS_DATASET[0];
        const extracted = extractEventFromNews(sampleArt);
        extracted.event_id = eventId;
        setEvent(extracted);
      })
      .catch(() => {
        const sampleArt = SAMPLE_IDX_NEWS_DATASET[0];
        const extracted = extractEventFromNews(sampleArt);
        extracted.event_id = eventId;
        setEvent(extracted);
      });
  }, [eventId]);

  if (!event) {
    return (
      <div className="min-h-screen bg-[#090d16] flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
          <div className="text-sm font-semibold text-slate-300">Loading Event Intelligence...</div>
        </div>
      </div>
    );
  }

  // Simulator Recalculation Logic
  const simMultiplier = 1 + simParam / 100;
  const simNetValueImpact = Math.round(event.portfolio_impact.netEstValueImpactIdr * simMultiplier);
  const simNetPctImpact = parseFloat(((simNetValueImpact / TOTAL_PORTFOLIO_VALUE) * 100).toFixed(2));

  const handleSendTelegram = async () => {
    setIsSendingTelegram(true);
    try {
      const token = localStorage.getItem("PORTA_TELEGRAM_TOKEN") || undefined;
      const chat = localStorage.getItem("PORTA_TELEGRAM_CHAT_ID") || undefined;

      await fetch("/api/telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event, botToken: token, chatId: chat })
      });
      setTelegramSuccess(true);
    } catch (err) {
      console.error("[Telegram Error]", err);
    } finally {
      setIsSendingTelegram(false);
    }
  };

  const isHighRelevance = event.portfolio_impact.relevance === "HIGH";

  return (
    <div className="min-h-screen flex flex-col bg-[#090d16] text-slate-100 font-sans">
      
      {/* Top Navigation */}
      <Navbar />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-8 space-y-8">
        
        {/* Back Link */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-cyan-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Event Intelligence Dashboard
          </Link>

          <button
            onClick={handleSendTelegram}
            disabled={isSendingTelegram || telegramSuccess}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition-all shadow-lg ${
              telegramSuccess
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                : "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-blue-600/20"
            }`}
          >
            {telegramSuccess ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Send className="w-4 h-4" />}
            <span>{telegramSuccess ? "Alert Sent to Telegram" : isSendingTelegram ? "Sending Alert..." : "Dispatch Alert to Telegram"}</span>
          </button>
        </div>

        {/* Event Header Banner */}
        <div className="glass-panel rounded-2xl p-6 lg:p-8 border-white/10 space-y-6 relative overflow-hidden">
          
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-lg text-xs font-bold font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                {event.category}
              </span>
              <span className="px-2.5 py-1 rounded-lg text-xs font-mono bg-slate-800 text-slate-300 border border-slate-700">
                {event.event_type}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                ID: {event.event_id}
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5 bg-slate-900/80 px-3 py-1 rounded-lg border border-white/5">
                <span className="text-slate-400">Factuality:</span>
                <span className="font-semibold text-emerald-400">
                  {event.factuality.status} ({(event.factuality.confidence * 100).toFixed(0)}%)
                </span>
              </div>

              <div className="flex items-center gap-1.5 bg-slate-900/80 px-3 py-1 rounded-lg border border-white/5">
                <span className="text-slate-400">Market Materiality:</span>
                <span className="font-semibold text-cyan-400 font-mono">
                  {(event.market_impact.materiality * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          </div>

          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white leading-tight">
              {event.title}
            </h1>
            <p className="text-sm text-slate-300 mt-3 leading-relaxed max-w-4xl">
              {event.summary}
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-white/10 text-xs">
            <div className="bg-slate-950/60 p-3.5 rounded-xl border border-white/5 space-y-1">
              <div className="text-slate-400 font-medium">Portfolio Relevance</div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-sm font-bold ${
                    isHighRelevance ? "text-rose-400" : "text-amber-400"
                  }`}
                >
                  {event.portfolio_impact.relevance}
                </span>
                <span className="text-slate-400">({event.portfolio_impact.exposurePct}% exposure)</span>
              </div>
            </div>

            <div className="bg-slate-950/60 p-3.5 rounded-xl border border-white/5 space-y-1">
              <div className="text-slate-400 font-medium">Est. Net Value Impact</div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-sm font-bold font-mono ${
                    event.portfolio_impact.netEstValueImpactIdr >= 0 ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {event.portfolio_impact.netEstValueImpactIdr >= 0 ? "+" : ""}
                  {event.portfolio_impact.netEstPctImpact}% (Rp {Math.abs(event.portfolio_impact.netEstValueImpactIdr).toLocaleString("id-ID")})
                </span>
              </div>
            </div>

            <div className="bg-slate-950/60 p-3.5 rounded-xl border border-white/5 space-y-1">
              <div className="text-slate-400 font-medium">News Source</div>
              <div className="flex items-center gap-1.5 font-semibold text-slate-200">
                <span>{event.source_name}</span>
                {event.source_url && (
                  <a href={event.source_url} target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline">
                    <ExternalLink className="w-3.5 h-3.5 inline" />
                  </a>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-1">
          <button
            onClick={() => setActiveTab("TRANSMISSION")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "TRANSMISSION"
                ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20 font-bold"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <Workflow className="w-4 h-4" />
            <span>Transmission Flowchart</span>
          </button>

          <button
            onClick={() => setActiveTab("SIMULATOR")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "SIMULATOR"
                ? "bg-purple-500 text-white shadow-md shadow-purple-500/20 font-bold"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <Sliders className="w-4 h-4 text-purple-400" />
            <span>Interactive Scenario Simulator</span>
          </button>

          <button
            onClick={() => setActiveTab("JSON")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "JSON"
                ? "bg-slate-800 text-white font-bold border border-slate-700"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>Raw Event JSON Schema</span>
          </button>
        </div>

        {/* Tab 1: Economic Transmission Chain Visual Flow */}
        {activeTab === "TRANSMISSION" && (
          <div className="space-y-6">
            <div className="glass-panel rounded-2xl p-6 border-white/10 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Workflow className="w-5 h-5 text-cyan-400" />
                    Economic Transmission Mechanism Chain
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Step-by-step causal flow from primary news event down to user portfolio exposure
                  </p>
                </div>
                <span className="px-3 py-1 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-full text-xs font-mono font-medium">
                  {event.economic_mechanism.length} Flow Nodes
                </span>
              </div>

              {/* Visual Flow Nodes */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
                {event.economic_mechanism.map((step, idx) => (
                  <div
                    key={step.step}
                    className={`glass-panel rounded-xl p-5 border relative flex flex-col justify-between space-y-3 transition-all ${
                      step.nodeType === "EVENT"
                        ? "border-cyan-500/40 bg-gradient-to-b from-cyan-950/20 to-slate-900"
                        : step.nodeType === "MECHANISM"
                        ? "border-purple-500/40 bg-gradient-to-b from-purple-950/20 to-slate-900"
                        : step.nodeType === "SECTOR"
                        ? "border-amber-500/40 bg-gradient-to-b from-amber-950/20 to-slate-900"
                        : "border-rose-500/40 bg-gradient-to-b from-rose-950/20 to-slate-900"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="font-mono font-bold text-slate-400">Step 0{step.step}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase ${
                            step.nodeType === "EVENT"
                              ? "bg-cyan-500/20 text-cyan-300"
                              : step.nodeType === "MECHANISM"
                              ? "bg-purple-500/20 text-purple-300"
                              : step.nodeType === "SECTOR"
                              ? "bg-amber-500/20 text-amber-300"
                              : "bg-rose-500/20 text-rose-300"
                          }`}
                        >
                          {step.nodeType}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white leading-snug mb-1">
                        {step.label}
                      </h4>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {step.description}
                      </p>
                    </div>

                    {idx < event.economic_mechanism.length - 1 && (
                      <div className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-slate-800 border border-slate-600 items-center justify-center text-cyan-400 shadow-md">
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Detailed Holding Breakdown */}
            <div className="glass-panel rounded-2xl p-6 border-white/10 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-cyan-400" />
                Affected Portfolio Holdings ({event.portfolio_impact.affectedHoldings.length})
              </h3>

              <div className="space-y-3">
                {event.portfolio_impact.affectedHoldings.map((h) => (
                  <div
                    key={h.ticker}
                    className="p-4 rounded-xl bg-slate-950/70 border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-base text-cyan-300">{h.ticker}</span>
                        <span className="text-xs text-slate-400">{h.companyName}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            h.sentiment === "BULLISH"
                              ? "bg-emerald-500/20 text-emerald-400"
                              : h.sentiment === "BEARISH"
                              ? "bg-rose-500/20 text-rose-400"
                              : "bg-slate-800 text-slate-300"
                          }`}
                        >
                          {h.sentiment}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
                        {h.reasoning}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <div
                        className={`text-base font-bold font-mono ${
                          h.estChangePct > 0
                            ? "text-emerald-400"
                            : h.estChangePct < 0
                            ? "text-rose-400"
                            : "text-slate-300"
                        }`}
                      >
                        {h.estChangePct > 0 ? "+" : ""}
                        {h.estChangePct}%
                      </div>
                      <div className="text-xs text-slate-400 font-mono">
                        {h.estValueChangeIdr >= 0 ? "+" : ""}
                        Rp {h.estValueChangeIdr.toLocaleString("id-ID")}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Plan Box */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-950/40 to-slate-900 border border-indigo-500/20 flex items-start gap-3 mt-4">
                <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs">
                  <div className="font-bold text-white">Recommended Porta Action Plan</div>
                  <div className="text-slate-300 leading-relaxed">
                    {event.portfolio_impact.actionRecommendation}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Interactive Scenario Simulator */}
        {activeTab === "SIMULATOR" && (
          <div className="glass-panel rounded-2xl p-6 lg:p-8 border-white/10 space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-purple-400" />
                  Real-time Portfolio Sensitivity & Scenario Simulator
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Adjust the intensity slider below to stress-test how variations in this event impact your IDR 500M portfolio live.
                </p>
              </div>
            </div>

            {/* Interactive Slider Control */}
            <div className="bg-slate-950/80 p-6 rounded-2xl border border-white/5 space-y-6">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300">Event Severity Multiplier:</span>
                <span className="font-mono text-base font-bold text-purple-400 bg-purple-500/10 px-3 py-1 rounded-lg border border-purple-500/20">
                  {simParam > 0 ? `+${simParam}%` : `${simParam}%`} ({(1 + simParam / 100).toFixed(2)}x baseline)
                </span>
              </div>

              <input
                type="range"
                min="-100"
                max="100"
                step="5"
                value={simParam}
                onChange={(e) => setSimParam(Number(e.target.value))}
                className="w-full accent-purple-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
              />

              <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                <span>-100% (Dampened Impact)</span>
                <span>0 (Baseline Extracted Impact)</span>
                <span>+100% (Severe Market Escalation)</span>
              </div>
            </div>

            {/* Recalculated Dynamic Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-slate-950/60 border border-white/5 space-y-2">
                <div className="text-xs text-slate-400 font-medium">Simulated Net Portfolio Impact</div>
                <div
                  className={`text-3xl font-bold font-mono ${
                    simNetValueImpact >= 0 ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {simNetValueImpact >= 0 ? "+" : ""}
                  {simNetPctImpact}%
                </div>
                <div className="text-xs text-slate-300 font-mono">
                  Estimated Value Change: Rp {simNetValueImpact.toLocaleString("id-ID")}
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-slate-950/60 border border-white/5 space-y-2">
                <div className="text-xs text-slate-400 font-medium">Post-Event Portfolio Value</div>
                <div className="text-3xl font-bold font-mono text-white">
                  Rp {(TOTAL_PORTFOLIO_VALUE + simNetValueImpact).toLocaleString("id-ID")}
                </div>
                <div className="text-xs text-slate-400">
                  Baseline Assets: Rp {TOTAL_PORTFOLIO_VALUE.toLocaleString("id-ID")}
                </div>
              </div>
            </div>

            {/* Simulated Holdings Impact Bar Chart */}
            <div className="space-y-4 pt-4 border-t border-white/10">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Simulated Holding Sensitivities
              </h4>

              <div className="space-y-3">
                {event.portfolio_impact.affectedHoldings.map((h) => {
                  const simHoldingChange = parseFloat((h.estChangePct * simMultiplier).toFixed(2));
                  const simValChange = Math.round(h.estValueChangeIdr * simMultiplier);

                  return (
                    <div key={h.ticker} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono font-bold text-white">{h.ticker}</span>
                        <span
                          className={`font-mono font-bold ${
                            simHoldingChange >= 0 ? "text-emerald-400" : "text-rose-400"
                          }`}
                        >
                          {simHoldingChange >= 0 ? "+" : ""}
                          {simHoldingChange}% (Rp {simValChange.toLocaleString("id-ID")})
                        </span>
                      </div>

                      <div className="w-full h-2.5 rounded-full bg-slate-900 overflow-hidden relative">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            simHoldingChange >= 0 ? "bg-emerald-500" : "bg-rose-500"
                          }`}
                          style={{ width: `${Math.min(100, Math.max(5, Math.abs(simHoldingChange) * 15))}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Raw Universal Event Schema JSON */}
        {activeTab === "JSON" && (
          <div className="glass-panel rounded-2xl p-6 border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                <Code2 className="w-4 h-4 text-cyan-400" />
                Universal Event Envelope Schema (prompt.txt format)
              </h3>
              <span className="text-xs text-slate-400 font-mono">Category: {event.category}</span>
            </div>

            <pre className="text-xs font-mono bg-slate-950 p-5 rounded-xl border border-white/10 text-cyan-300 overflow-x-auto leading-relaxed max-h-[500px]">
              {JSON.stringify(event, null, 2)}
            </pre>
          </div>
        )}

      </main>

    </div>
  );
}
