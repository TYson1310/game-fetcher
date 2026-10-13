import React, { useState } from 'react';
import { getProxyImageUrl } from '../services/api';
import { ZoomIn, Ticket as TicketIcon } from 'lucide-react';

interface ScratchCardThumbnailProps {
  gameName: string;
  gameNumber: string;
  price: number;
  imageUrl: string;
  topPrize: string;
  onZoom?: () => void;
  className?: string;
}

export const ScratchCardThumbnail: React.FC<ScratchCardThumbnailProps> = ({
  gameName,
  gameNumber,
  price,
  imageUrl,
  topPrize,
  onZoom,
  className = '',
}) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Determine ticket color styling based on price tier
  const getTicketTheme = (priceVal: number) => {
    switch (priceVal) {
      case 1:
        return 'from-sky-700 to-blue-900 border-sky-500';
      case 2:
        return 'from-emerald-700 to-teal-900 border-emerald-500';
      case 3:
        return 'from-amber-700 to-orange-900 border-amber-500';
      case 5:
        return 'from-indigo-700 to-purple-900 border-indigo-500';
      case 10:
        return 'from-rose-800 to-red-950 border-rose-500';
      case 20:
        return 'from-yellow-700 to-amber-950 border-yellow-500';
      case 25:
      case 30:
        return 'from-purple-900 via-slate-900 to-slate-950 border-amber-400';
      default:
        return 'from-slate-800 to-slate-950 border-slate-700';
    }
  };

  const proxyUrl = getProxyImageUrl(imageUrl);

  return (
    <div
      className={`relative w-full aspect-[3/4] rounded-lg overflow-hidden bg-slate-900 border border-slate-800 group shadow-md ${className}`}
    >
      {/* Real Ticket Image */}
      {!imageError ? (
        <>
          {isLoading && (
            <div className="absolute inset-0 bg-slate-800 animate-pulse flex items-center justify-center">
              <TicketIcon className="w-8 h-8 text-slate-600 animate-bounce" />
            </div>
          )}
          <img
            src={proxyUrl}
            alt={`${gameName} scratch-off ticket`}
            loading="lazy"
            onLoad={() => setIsLoading(false)}
            onError={() => {
              // Try fallback direct URL once, or switch to simulated visual
              setImageError(true);
              setIsLoading(false);
            }}
            className={`w-full h-full object-contain p-1 transition-transform duration-300 group-hover:scale-105 ${
              isLoading ? 'opacity-0' : 'opacity-100'
            }`}
          />
        </>
      ) : (
        /* Stylized Ticket Graphic Fallback */
        <div
          className={`w-full h-full bg-gradient-to-b ${getTicketTheme(
            price
          )} p-3 flex flex-col justify-between text-white border-2 select-none`}
        >
          {/* Header */}
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase font-bold tracking-wider text-amber-300">
              New Jersey Lottery
            </span>
            <span className="bg-amber-400 text-slate-950 text-xs font-black px-1.5 py-0.5 rounded">
              ${price}
            </span>
          </div>

          {/* Body */}
          <div className="text-center my-auto px-1">
            <div className="text-sm font-extrabold tracking-tight uppercase line-clamp-2 drop-shadow">
              {gameName}
            </div>
            <div className="mt-2 inline-block bg-black/40 border border-amber-300/40 rounded px-2 py-1">
              <div className="text-[9px] uppercase tracking-wider text-amber-200">
                Top Prize
              </div>
              <div className="text-xs font-black text-amber-400">{topPrize}</div>
            </div>
          </div>

          {/* Scratch latex area simulation */}
          <div className="bg-slate-300/20 rounded border border-white/20 p-2 text-center backdrop-blur-sm">
            <div className="grid grid-cols-3 gap-1">
              <div className="h-4 bg-slate-400/40 rounded-sm"></div>
              <div className="h-4 bg-slate-400/40 rounded-sm"></div>
              <div className="h-4 bg-slate-400/40 rounded-sm"></div>
            </div>
            <div className="text-[9px] text-slate-300 mt-1 font-mono">{gameNumber}</div>
          </div>
        </div>
      )}

      {/* Hover Zoom Overlay */}
      {onZoom && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onZoom();
          }}
          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
          title="Zoom in on ticket image"
          aria-label="Zoom in on ticket image"
        >
          <span className="bg-white/90 text-slate-900 text-xs font-semibold px-2.5 py-1.5 rounded-full flex items-center gap-1 shadow-lg hover:bg-white transition-colors">
            <ZoomIn className="w-3.5 h-3.5 text-blue-700" />
            <span>Zoom</span>
          </span>
        </button>
      )}

      {/* Price tag pinned in corner */}
      <div className="absolute top-2 left-2 pointer-events-none">
        <span className="bg-[#002a54]/90 backdrop-blur-sm text-amber-300 text-xs font-black px-2 py-0.5 rounded-md border border-amber-400/40 shadow">
          ${price}
        </span>
      </div>
    </div>
  );
};
