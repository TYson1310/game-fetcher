import React, { useState, useMemo } from 'react';
import { ScratchOffGame, ScratchOffFilters } from '../types/lottery';
import { ScratchCardThumbnail } from './ScratchCardThumbnail';
import { TicketDetailModal } from './TicketDetailModal';
import { TicketImageModal } from './TicketImageModal';
import {
  Search,
  Filter,
  ArrowUpDown,
  X,
  Trophy,
  DollarSign,
  AlertCircle,
  ExternalLink,
  Sparkles,
  LayoutGrid,
  Table as TableIcon,
  ChevronRight,
  Info,
  CheckCircle,
} from 'lucide-react';

interface ScratchOffsViewProps {
  games: ScratchOffGame[];
  isLoading: boolean;
  onPlayInSimulator?: (game: ScratchOffGame) => void;
}

export const ScratchOffsView: React.FC<ScratchOffsViewProps> = ({
  games,
  isLoading,
  onPlayInSimulator,
}) => {
  // Filters state
  const [filters, setFilters] = useState<ScratchOffFilters>({
    price: 'all',
    prizeRange: 'all',
    onlyRemainingTopPrizes: false,
    searchQuery: '',
    sortBy: 'topPrizeDesc',
    viewMode: 'grid',
  });

  // Modal states
  const [selectedGameForDetails, setSelectedGameForDetails] = useState<ScratchOffGame | null>(
    null
  );
  const [selectedGameForZoom, setSelectedGameForZoom] = useState<ScratchOffGame | null>(null);

  // Available price points
  const priceOptions = useMemo(() => {
    const prices = Array.from(new Set(games.map((g) => g.price))).sort((a, b) => a - b);
    return prices;
  }, [games]);

  // Count per price
  const priceCounts = useMemo(() => {
    const map: Record<number | string, number> = { all: games.length };
    games.forEach((g) => {
      map[g.price] = (map[g.price] || 0) + 1;
    });
    return map;
  }, [games]);

  // Top Prize range options
  const prizeRangeOptions = [
    { id: 'all', label: 'All Top Prizes' },
    { id: '5m+', label: '$5,000,000+', min: 5000000, max: Infinity },
    { id: '2m-5m', label: '$2M - $5M', min: 2000000, max: 4999999 },
    { id: '1m-2m', label: '$1M - $2M', min: 1000000, max: 1999999 },
    { id: '500k-1m', label: '$500K - $1M', min: 500000, max: 999999 },
    { id: '100k-500k', label: '$100K - $500K', min: 100000, max: 499999 },
    { id: 'under-100k', label: 'Under $100K', min: 0, max: 99999 },
  ];

  // Filtering & sorting logic
  const filteredGames = useMemo(() => {
    return games
      .filter((game) => {
        // Price filter
        if (filters.price !== 'all' && game.price !== filters.price) {
          return false;
        }

        // Top prize range filter
        if (filters.prizeRange !== 'all') {
          const rangeObj = prizeRangeOptions.find((r) => r.id === filters.prizeRange);
          if (rangeObj && (rangeObj.min !== undefined || rangeObj.max !== undefined)) {
            const amt = game.topPrizeAmount;
            if (amt < (rangeObj.min ?? 0) || amt > (rangeObj.max ?? Infinity)) {
              return false;
            }
          }
        }

        // Only with top prizes remaining
        if (filters.onlyRemainingTopPrizes && game.topPrizesRemaining <= 0) {
          return false;
        }

        // Search Query (name or game number)
        if (filters.searchQuery.trim()) {
          const q = filters.searchQuery.toLowerCase().trim();
          const matchesName = game.gameName.toLowerCase().includes(q);
          const matchesNumber = game.gameNumber.toLowerCase().includes(q);
          const matchesPrice = game.formattedPrice.toLowerCase().includes(q);
          const matchesPrize = game.topPrize.toLowerCase().includes(q);
          if (!matchesName && !matchesNumber && !matchesPrice && !matchesPrize) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        switch (filters.sortBy) {
          case 'topPrizeDesc':
            return b.topPrizeAmount - a.topPrizeAmount;
          case 'topPrizeAsc':
            return a.topPrizeAmount - b.topPrizeAmount;
          case 'priceDesc':
            return b.price - a.price;
          case 'priceAsc':
            return a.price - b.price;
          case 'remainingPercent':
            return b.topPrizesPercentRemaining - a.topPrizesPercentRemaining;
          case 'newest':
            return (b.launchDate || 0) - (a.launchDate || 0);
          case 'name':
            return a.gameName.localeCompare(b.gameName);
          default:
            return 0;
        }
      });
  }, [games, filters]);

  const hasActiveFilters =
    filters.price !== 'all' ||
    filters.prizeRange !== 'all' ||
    filters.onlyRemainingTopPrizes ||
    filters.searchQuery.trim() !== '';

  const resetFilters = () => {
    setFilters({
      price: 'all',
      prizeRange: 'all',
      onlyRemainingTopPrizes: false,
      searchQuery: '',
      sortBy: 'topPrizeDesc',
      viewMode: filters.viewMode,
    });
  };

  return (
    <div className="space-y-6">
      {/* Hero / Overview Banner */}
      <div className="bg-gradient-to-r from-[#002a54] via-[#003870] to-[#001c3a] border border-[#004b93] rounded-2xl p-6 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-amber-400 font-semibold text-xs tracking-wider uppercase">
                Active Scratch-Off Catalog
              </span>
              <span className="text-blue-300 text-xs">·</span>
              <span className="text-blue-200 text-xs">
                Updated Daily from NJLottery.com
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              New Jersey Scratch-Offs
            </h1>
            <p className="text-sm text-blue-200 mt-1 max-w-2xl">
              Browse all {games.length} currently active scratch tickets. Filter by ticket price,
              top prize payout, and remaining prize counts. Click any ticket image to inspect ticket details.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto bg-black/30 border border-blue-400/20 px-4 py-3 rounded-xl backdrop-blur-sm">
            <div className="text-right">
              <div className="text-xs text-blue-200">Active Tickets</div>
              <div className="text-2xl font-black text-amber-400">{games.length}</div>
            </div>
            <div className="h-8 w-px bg-blue-400/30"></div>
            <div className="text-right">
              <div className="text-xs text-blue-200">Top Payout</div>
              <div className="text-2xl font-black text-emerald-400">$5,000,000</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
        {/* Top Row: Search + Sort + View switcher */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by game name (e.g. Crossword, 7s) or game # (e.g. 1851)..."
              value={filters.searchQuery}
              onChange={(e) => setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))}
              className="w-full bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 rounded-xl pl-10 pr-9 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-amber-500 transition-colors"
            />
            {filters.searchQuery && (
              <button
                onClick={() => setFilters((prev) => ({ ...prev, searchQuery: '' }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Sort dropdown */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={filters.sortBy}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, sortBy: e.target.value as any }))
                }
                className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl pl-8 pr-8 py-2.5 appearance-none focus:outline-none focus:border-amber-500 transition-colors cursor-pointer"
              >
                <option value="topPrizeDesc">Top Prize: High to Low</option>
                <option value="topPrizeAsc">Top Prize: Low to High</option>
                <option value="priceDesc">Ticket Price: High to Low</option>
                <option value="priceAsc">Ticket Price: Low to High</option>
                <option value="remainingPercent">Top Prizes Left % (Best Odds)</option>
                <option value="newest">Newest Launch Date</option>
                <option value="name">Game Name (A-Z)</option>
              </select>
            </div>

            {/* View Mode Switcher */}
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1">
              <button
                onClick={() => setFilters((prev) => ({ ...prev, viewMode: 'grid' }))}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  filters.viewMode === 'grid'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Grid view"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setFilters((prev) => ({ ...prev, viewMode: 'table' }))}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  filters.viewMode === 'table'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Table view"
              >
                <TableIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Second Row: Filter by Price */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span className="flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-amber-400" />
              <span>Filter by Ticket Price:</span>
            </span>
            {filters.price !== 'all' && (
              <span className="text-amber-400 font-semibold">Active: ${filters.price}</span>
            )}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            <button
              onClick={() => setFilters((prev) => ({ ...prev, price: 'all' }))}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                filters.price === 'all'
                  ? 'bg-amber-500 text-slate-950 shadow-sm font-bold'
                  : 'bg-slate-950 text-slate-300 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              All Prices ({priceCounts['all'] || 0})
            </button>

            {priceOptions.map((price) => (
              <button
                key={price}
                onClick={() => setFilters((prev) => ({ ...prev, price }))}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-all cursor-pointer flex items-center gap-1 ${
                  filters.price === price
                    ? 'bg-amber-500 text-slate-950 shadow-sm font-bold'
                    : 'bg-slate-950 text-slate-300 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                <span>${price}</span>
                <span className="text-[10px] opacity-75">({priceCounts[price] || 0})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Third Row: Filter by Top Prize Amount & Availability */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
          {/* Top Prize Range Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            <span className="text-xs text-slate-400 font-medium shrink-0 flex items-center gap-1 mr-1">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>Top Prize:</span>
            </span>

            {prizeRangeOptions.map((range) => (
              <button
                key={range.id}
                onClick={() => setFilters((prev) => ({ ...prev, prizeRange: range.id }))}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium shrink-0 transition-colors cursor-pointer ${
                  filters.prizeRange === range.id
                    ? 'bg-emerald-600 text-white font-bold shadow-sm'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>

          {/* Toggle: Only Top Prizes Remaining */}
          <div className="flex items-center gap-4 shrink-0">
            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={filters.onlyRemainingTopPrizes}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, onlyRemainingTopPrizes: e.target.checked }))
                }
                className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-amber-500 cursor-pointer"
              />
              <span>Top Prizes Still Available</span>
            </label>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 underline underline-offset-2 cursor-pointer"
              >
                <X className="w-3 h-3" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Results Count & Status Bar */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <div>
          Showing <span className="font-bold text-white">{filteredGames.length}</span> of{' '}
          <span className="font-semibold text-slate-300">{games.length}</span> active tickets
        </div>
        {hasActiveFilters && (
          <div className="text-amber-400 font-medium">Filtered Results</div>
        )}
      </div>

      {/* Loading State */}
      {isLoading && games.length === 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="bg-slate-900 border border-slate-800 rounded-xl p-3 animate-pulse space-y-3"
            >
              <div className="w-full aspect-[3/4] bg-slate-800 rounded-lg"></div>
              <div className="h-4 bg-slate-800 rounded w-3/4"></div>
              <div className="h-3 bg-slate-800 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredGames.length === 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 space-y-4">
          <div className="w-12 h-12 rounded-full bg-slate-800 text-amber-400 flex items-center justify-center mx-auto">
            <Filter className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">No Scratch-Offs Matched Your Filters</h3>
            <p className="text-xs text-slate-400 mt-1">
              Try broadening your price selection or resetting the prize range filters.
            </p>
          </div>
          <button
            onClick={resetFilters}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-colors cursor-pointer inline-flex items-center gap-1.5"
          >
            <span>Reset All Filters</span>
          </button>
        </div>
      )}

      {/* Grid View */}
      {filters.viewMode === 'grid' && filteredGames.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-5">
          {filteredGames.map((game) => (
            <div
              key={game.gameId}
              onClick={() => setSelectedGameForDetails(game)}
              className="bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-2xl p-4 transition-all duration-200 hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between group cursor-pointer"
            >
              <div>
                {/* Ticket Picture Thumbnail */}
                <ScratchCardThumbnail
                  gameName={game.gameName}
                  gameNumber={game.gameNumber}
                  price={game.price}
                  imageUrl={game.imageUrl}
                  topPrize={game.topPrize}
                  onZoom={() => setSelectedGameForZoom(game)}
                  className="mb-3.5"
                />

                {/* Game Title & Number */}
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-white text-sm line-clamp-1 group-hover:text-amber-300 transition-colors">
                    {game.gameName}
                  </h3>
                  <span className="text-[11px] font-mono text-slate-400 shrink-0">
                    {game.gameNumber}
                  </span>
                </div>

                {/* Top Prize Badge */}
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-medium">Top Prize:</span>
                  <span className="text-sm font-extrabold text-amber-400">
                    {game.topPrize}
                  </span>
                </div>

                {/* Top Prizes Remaining Counter */}
                <div className="mt-2.5 bg-slate-950 rounded-lg p-2 border border-slate-800/80">
                  <div className="flex justify-between items-center text-[11px] mb-1">
                    <span className="text-slate-400">Top Prizes Left:</span>
                    <span
                      className={`font-bold ${
                        game.topPrizesRemaining === 0
                          ? 'text-red-400'
                          : game.topPrizesPercentRemaining < 25
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {game.topPrizesRemaining} of {game.topPrizesTotal}
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
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

                {/* Launch date info */}
                <div className="mt-2 text-[10px] text-slate-400">
                  Released: {game.launchDateFormatted}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-3.5 pt-3 border-t border-slate-800 flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedGameForDetails(game);
                  }}
                  className="flex-1 py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition-colors text-center cursor-pointer flex items-center justify-center gap-1"
                >
                  <span>Prize Tiers</span>
                  <ChevronRight className="w-3 h-3 text-slate-400" />
                </button>

                {onPlayInSimulator && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onPlayInSimulator(game);
                    }}
                    className="py-1.5 px-2 bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 rounded-lg text-xs font-bold transition-colors cursor-pointer border border-amber-500/30"
                    title="Virtually scratch this ticket"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Table View */}
      {filters.viewMode === 'table' && filteredGames.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4 font-semibold">Ticket</th>
                  <th className="py-3 px-3 font-semibold">Game Name</th>
                  <th className="py-3 px-3 font-semibold">Price</th>
                  <th className="py-3 px-3 font-semibold">Top Prize</th>
                  <th className="py-3 px-3 font-semibold text-center">Top Prizes Remaining</th>
                  <th className="py-3 px-3 font-semibold">Launch Date</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredGames.map((game) => (
                  <tr
                    key={game.gameId}
                    onClick={() => setSelectedGameForDetails(game)}
                    className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
                  >
                    {/* Small Ticket Picture */}
                    <td className="py-2.5 px-4 w-16">
                      <div className="w-12 h-16 rounded overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center">
                        <img
                          src={game.imageUrl}
                          alt={game.gameName}
                          className="w-full h-full object-contain p-0.5"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                    </td>

                    {/* Name & ID */}
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-white group-hover:text-amber-300 transition-colors">
                        {game.gameName}
                      </div>
                      <div className="text-[11px] font-mono text-slate-400">
                        {game.gameNumber}
                      </div>
                    </td>

                    {/* Price */}
                    <td className="py-2.5 px-3">
                      <span className="font-black text-amber-300 bg-amber-950/60 border border-amber-600/30 px-2 py-0.5 rounded">
                        {game.formattedPrice}
                      </span>
                    </td>

                    {/* Top Prize */}
                    <td className="py-2.5 px-3">
                      <div className="font-extrabold text-amber-400 text-sm">
                        {game.topPrize}
                      </div>
                    </td>

                    {/* Top Prizes Remaining */}
                    <td className="py-2.5 px-3 text-center">
                      <div className="font-semibold text-white">
                        {game.topPrizesRemaining} / {game.topPrizesTotal}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        ({game.topPrizesPercentRemaining}% available)
                      </div>
                    </td>

                    {/* Launch Date */}
                    <td className="py-2.5 px-3 text-slate-300 font-mono text-[11px]">
                      {game.launchDateFormatted}
                    </td>

                    {/* Actions */}
                    <td className="py-2.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedGameForDetails(game);
                          }}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-semibold transition-colors"
                        >
                          Tiers
                        </button>
                        {onPlayInSimulator && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onPlayInSimulator(game);
                            }}
                            className="p-1 bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 rounded transition-colors"
                            title="Play Simulator"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      <TicketDetailModal
        game={selectedGameForDetails}
        onClose={() => setSelectedGameForDetails(null)}
        onPlayInSimulator={onPlayInSimulator}
      />

      <TicketImageModal
        game={selectedGameForZoom}
        onClose={() => setSelectedGameForZoom(null)}
      />
    </div>
  );
};
