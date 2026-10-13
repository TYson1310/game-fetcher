export interface PrizeTier {
  tierNumber: number;
  prizeDescription: string;
  prizeAmount: number;
  winningTickets: number;
  claimedTickets: number;
  paidTickets: number;
  remainingTickets: number;
}

export interface ScratchOffGame {
  gameId: string;
  gameNumber: string;
  gameName: string;
  price: number;
  formattedPrice: string;
  topPrize: string;
  topPrizeAmount: number;
  topPrizesRemaining: number;
  topPrizesTotal: number;
  topPrizesPercentRemaining: number;
  totalRemainingPrizes: number;
  totalWinningPrizes: number;
  launchDate: number;
  launchDateFormatted: string;
  imageUrl: string;
  imageUrl2x: string;
  detailsUrl: string;
  prizeTiers: PrizeTier[];
}

export interface ScratchOffResponse {
  totalGames: number;
  lastUpdated: string;
  games: ScratchOffGame[];
  fromStaleCache?: boolean;
}

export interface SpecialBall {
  label: string;
  number: string;
  type: 'powerball' | 'megaball' | 'cashball' | 'bullseye';
}

export interface DoublePlayResult {
  primary: string[];
  specialBall?: string;
}

export interface DrawGameResult {
  primary: string[];
  specialBall?: SpecialBall | null;
  multiplier?: string | number | null;
  fireball?: string | null;
  doublePlay?: DoublePlayResult | null;
}

export interface DrawGame {
  id: string;
  gameName: string;
  displayName: string;
  color: string;
  priority: number;
  drawDate: string;
  drawTime: number;
  status: string;
  winningNumbers: DrawGameResult;
  estimatedJackpot: number;
  estimatedJackpotFormatted: string;
  nextDrawTime: number | null;
  nextDrawFormatted: string | null;
}

export interface WinningNumbersResponse {
  lastUpdated: string;
  games: DrawGame[];
  fromStaleCache?: boolean;
}

export type ViewTab = 'scratch-offs' | 'winning-numbers' | 'ticket-checker' | 'simulator';

export interface ScratchOffFilters {
  price: number | 'all';
  prizeRange: string; // 'all' | '5m+' | '1m-5m' | '500k-1m' | '100k-500k' | 'under-100k'
  onlyRemainingTopPrizes: boolean;
  searchQuery: string;
  sortBy: 'topPrizeDesc' | 'topPrizeAsc' | 'priceDesc' | 'priceAsc' | 'remainingPercent' | 'newest' | 'name';
  viewMode: 'grid' | 'table';
}
