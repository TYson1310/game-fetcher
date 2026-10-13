import React, { useState } from 'react';
import { DrawGame } from '../types/lottery';
import {
  Trophy,
  Flame,
  Calendar,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Share2,
  Search,
} from 'lucide-react';

interface WinningNumbersViewProps {
  games: DrawGame[];
  isLoading: boolean;
  onCheckNumbers?: (gameName: string) => void;
}

export const WinningNumbersView: React.FC<WinningNumbersViewProps> = ({
  games,
  isLoading,
  onCheckNumbers,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'jackpot' | 'daily'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedDoublePlay, setExpandedDoublePlay] = useState<Record<string, boolean>>({});

  const toggleDoublePlay = (id: string) => {
    setExpandedDoublePlay((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredGames = games.filter((g) => {
    if (filterType === 'jackpot') {
      const isJackpotGame = ['Powerball', 'Mega Millions', 'Pick 6', 'Cash 5'].includes(g.gameName);
      if (!isJackpotGame) return false;
    }
    if (filterType === 'daily') {
      const isDailyGame = ['Pick 3', 'Pick 4', 'Cash 5', 'Cash 4 Life', 'KENO', 'CASHPOP'].includes(
        g.gameName
      );
      if (!isDailyGame) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return (
        g.displayName.toLowerCase().includes(q) ||
        g.gameName.toLowerCase().includes(q) ||
        g.winningNumbers.primary.join(' ').includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-[#002a54] to-slate-900 border border-blue-900/60 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-amber-400 font-semibold text-xs tracking-wider uppercase flex items-center gap-1">
                <Trophy className="w-3.5 h-3.5" />
                Official NJ Lottery Results
              </span>
              <span className="text-blue-300 text-xs">·</span>
              <span className="text-blue-200 text-xs">Live Drawing Feeds</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Current Winning Numbers
            </h1>
            <p className="text-sm text-blue-200 mt-1 max-w-2xl">
              Official winning numbers for Powerball, Mega Millions, Jersey Cash 5, Pick-6,
              Cash4Life, Pick-4, Pick-3, and Quick Draw drawings.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {onCheckNumbers && (
              <button
                onClick={() => onCheckNumbers('Powerball')}
                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-colors cursor-pointer shadow-md flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Check My Numbers</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-colors cursor-pointer ${
              filterType === 'all'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'bg-slate-950 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            All Draw Games ({games.length})
          </button>
          <button
            onClick={() => setFilterType('jackpot')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-colors cursor-pointer flex items-center gap-1 ${
              filterType === 'jackpot'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'bg-slate-950 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Big Jackpots</span>
          </button>
          <button
            onClick={() => setFilterType('daily')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-colors cursor-pointer ${
              filterType === 'daily'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'bg-slate-950 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            Daily NJ Games
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search game name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 rounded-xl pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:border-amber-500 transition-colors"
          />
        </div>
      </div>

      {/* Loading */}
      {isLoading && games.length === 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 animate-pulse space-y-4"
            >
              <div className="h-6 bg-slate-800 rounded w-1/3"></div>
              <div className="h-10 bg-slate-800 rounded w-full"></div>
            </div>
          ))}
        </div>
      )}

      {/* Games Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredGames.map((game) => {
          const { winningNumbers } = game;
          const hasDoublePlay = !!winningNumbers.doublePlay;
          const isDPOpen = expandedDoublePlay[game.id];

          return (
            <div
              key={`${game.gameName}-${game.id}`}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-lg transition-all flex flex-col justify-between"
            >
              <div>
                {/* Game Title & Draw Date */}
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-800/80">
                  <div>
                    <h3 className="font-extrabold text-lg text-white tracking-tight flex items-center gap-2">
                      <span>{game.displayName}</span>
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Drawn: {game.drawDate}</span>
                    </div>
                  </div>

                  {/* Jackpot badge if present */}
                  {game.estimatedJackpotFormatted && (
                    <div className="text-right bg-amber-950/40 border border-amber-500/30 rounded-xl px-3 py-1.5">
                      <div className="text-[10px] text-amber-300 uppercase tracking-wider font-semibold">
                        Estimated Jackpot
                      </div>
                      <div className="text-sm font-black text-amber-400">
                        {game.estimatedJackpotFormatted}
                      </div>
                    </div>
                  )}
                </div>

                {/* Winning Balls Section */}
                <div className="py-4 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-semibold uppercase tracking-wider text-[11px] text-slate-300">
                      Winning Numbers:
                    </span>
                    {winningNumbers.multiplier && (
                      <span className="bg-purple-900/40 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded text-[11px] font-bold">
                        Multiplier: {winningNumbers.multiplier}
                      </span>
                    )}
                  </div>

                  {/* Render Balls */}
                  {game.gameName === 'KENO' ? (
                    /* KENO 20-number grid */
                    <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 p-2 bg-slate-950 rounded-xl border border-slate-800">
                      {winningNumbers.primary.map((num, idx) => (
                        <div
                          key={idx}
                          className="w-8 h-8 rounded-full bg-blue-900 text-blue-100 flex items-center justify-center font-bold text-xs shadow-inner"
                        >
                          {num}
                        </div>
                      ))}
                    </div>
                  ) : (
                    /* Regular ball lineup */
                    <div className="flex flex-wrap items-center gap-2">
                      {winningNumbers.primary.map((num, idx) => (
                        <div
                          key={idx}
                          className="w-10 h-10 rounded-full bg-gradient-to-b from-white to-slate-200 text-slate-900 font-black text-base flex items-center justify-center shadow-lg border border-slate-300/80 ring-2 ring-black/20"
                        >
                          {num}
                        </div>
                      ))}

                      {/* Special Ball (Powerball / Mega Ball / Cash Ball / Bullseye) */}
                      {winningNumbers.specialBall && (
                        <div
                          className={`w-10 h-10 rounded-full font-black text-base flex items-center justify-center shadow-lg ring-2 ring-black/30 text-white ${
                            winningNumbers.specialBall.type === 'powerball'
                              ? 'bg-gradient-to-b from-red-500 to-red-700 border border-red-400'
                              : winningNumbers.specialBall.type === 'megaball'
                              ? 'bg-gradient-to-b from-amber-400 to-amber-600 text-slate-950 border border-amber-300'
                              : winningNumbers.specialBall.type === 'cashball'
                              ? 'bg-gradient-to-b from-emerald-500 to-emerald-700 border border-emerald-400'
                              : 'bg-gradient-to-b from-blue-500 to-blue-700 border border-blue-400'
                          }`}
                          title={winningNumbers.specialBall.label}
                        >
                          {winningNumbers.specialBall.number}
                        </div>
                      )}

                      {/* FIREBALL for Pick 3 / Pick 4 */}
                      {winningNumbers.fireball && (
                        <div
                          className="w-10 h-10 rounded-full bg-gradient-to-b from-orange-500 to-amber-600 text-white font-black text-base flex items-center justify-center shadow-lg border border-orange-400 ring-2 ring-orange-900/50"
                          title="FIREBALL"
                        >
                          {winningNumbers.fireball}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Ball legend / labels */}
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-1">
                    {winningNumbers.specialBall && (
                      <span className="flex items-center gap-1">
                        <span
                          className={`w-2.5 h-2.5 rounded-full inline-block ${
                            winningNumbers.specialBall.type === 'powerball'
                              ? 'bg-red-500'
                              : winningNumbers.specialBall.type === 'megaball'
                              ? 'bg-amber-400'
                              : 'bg-emerald-500'
                          }`}
                        />
                        <span>{winningNumbers.specialBall.label}: {winningNumbers.specialBall.number}</span>
                      </span>
                    )}

                    {winningNumbers.fireball && (
                      <span className="flex items-center gap-1 text-orange-400 font-semibold">
                        <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block" />
                        <span>FIREBALL: {winningNumbers.fireball}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Double Play Section (if available) */}
                {hasDoublePlay && (
                  <div className="mt-2 bg-slate-950/80 rounded-xl border border-slate-800 p-3">
                    <button
                      onClick={() => toggleDoublePlay(game.id)}
                      className="w-full flex items-center justify-between text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-1.5 text-indigo-400">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Double Play Drawing Results</span>
                      </span>
                      {isDPOpen ? (
                        <ChevronUp className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      )}
                    </button>

                    {isDPOpen && winningNumbers.doublePlay && (
                      <div className="mt-3 pt-3 border-t border-slate-800 flex flex-wrap items-center gap-2">
                        {winningNumbers.doublePlay.primary.map((dpNum, idx) => (
                          <div
                            key={idx}
                            className="w-8 h-8 rounded-full bg-slate-800 text-slate-200 border border-slate-700 font-bold text-xs flex items-center justify-center shadow"
                          >
                            {dpNum}
                          </div>
                        ))}
                        {winningNumbers.doublePlay.specialBall && (
                          <div className="w-8 h-8 rounded-full bg-red-900 text-red-200 border border-red-700 font-bold text-xs flex items-center justify-center shadow">
                            {winningNumbers.doublePlay.specialBall}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Bottom footer: Next Draw & Checker action */}
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                {game.nextDrawFormatted ? (
                  <div className="text-slate-400 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-blue-400" />
                    <span>Next Draw: <strong className="text-slate-200">{game.nextDrawFormatted}</strong></span>
                  </div>
                ) : (
                  <div className="text-slate-400">Daily Drawings</div>
                )}

                {onCheckNumbers && (
                  <button
                    onClick={() => onCheckNumbers(game.gameName)}
                    className="text-amber-400 hover:text-amber-300 font-bold transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <span>Check Numbers</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
