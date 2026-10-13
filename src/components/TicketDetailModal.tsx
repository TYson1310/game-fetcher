import React from 'react';
import { ScratchOffGame } from '../types/lottery';
import { getProxyImageUrl } from '../services/api';
import {
  X,
  ExternalLink,
  Sparkles,
  Trophy,
  DollarSign,
  Calendar,
  AlertCircle,
  Hash,
} from 'lucide-react';

interface TicketDetailModalProps {
  game: ScratchOffGame | null;
  onClose: () => void;
  onPlayInSimulator?: (game: ScratchOffGame) => void;
}

export const TicketDetailModal: React.FC<TicketDetailModalProps> = ({
  game,
  onClose,
  onPlayInSimulator,
}) => {
  if (!game) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/60 sticky top-0 z-10 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <span className="bg-amber-400 text-slate-950 text-xs font-black px-2.5 py-1 rounded-md">
              {game.formattedPrice}
            </span>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span>{game.gameName}</span>
                <span className="text-slate-400 text-sm font-normal">
                  ({game.gameNumber})
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Launched: {game.launchDateFormatted} · Official NJ Lottery Active Scratch-Off
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6">
          {/* Top section: Ticket Preview & Fast Stats */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Ticket Image */}
            <div className="md:col-span-5 bg-slate-950 p-3 rounded-xl border border-slate-800 flex flex-col items-center justify-center">
              <img
                src={getProxyImageUrl(game.imageUrl)}
                alt={game.gameName}
                className="max-h-72 w-auto object-contain rounded-lg shadow-md"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = game.imageUrl;
                }}
              />
              <span className="text-[11px] text-slate-500 mt-2 font-mono">
                Official Ticket Art {game.gameNumber}
              </span>
            </div>

            {/* High-level stats */}
            <div className="md:col-span-7 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                    <Trophy className="w-3.5 h-3.5 text-amber-400" />
                    <span>Top Prize</span>
                  </div>
                  <div className="text-xl font-extrabold text-amber-400">
                    {game.topPrize}
                  </div>
                </div>

                <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Ticket Price</span>
                  </div>
                  <div className="text-xl font-extrabold text-white">
                    {game.formattedPrice}
                  </div>
                </div>

                <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                    <AlertCircle className="w-3.5 h-3.5 text-blue-400" />
                    <span>Top Prizes Left</span>
                  </div>
                  <div className="text-xl font-extrabold text-white">
                    {game.topPrizesRemaining}{' '}
                    <span className="text-xs font-normal text-slate-400">
                      of {game.topPrizesTotal} ({game.topPrizesPercentRemaining}%)
                    </span>
                  </div>
                </div>

                <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                    <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Launch Date</span>
                  </div>
                  <div className="text-sm font-bold text-white mt-1">
                    {game.launchDateFormatted}
                  </div>
                </div>
              </div>

              {/* Progress bar of top prizes remaining */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="text-slate-300 font-medium">Top Prize Inventory Status</span>
                  <span
                    className={`font-bold ${
                      game.topPrizesRemaining === 0
                        ? 'text-red-400'
                        : game.topPrizesPercentRemaining < 25
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                    }`}
                  >
                    {game.topPrizesRemaining === 0
                      ? 'All Claimed!'
                      : `${game.topPrizesRemaining} Left (${game.topPrizesPercentRemaining}%)`}
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      game.topPrizesRemaining === 0
                        ? 'bg-red-500'
                        : game.topPrizesPercentRemaining < 25
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, game.topPrizesPercentRemaining)}%` }}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 pt-2">
                {onPlayInSimulator && (
                  <button
                    onClick={() => {
                      onPlayInSimulator(game);
                      onClose();
                    }}
                    className="flex-1 min-w-[160px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer shadow-md"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Play in Simulator</span>
                  </button>
                )}

                <a
                  href={game.detailsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-200 font-medium text-xs transition-colors border border-slate-700"
                >
                  <span>Official Details</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>

          {/* Full Prize Tiers Table */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Hash className="w-4 h-4 text-amber-400" />
              <span>Complete Prize Tiers & Remaining Tickets</span>
            </h3>

            {game.prizeTiers && game.prizeTiers.length > 0 ? (
              <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3 font-semibold">Tier</th>
                      <th className="py-2.5 px-3 font-semibold">Prize Amount</th>
                      <th className="py-2.5 px-3 font-semibold text-right">Total Winning</th>
                      <th className="py-2.5 px-3 font-semibold text-right">Claimed / Paid</th>
                      <th className="py-2.5 px-3 font-semibold text-right">Remaining</th>
                      <th className="py-2.5 px-3 font-semibold text-right">% Left</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {game.prizeTiers.map((tier, index) => {
                      const percentLeft =
                        tier.winningTickets > 0
                          ? Math.round((tier.remainingTickets / tier.winningTickets) * 100)
                          : 0;

                      return (
                        <tr
                          key={`${tier.tierNumber}-${tier.prizeAmount}-${index}`}
                          className="hover:bg-slate-900/40 transition-colors"
                        >
                          <td className="py-2.5 px-3 font-mono text-slate-400">
                            #{tier.tierNumber}
                          </td>
                          <td className="py-2.5 px-3 font-bold text-amber-300">
                            {tier.prizeDescription}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-slate-300">
                            {tier.winningTickets.toLocaleString()}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-slate-400">
                            {(tier.claimedTickets || tier.paidTickets).toLocaleString()}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-white">
                            {tier.remainingTickets.toLocaleString()}
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <span
                              className={`text-[11px] font-semibold ${
                                tier.remainingTickets === 0
                                  ? 'text-red-400'
                                  : percentLeft < 20
                                  ? 'text-amber-400'
                                  : 'text-emerald-400'
                              }`}
                            >
                              {percentLeft}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">
                Detailed prize tiers information unavailable for this ticket.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
