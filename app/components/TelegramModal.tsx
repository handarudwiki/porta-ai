"use client";

import { Check, Copy, Key, MessageSquare, Send, ShieldAlert, X } from "lucide-react";
import { useEffect, useState } from "react";

interface TelegramModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TelegramModal({ isOpen, onClose }: TelegramModalProps) {
  const [botToken, setBotToken] = useState("");
  const [chatId, setChatId] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const savedToken = localStorage.getItem("PORTA_TELEGRAM_TOKEN") || "";
    const savedChat = localStorage.getItem("PORTA_TELEGRAM_CHAT_ID") || "";
    setBotToken(savedToken);
    setChatId(savedChat);
  }, []);

  if (!isOpen) return null;

  const handleSave = () => {
    localStorage.setItem("PORTA_TELEGRAM_TOKEN", botToken);
    localStorage.setItem("PORTA_TELEGRAM_CHAT_ID", chatId);
    setStatusMsg({ type: "success", text: "Telegram credentials saved locally!" });
  };

  const handleTestSend = async () => {
    setIsSending(true);
    setStatusMsg(null);

    // Create a mock sample event to test dispatch
    const testEvent = {
      event_id: "EVT-TEST-001",
      category: "MONETARY_POLICY" as const,
      event_type: "RATE_CHANGE" as const,
      title: "Bank Indonesia Mempertahankan BI-Rate di 5,25% dan Memberi Sinyal Easing Kuartal Depan",
      summary: "Rapat Dewan Gubernur Bank Indonesia memutuskan mempertahankan BI-Rate di 5.25% dengan sinyal dovish untuk kuartal berikutnya.",
      source_article_title: "BI-Rate Decision",
      source_name: "Sectors API",
      entities: [{ type: "COUNTRY" as const, id: "ID", name: "Indonesia" }],
      event_data: { change_bps: 0, direction: "HOLD" },
      time: { occurred_at: new Date().toISOString() },
      factuality: { status: "CONFIRMED" as const, confidence: 0.98 },
      market_impact: { materiality: 0.88, level: "HIGH" as const },
      affected: { sectors: ["Banking", "Property"], companies: ["BBCA", "BMRI", "CTRA"] },
      economic_mechanism: [
        { step: 1, label: "BI-Rate Decision", description: "Rate hold at 5.25%", nodeType: "EVENT" as const },
        { step: 2, label: "Funding Stability", description: "NIM preservation", nodeType: "MECHANISM" as const },
        { step: 3, label: "Banking Sector Resilience", description: "Credit growth supported", nodeType: "SECTOR" as const },
        { step: 4, label: "Portfolio Exposure (45%)", description: "User banking holdings protected", nodeType: "PORTFOLIO" as const }
      ],
      portfolio_impact: {
        relevance: "HIGH" as const,
        exposurePct: 45,
        affectedHoldings: [
          { ticker: "BBCA", companyName: "Bank Central Asia Tbk", weightPct: 30, currentValueIdr: 150000000, sentiment: "BULLISH" as const, sensitivityScore: 0.5, estChangePct: 1.5, estValueChangeIdr: 3750000, reasoning: "Rate stability supports BOPO efficiency." },
          { ticker: "BMRI", companyName: "Bank Mandiri Tbk", weightPct: 15, currentValueIdr: 75000000, sentiment: "NEUTRAL" as const, sensitivityScore: 0.2, estChangePct: 0.8, estValueChangeIdr: 600000, reasoning: "Neutral credit growth outlook." }
        ],
        netEstPctImpact: 0.87,
        netEstValueImpactIdr: 4350000,
        summaryText: "Touches 45% of your portfolio across BBCA and BMRI.",
        actionRecommendation: "Maintain current overweight stance on banking sector."
      }
    };

    try {
      const res = await fetch("/api/telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: testEvent,
          botToken: botToken || undefined,
          chatId: chatId || undefined
        })
      });

      const data = await res.json();
      if (data.success) {
        setStatusMsg({ type: "success", text: data.message || "Test Telegram message sent successfully!" });
      } else {
        setStatusMsg({ type: "error", text: data.message || data.error || "Failed to send Telegram message" });
      }
    } catch (err: any) {
      setStatusMsg({ type: "error", text: err?.message || "Failed to contact Telegram API" });
    } finally {
      setIsSending(false);
    }
  };

  const sampleTelegramText = `🚨 PORTA FLASH ALERT [HIGH IMPACT]\n\nBI Rate Decision (BI-Rate: 5.25%)\n• Category: MONETARY_POLICY\n• Portfolio Relevance: HIGH (45% Exposure)\n• Est Impact: +0.87% (+Rp 4,350,000)\n\nTransmission Chain:\nRate Stability ➔ Funding Cost ➔ NIM Preservation\n\nLink:\nhttps://porta.app/event/EVT-001`;

  const handleCopySample = () => {
    navigator.clipboard.writeText(sampleTelegramText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
      <div className="glass-panel w-full max-w-xl rounded-2xl border border-white/10 p-6 shadow-2xl relative space-y-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <Send className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Telegram Notification Bot</h2>
            <p className="text-xs text-slate-400">Configure credentials & test real-time alert dispatch</p>
          </div>
        </div>

        {/* Input Credentials */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-cyan-400" />
              Telegram Bot Token (Optional if set in .env.local)
            </label>
            <input
              type="password"
              placeholder="e.g. 123456789:ABCdefGHIjklMNOpqrsTUVwxyZ"
              value={botToken}
              onChange={(e) => setBotToken(e.target.value)}
              className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
              Telegram Chat ID / Channel ID
            </label>
            <input
              type="text"
              placeholder="e.g. 987654321 or @my_channel"
              value={chatId}
              onChange={(e) => setChatId(e.target.value)}
              className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>
        </div>

        {/* Status Message Alert */}
        {statusMsg && (
          <div
            className={`p-3 rounded-xl border text-xs font-medium ${
              statusMsg.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
                : "bg-rose-500/10 border-rose-500/20 text-rose-300"
            }`}
          >
            {statusMsg.text}
          </div>
        )}

        {/* Live Telegram Message Preview */}
        <div className="bg-slate-950/80 rounded-xl p-4 border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Telegram Alert Preview</span>
            <button
              onClick={handleCopySample}
              className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              {copied ? "Copied" : "Copy text"}
            </button>
          </div>
          <pre className="text-[11px] font-mono text-slate-300 whitespace-pre-wrap leading-relaxed bg-slate-900/60 p-3 rounded-lg border border-white/5 max-h-36 overflow-y-auto">
            {sampleTelegramText}
          </pre>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={handleSave}
            className="px-4 py-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl transition-all"
          >
            Save Local Config
          </button>

          <button
            onClick={handleTestSend}
            disabled={isSending}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 rounded-xl shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSending ? "Sending Test Alert..." : "Dispatch Test Alert"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
