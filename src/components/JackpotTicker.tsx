import React from 'react';
import { DrawGame } from '../types/lottery';
import { Flame, Sparkles, Trophy } from 'lucide-react';

interface JackpotTickerProps {
  games: DrawGame[];
  onSelectGame?: (gameName: string) => void;
}

export const JackpotTicker: React.FC<JackpotTickerProps> = ({ games, onSelectGame }) => {
  if (!games || games.length === 0) return null;

  // Games with jackpots
  const jackpotGames = games.filter(
    (g) => g.estimatedJackpotFormatted && g.estimatedJackpotFormatted !== ''
  );

  return (
    <div className="bg-slate-900 border-b border-slate-800 text-slate-200 text-xs py-2 px-4 overflow-hidden">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 shrink-0 text-amber-400 font-semibold uppercase tracking-wider text-[11px]">
          <Flame className="w-3.5 h-3.5 animate-pulse" />
          <span>Live Jackpots:</span>
        </div>

        <div className="flex items-center gap-6 overflow-x-auto no-scrollbar scroll-smooth whitespace-nowrap py-0.5">
          {jackpotGames.map((game) => (
            <button
              key={`${game.gameName}-${game.id}`}
              onClick={() => onSelectGame?.(game.gameName)}
              className="inline-flex items-center gap-2 hover:text-white transition-colors cursor-pointer group text-left"
              title={`View ${game.displayName} winning numbers`}
            >
              <span className="font-medium text-slate-300 group-hover:text-amber-300 transition-colors">
                {game.displayName}:
              </span>
              <span className="font-bold text-amber-400 bg-amber-950/60 border border-amber-600/30 px-2 py-0.5 rounded text-[11px]">
                {game.estimatedJackpotFormatted}
              </span>
              {game.nextDrawFormatted && (
                <span className="text-slate-400 text-[10px]">
                  (Next: {game.nextDrawFormatted})
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-1.5 shrink-0 text-emerald-400 text-[11px] font-medium">
          <Sparkles className="w-3 h-3" />
          <span>Official NJ Lottery Data</span>
        </div>
      </div>
    </div>
  );
};
