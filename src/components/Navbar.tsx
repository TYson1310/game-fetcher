import React from 'react';
import { ViewTab } from '../types/lottery';
import {
  Ticket,
  Trophy,
  CheckCircle2,
  Sparkles,
  RotateCw,
  ExternalLink,
  Layers,
} from 'lucide-react';

interface NavbarProps {
  currentTab: ViewTab;
  onTabChange: (tab: ViewTab) => void;
  scratchCount: number;
  isRefreshing: boolean;
  onRefresh: () => void;
  lastUpdated?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  scratchCount,
  isRefreshing,
  onRefresh,
  lastUpdated,
}) => {
  return (
    <header className="bg-[#002a54] text-white border-b border-[#003a74] sticky top-0 z-40 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-[#002a54] font-black shadow-inner ring-2 ring-amber-300/40">
              <span className="text-xl tracking-tighter font-extrabold">NJ</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-white leading-none">
                  New Jersey Lottery
                </span>
                <span className="hidden sm:inline-block text-[10px] font-semibold tracking-wider uppercase bg-amber-500/20 text-amber-300 border border-amber-400/30 px-1.5 py-0.5 rounded">
                  Live Hub
                </span>
              </div>
              <p className="text-xs text-blue-200/80 leading-snug hidden sm:block">
                Active Scratch-Offs & Winning Numbers Tracker
              </p>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-[#001c3a] p-1 rounded-xl border border-blue-900/60">
            <button
              onClick={() => onTabChange('scratch-offs')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                currentTab === 'scratch-offs'
                  ? 'bg-amber-500 text-slate-950 shadow-sm font-bold'
                  : 'text-blue-100 hover:text-white hover:bg-white/5'
              }`}
            >
              <Ticket className="w-4 h-4" />
              <span>Scratch-Offs</span>
              {scratchCount > 0 && (
                <span
                  className={`text-[11px] px-1.5 py-0.2 rounded font-bold ${
                    currentTab === 'scratch-offs'
                      ? 'bg-amber-600 text-slate-950'
                      : 'bg-blue-950 text-blue-200 border border-blue-800'
                  }`}
                >
                  {scratchCount}
                </span>
              )}
            </button>

            <button
              onClick={() => onTabChange('winning-numbers')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                currentTab === 'winning-numbers'
                  ? 'bg-amber-500 text-slate-950 shadow-sm font-bold'
                  : 'text-blue-100 hover:text-white hover:bg-white/5'
              }`}
            >
              <Trophy className="w-4 h-4" />
              <span>Winning Numbers</span>
            </button>

            <button
              onClick={() => onTabChange('ticket-checker')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                currentTab === 'ticket-checker'
                  ? 'bg-amber-500 text-slate-950 shadow-sm font-bold'
                  : 'text-blue-100 hover:text-white hover:bg-white/5'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Number Checker</span>
            </button>

            <button
              onClick={() => onTabChange('simulator')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                currentTab === 'simulator'
                  ? 'bg-amber-500 text-slate-950 shadow-sm font-bold'
                  : 'text-blue-100 hover:text-white hover:bg-white/5'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Scratch Simulator</span>
            </button>
          </nav>

          {/* Right Utility Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              title="Refresh latest lottery data"
              className="p-2 text-blue-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5 text-xs"
            >
              <RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-amber-400' : ''}`} />
              <span className="hidden xl:inline text-xs">Refresh Data</span>
            </button>

            <a
              href="https://www.njlottery.com/en-us/scratch-offs/active.html#tab-active"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs text-blue-200 hover:text-amber-300 transition-colors border border-blue-800/60 rounded-lg bg-blue-950/40"
              title="Open Official NJ Lottery website"
            >
              <span>Official NJLottery.com</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Mobile Tab bar */}
        <div className="md:hidden flex items-center justify-around border-t border-blue-900/60 py-2 gap-1 overflow-x-auto">
          <button
            onClick={() => onTabChange('scratch-offs')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 ${
              currentTab === 'scratch-offs'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-blue-200'
            }`}
          >
            <Ticket className="w-3.5 h-3.5" />
            <span>Scratch-Offs ({scratchCount})</span>
          </button>

          <button
            onClick={() => onTabChange('winning-numbers')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 ${
              currentTab === 'winning-numbers'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-blue-200'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Winning Numbers</span>
          </button>

          <button
            onClick={() => onTabChange('ticket-checker')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 ${
              currentTab === 'ticket-checker'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-blue-200'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Checker</span>
          </button>

          <button
            onClick={() => onTabChange('simulator')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 ${
              currentTab === 'simulator'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-blue-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Simulator</span>
          </button>
        </div>
      </div>
    </header>
  );
};
