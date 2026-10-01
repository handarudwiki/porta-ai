"use client";

import { Activity, Bell, RefreshCw, Send, ShieldAlert, Wallet } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import TelegramModal from "./TelegramModal";

interface NavbarProps {
  onRefresh?: () => void;
  isPolling?: boolean;
  lastPolledAt?: string;
  totalEventsCount?: number;
  highRelevanceCount?: number;
}

export default function Navbar({
  onRefresh,
  isPolling = false,
  lastPolledAt,
  totalEventsCount = 0,
  highRelevanceCount = 0
}: NavbarProps) {
  const [isTelegramModalOpen, setIsTelegramModalOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 w-full glass-panel border-b border-white/10 px-4 lg:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Brand Logo & Name */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 p-0.5 shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-all duration-300">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Activity className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-white font-mono">
                  PORTA<span className="text-cyan-400">.AI</span>
                </span>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-full uppercase tracking-wider">
                  IDX Engine
                </span>
              </div>
              <p className="text-xs text-slate-400">Market Event Intelligence & Portfolio Impact</p>
            </div>
          </Link>

          {/* Center Status Indicators */}
          <div className="hidden md:flex items-center gap-4 bg-slate-900/60 border border-white/5 px-4 py-1.5 rounded-full text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-slate-400">Sectors API Poller:</span>
              <span className="font-semibold text-emerald-400">ACTIVE</span>
            </div>
            
            <div className="h-3 w-[1px] bg-slate-800" />

            <div className="flex items-center gap-1.5 text-slate-400">
              <Wallet className="w-3.5 h-3.5 text-cyan-400" />
              <span>Portfolio:</span>
              <span className="font-semibold text-white">IDR 500M</span>
            </div>

            {highRelevanceCount > 0 && (
              <>
                <div className="h-3 w-[1px] bg-slate-800" />
                <div className="flex items-center gap-1 text-rose-400 font-medium">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>{highRelevanceCount} Critical Alerts</span>
                </div>
              </>
            )}
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-3">
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={isPolling}
                className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium text-slate-200 bg-slate-800/80 hover:bg-slate-700/80 border border-white/10 rounded-lg transition-all disabled:opacity-50"
                title="Poll latest market news from Sectors API"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isPolling ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">{isPolling ? "Polling Sectors API..." : "Poll Sectors API"}</span>
              </button>
            )}

            <button
              onClick={() => setIsTelegramModalOpen(true)}
              className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 rounded-lg shadow-md shadow-blue-500/20 transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Telegram Alert Bot</span>
            </button>
          </div>
        </div>
      </header>

      {/* Telegram Config & Test Modal */}
      <TelegramModal
        isOpen={isTelegramModalOpen}
        onClose={() => setIsTelegramModalOpen(false)}
      />
    </>
  );
}
