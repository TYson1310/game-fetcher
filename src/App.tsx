/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { ViewTab, ScratchOffGame, DrawGame } from './types/lottery';
import { fetchScratchOffs, fetchWinningNumbers } from './services/api';
import { Navbar } from './components/Navbar';
import { JackpotTicker } from './components/JackpotTicker';
import { ScratchOffsView } from './components/ScratchOffsView';
import { WinningNumbersView } from './components/WinningNumbersView';
import { TicketChecker } from './components/TicketChecker';
import { ScratchSimulator } from './components/ScratchSimulator';
import { Footer } from './components/Footer';
import { AlertCircle, RotateCw } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<ViewTab>('scratch-offs');
  const [scratchGames, setScratchGames] = useState<ScratchOffGame[]>([]);
  const [drawGames, setDrawGames] = useState<DrawGame[]>([]);
  const [isLoadingScratch, setIsLoadingScratch] = useState(true);
  const [isLoadingDraws, setIsLoadingDraws] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | undefined>();
  const [simulatorGame, setSimulatorGame] = useState<ScratchOffGame | null>(null);
  const [checkerInitialGame, setCheckerInitialGame] = useState<string | undefined>();

  // Load scratch-off games
  const loadScratchOffs = useCallback(async (force = false) => {
    setIsLoadingScratch(true);
    try {
      const res = await fetchScratchOffs(force);
      setScratchGames(res.games || []);
      setLastUpdated(res.lastUpdated);
      setErrorMessage(null);
    } catch (err: any) {
      console.error('Error fetching scratch-offs:', err);
      setErrorMessage('Could not load scratch-off data. Please check your connection.');
    } finally {
      setIsLoadingScratch(false);
    }
  }, []);

  // Load winning numbers
  const loadWinningNumbers = useCallback(async (force = false) => {
    setIsLoadingDraws(true);
    try {
      const res = await fetchWinningNumbers(force);
      setDrawGames(res.games || []);
      if (!lastUpdated) setLastUpdated(res.lastUpdated);
    } catch (err: any) {
      console.error('Error fetching winning numbers:', err);
    } finally {
      setIsLoadingDraws(false);
    }
  }, [lastUpdated]);

  // Initial load
  useEffect(() => {
    loadScratchOffs();
    loadWinningNumbers();
  }, [loadScratchOffs, loadWinningNumbers]);

  // Manual refresh all
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([loadScratchOffs(true), loadWinningNumbers(true)]);
    setIsRefreshing(false);
  };

  // Switch to simulator with selected game
  const handlePlayInSimulator = (game: ScratchOffGame) => {
    setSimulatorGame(game);
    setCurrentTab('simulator');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Switch to ticket checker
  const handleCheckNumbers = (gameName: string) => {
    setCheckerInitialGame(gameName);
    setCurrentTab('ticket-checker');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Live Jackpot Banner Ticker */}
      <JackpotTicker
        games={drawGames}
        onSelectGame={(gameName) => {
          handleCheckNumbers(gameName);
        }}
      />

      {/* Main Header / Navigation */}
      <Navbar
        currentTab={currentTab}
        onTabChange={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        scratchCount={scratchGames.length}
        isRefreshing={isRefreshing}
        onRefresh={handleRefresh}
        lastUpdated={lastUpdated}
      />

      {/* Error notification banner if needed */}
      {errorMessage && (
        <div className="bg-red-950/80 border-b border-red-800 text-red-200 px-4 py-2.5 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMessage}</span>
            <button
              onClick={() => handleRefresh()}
              className="ml-auto underline hover:text-white cursor-pointer"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Main View Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {currentTab === 'scratch-offs' && (
          <ScratchOffsView
            games={scratchGames}
            isLoading={isLoadingScratch}
            onPlayInSimulator={handlePlayInSimulator}
          />
        )}

        {currentTab === 'winning-numbers' && (
          <WinningNumbersView
            games={drawGames}
            isLoading={isLoadingDraws}
            onCheckNumbers={handleCheckNumbers}
          />
        )}

        {currentTab === 'ticket-checker' && (
          <TicketChecker games={drawGames} initialGame={checkerInitialGame} />
        )}

        {currentTab === 'simulator' && (
          <ScratchSimulator games={scratchGames} selectedGame={simulatorGame} />
        )}
      </main>

      {/* Footer */}
      <Footer lastUpdated={lastUpdated} />
    </div>
  );
}
