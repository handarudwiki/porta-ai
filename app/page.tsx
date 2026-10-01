"use client";

import EventCard from "@/app/components/EventCard";
import Navbar from "@/app/components/Navbar";
import PortfolioWidget from "@/app/components/PortfolioWidget";
import { EventCategory, UniversalEventEnvelope } from "@/types/event";
import { Activity, AlertCircle, Filter, Layers, RefreshCw, Send, ShieldAlert, Sparkles, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";

export default function Home() {
  const [events, setEvents] = useState<UniversalEventEnvelope[]>([]);
  const [isPolling, setIsPolling] = useState(false);
  const [lastPolledAt, setLastPolledAt] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedRelevance, setSelectedRelevance] = useState<string>("ALL");

  const pollApi = async () => {
    setIsPolling(true);
    try {
      const res = await fetch("/api/poll");
      const data = await res.json();
      if (data.success && data.events) {
        setEvents(data.events);
        setLastPolledAt(new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
      }
    } catch (err) {
      console.error("[Polling Error]", err);
    } finally {
      setIsPolling(false);
    }
  };

  useEffect(() => {
    pollApi();
  }, []);

  const handleSendTelegram = async (event: UniversalEventEnvelope) => {
    try {
      const token = localStorage.getItem("PORTA_TELEGRAM_TOKEN") || undefined;
      const chat = localStorage.getItem("PORTA_TELEGRAM_CHAT_ID") || undefined;

      await fetch("/api/telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event, botToken: token, chatId: chat })
      });
    } catch (err) {
      console.error("[Telegram Send Error]", err);
    }
  };

  // Filtering
  const filteredEvents = events.filter((evt) => {
    if (selectedCategory !== "ALL" && evt.category !== selectedCategory) return false;
    if (selectedRelevance === "HIGH" && evt.portfolio_impact.relevance !== "HIGH") return false;
    if (selectedRelevance === "MATERIAL" && evt.market_impact.materiality < 0.85) return false;
    return true;
  });

  const highRelevanceEvents = events.filter((e) => e.portfolio_impact.relevance === "HIGH");

  return (
    <div className="min-h-screen flex flex-col bg-[#090d16] text-slate-100 font-sans">
      
      {/* Top Navbar */}
      <Navbar
        onRefresh={pollApi}
        isPolling={isPolling}
        lastPolledAt={lastPolledAt}
        totalEventsCount={events.length}
        highRelevanceCount={highRelevanceEvents.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-8 space-y-8">
        
        {/* Hero Alert Banner if High Relevance Events exist */}
        {highRelevanceEvents.length > 0 && (
          <div className="glass-panel rounded-2xl p-6 border-rose-500/40 bg-gradient-to-r from-rose-950/40 via-slate-900/90 to-purple-950/30 shadow-xl shadow-rose-950/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center shrink-0 text-rose-400 pulse-glow">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded uppercase tracking-wider">
                    High Exposure Alert
                  </span>
                  <span className="text-xs text-slate-400">
                    {highRelevanceEvents.length} market events affect your core portfolio holdings
                  </span>
                </div>
                <h2 className="text-lg font-bold text-white leading-snug">
                  {highRelevanceEvents[0].title}
                </h2>
                <p className="text-xs text-slate-300 mt-1 line-clamp-1">
                  Impact touches {highRelevanceEvents[0].portfolio_impact.exposurePct}% of your portfolio assets across {highRelevanceEvents[0].affected.companies.join(", ")}.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => setSelectedRelevance("HIGH")}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-xl shadow-lg shadow-rose-600/30 transition-all"
              >
                View Critical Events
              </button>
            </div>
          </div>
        )}

        {/* Dashboard Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Feed Column (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Filter Bar */}
            <div className="glass-panel rounded-2xl p-4 border border-white/10 flex flex-wrap items-center justify-between gap-4">
              
              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full text-xs">
                <span className="text-slate-400 font-medium px-2 flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5 text-cyan-400" />
                  Category:
                </span>

                {["ALL", "MONETARY_POLICY", "FISCAL_POLICY", "CORPORATE", "COMMODITY", "REGULATION", "MACROECONOMIC", "CORPORATE_ACTION"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-all shrink-0 ${
                      selectedCategory === cat
                        ? "bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20"
                        : "bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-white/5"
                    }`}
                  >
                    {cat === "ALL" ? "All Categories" : cat.replace("_", " ")}
                  </button>
                ))}
              </div>

              {/* Relevance Toggle Filter */}
              <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-white/10 text-xs">
                <button
                  onClick={() => setSelectedRelevance("ALL")}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    selectedRelevance === "ALL" ? "bg-slate-800 text-white font-semibold" : "text-slate-400 hover:text-white"
                  }`}
                >
                  All ({events.length})
                </button>
                <button
                  onClick={() => setSelectedRelevance("HIGH")}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    selectedRelevance === "HIGH" ? "bg-rose-500/20 text-rose-300 font-semibold border border-rose-500/30" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Critical ({highRelevanceEvents.length})
                </button>
                <button
                  onClick={() => setSelectedRelevance("MATERIAL")}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    selectedRelevance === "MATERIAL" ? "bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30" : "text-slate-400 hover:text-white"
                  }`}
                >
                  High Materiality
                </button>
              </div>
            </div>

            {/* Feed Section Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
                  Extracted News Events ({filteredEvents.length})
                </h3>
              </div>
              {lastPolledAt && (
                <span className="text-xs text-slate-400 font-mono">
                  Updated: {lastPolledAt}
                </span>
              )}
            </div>

            {/* Event List Grid */}
            {isPolling && events.length === 0 ? (
              <div className="glass-panel rounded-2xl p-12 text-center space-y-4">
                <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
                <div className="text-sm font-semibold text-slate-300">Polling Sectors API & Extracting Events...</div>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Applying 5-layer NLP event extraction and running economic transmission mechanism models on your portfolio.
                </p>
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="glass-panel rounded-2xl p-12 text-center space-y-3">
                <AlertCircle className="w-8 h-8 text-slate-500 mx-auto" />
                <div className="text-sm font-semibold text-slate-300">No matching events found</div>
                <p className="text-xs text-slate-400">Try adjusting your category or relevance filter.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filteredEvents.map((evt) => (
                  <EventCard
                    key={evt.event_id}
                    event={evt}
                    onSendTelegram={handleSendTelegram}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Sidebar Column (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* User Portfolio Widget */}
            <PortfolioWidget />

            {/* Event Categories Quick Summary */}
            <div className="glass-panel rounded-2xl p-5 border border-white/10 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                Supported Event Schema Categories
              </h4>
              <div className="space-y-2 text-xs">
                {[
                  { name: "MONETARY_POLICY", desc: "Rate decisions, central bank dovish/hawkish guidance" },
                  { name: "FISCAL_POLICY", desc: "Export taxes, tariffs, government subsidies" },
                  { name: "CORPORATE", desc: "Quarterly earnings, revenue, consensus surprises" },
                  { name: "COMMODITY", desc: "Nickel, oil, gold spot price shifts & supply drivers" },
                  { name: "REGULATION", desc: "OJK capital requirements & financial rules" },
                  { name: "CORPORATE_ACTION", desc: "Dividends, stock splits, buybacks" }
                ].map((item) => (
                  <div key={item.name} className="p-2.5 rounded-xl bg-slate-950/60 border border-white/5 space-y-0.5">
                    <div className="font-mono font-bold text-cyan-300 text-[11px]">{item.name}</div>
                    <div className="text-[11px] text-slate-400">{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="w-full border-t border-white/5 py-6 px-4 text-center text-xs text-slate-400 space-y-1">
        <div>Porta AI — Indonesian Stock Market News Event Intelligence & Alerting System</div>
        <div className="text-[11px] text-slate-400">Powered by Sectors API (IDX Market Data) & Universal Event Envelope Engine</div>
      </footer>

    </div>
  );
}
