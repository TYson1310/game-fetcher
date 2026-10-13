import React from 'react';
import { ScratchOffGame } from '../types/lottery';
import { getProxyImageUrl } from '../services/api';
import { X, ExternalLink, Download } from 'lucide-react';

interface TicketImageModalProps {
  game: ScratchOffGame | null;
  onClose: () => void;
}

export const TicketImageModal: React.FC<TicketImageModalProps> = ({ game, onClose }) => {
  if (!game) return null;

  const imageUrl = getProxyImageUrl(game.imageUrl);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative max-w-xl w-full bg-slate-900 border border-slate-700 rounded-2xl p-4 shadow-2xl flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar */}
        <div className="w-full flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="font-bold text-white text-base">
              {game.gameName} ({game.gameNumber})
            </h3>
            <p className="text-xs text-amber-400 font-semibold">
              Price: {game.formattedPrice} · Top Prize: {game.topPrize}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Big Ticket Image */}
        <div className="p-4 flex items-center justify-center min-h-[300px] w-full">
          <img
            src={imageUrl}
            alt={game.gameName}
            className="max-h-[65vh] w-auto object-contain rounded-lg shadow-xl"
            onError={(e) => {
              (e.target as HTMLImageElement).src = game.imageUrl;
            }}
          />
        </div>

        {/* Footer info & link */}
        <div className="w-full pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Official NJ Lottery Ticket Scan</span>
          <a
            href={game.detailsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors"
          >
            <span>View on NJLottery.com</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
