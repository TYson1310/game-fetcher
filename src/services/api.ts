import { ScratchOffResponse, WinningNumbersResponse } from '../types/lottery';

export async function fetchScratchOffs(forceRefresh = false): Promise<ScratchOffResponse> {
  const url = forceRefresh ? '/api/scratch-offs?refresh=true' : '/api/scratch-offs';
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch scratch-off games: ${response.statusText}`);
  }
  return response.json();
}

export async function fetchWinningNumbers(forceRefresh = false): Promise<WinningNumbersResponse> {
  const url = forceRefresh ? '/api/winning-numbers?refresh=true' : '/api/winning-numbers';
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch winning numbers: ${response.statusText}`);
  }
  return response.json();
}

export function getProxyImageUrl(originalUrl: string): string {
  if (!originalUrl) return '';
  return `/api/image-proxy?url=${encodeURIComponent(originalUrl)}`;
}
