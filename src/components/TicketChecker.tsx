import React, { useState, useMemo } from 'react';
import { DrawGame } from '../types/lottery';
import {
  CheckCircle2,
  Sparkles,
  Trophy,
  RotateCw,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

interface TicketCheckerProps {
  games: DrawGame[];
  initialGame?: string;
}

export const TicketChecker: React.FC<TicketCheckerProps> = ({ games, initialGame }) => {
  const checkableGames = useMemo(() => {
    return games.filter((g) =>
      ['Powerball', 'Mega Millions', 'Cash 5', 'Pick 6', 'Cash 4 Life', 'Pick 4', 'Pick 3'].includes(
        g.gameName
      )
    );
  }, [games]);

  const [selectedGameName, setSelectedGameName] = useState<string>(
    initialGame || checkableGames[0]?.gameName || 'Powerball'
  );

  const currentGame = useMemo(() => {
    return checkableGames.find((g) => g.gameName === selectedGameName) || checkableGames[0];
  }, [checkableGames, selectedGameName]);

  // Number input states
  const [userNumbers, setUserNumbers] = useState<string[]>([]);
  const [userSpecialBall, setUserSpecialBall] = useState<string>('');
  const [userFireball, setUserFireball] = useState<string>('');

  // Required count for current game
  const config = useMemo(() => {
    switch (currentGame?.gameName) {
      case 'Powerball':
        return { primaryCount: 5, maxPrimary: 69, hasSpecial: true, specialName: 'Powerball', maxSpecial: 26 };
      case 'Mega Millions':
        return { primaryCount: 5, maxPrimary: 70, hasSpecial: true, specialName: 'Mega Ball', maxSpecial: 25 };
      case 'Cash 5':
        return { primaryCount: 5, maxPrimary: 45, hasSpecial: true, specialName: 'Bullseye', maxSpecial: 45 };
      case 'Pick 6':
        return { primaryCount: 6, maxPrimary: 46, hasSpecial: false };
      case 'Cash 4 Life':
        return { primaryCount: 5, maxPrimary: 60, hasSpecial: true, specialName: 'Cash Ball', maxSpecial: 4 };
      case 'Pick 4':
        return { primaryCount: 4, maxPrimary: 9, isDigits: true, hasFireball: true };
      case 'Pick 3':
        return { primaryCount: 3, maxPrimary: 9, isDigits: true, hasFireball: true };
      default:
        return { primaryCount: 5, maxPrimary: 69, hasSpecial: false };
    }
  }, [currentGame]);

  // Reset or adjust inputs when game changes
  const handleGameChange = (name: string) => {
    setSelectedGameName(name);
    setUserNumbers([]);
    setUserSpecialBall('');
    setUserFireball('');
  };

  // Quick Pick generator
  const handleQuickPick = () => {
    if (!config) return;
    if (config.isDigits) {
      const nums: string[] = [];
      for (let i = 0; i < config.primaryCount; i++) {
        nums.push(String(Math.floor(Math.random() * 10)));
      }
      setUserNumbers(nums);
      if (config.hasFireball) {
        setUserFireball(String(Math.floor(Math.random() * 10)));
      }
    } else {
      const set = new Set<number>();
      while (set.size < config.primaryCount) {
        set.add(Math.floor(Math.random() * config.maxPrimary) + 1);
      }
      const sorted = Array.from(set).sort((a, b) => a - b).map(String);
      setUserNumbers(sorted);
      if (config.hasSpecial && config.maxSpecial) {
        setUserSpecialBall(String(Math.floor(Math.random() * config.maxSpecial) + 1));
      }
    }
  };

  // Match Calculation
  const matchResults = useMemo(() => {
    if (!currentGame) return null;
    const winning = currentGame.winningNumbers;
    const entered = userNumbers.filter((n) => n.trim() !== '');

    if (entered.length < config.primaryCount) {
      return null;
    }

    if (config.isDigits) {
      // Exact digit match
      const enteredStr = entered.join('');
      const winningStr = winning.primary.join('');
      const isExactMatch = enteredStr === winningStr;
      const fireballMatch = config.hasFireball && userFireball && winning.fireball === userFireball;

      return {
        matchedCount: isExactMatch ? config.primaryCount : 0,
        isExactMatch,
        specialMatched: !!fireballMatch,
        primaryMatches: entered.map((num, i) => num === winning.primary[i]),
        summary: isExactMatch
          ? `WINNER! Straight match on all ${config.primaryCount} digits!`
          : fireballMatch
          ? 'Fireball matched! You may qualify for Fireball prize combinations.'
          : 'No straight match on this ticket.',
        isWinner: isExactMatch || fireballMatch,
      };
    } else {
      // Ball comparison
      const winningPrimaryNums = winning.primary.map(Number);
      const matches = entered.map((n) => winningPrimaryNums.includes(Number(n)));
      const matchedCount = matches.filter(Boolean).length;

      let specialMatched = false;
      if (config.hasSpecial && userSpecialBall && winning.specialBall) {
        specialMatched = Number(userSpecialBall) === Number(winning.specialBall.number);
      }

      // Determine prize tier summary
      let summary = '';
      let isWinner = false;

      if (matchedCount === 5 && specialMatched) {
        summary = 'JACKPOT WINNER! Matched all 5 numbers + Special Ball!';
        isWinner = true;
      } else if (matchedCount === 5) {
        summary = 'Match 5 Winner! Estimated prize: $1,000,000!';
        isWinner = true;
      } else if (matchedCount === 4 && specialMatched) {
        summary = `Match 4 + ${config.specialName}! Estimated prize: $50,000!`;
        isWinner = true;
      } else if (matchedCount === 4) {
        summary = 'Match 4 Winner! Estimated prize: $500!';
        isWinner = true;
      } else if (matchedCount === 3 && specialMatched) {
        summary = `Match 3 + ${config.specialName}! Estimated prize: $100!`;
        isWinner = true;
      } else if (matchedCount === 3) {
        summary = 'Match 3 Winner! Estimated prize: $7 - $10!';
        isWinner = true;
      } else if (specialMatched) {
        summary = `Matched ${config.specialName}! Estimated prize: $4!`;
        isWinner = true;
      } else {
        summary = `Matched ${matchedCount} numbers. Better luck on the next drawing!`;
      }

      return {
        matchedCount,
        specialMatched,
        primaryMatches: matches,
        summary,
        isWinner,
      };
    }
  }, [currentGame, userNumbers, userSpecialBall, userFireball, config]);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-center gap-2 mb-2 text-amber-400 text-xs font-semibold uppercase tracking-wider">
          <CheckCircle2 className="w-4 h-4" />
          <span>Interactive Ticket Checker</span>
        </div>
        <h1 className="text-2xl font-black text-white">Check Your Numbers</h1>
        <p className="text-xs sm:text-sm text-slate-300 mt-1">
          Select your NJ Lottery draw game and enter your ticket numbers to see if you matched the
          most recent drawing!
        </p>

        {/* Game Selector */}
        <div className="mt-5 flex flex-wrap gap-2">
          {checkableGames.map((game) => (
            <button
              key={`${game.gameName}-${game.id}`}
              onClick={() => handleGameChange(game.gameName)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedGameName === game.gameName
                  ? 'bg-amber-500 text-slate-950 shadow-md ring-2 ring-amber-400'
                  : 'bg-slate-950 text-slate-300 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {game.displayName}
            </button>
          ))}
        </div>
      </div>

      {/* Input Board */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
        {/* Game Drawing Info */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-2">
          <div>
            <h2 className="text-lg font-bold text-white">{currentGame?.displayName}</h2>
            <div className="text-xs text-slate-400">
              Drawing Date: <strong className="text-slate-200">{currentGame?.drawDate}</strong>
            </div>
          </div>
          <button
            onClick={handleQuickPick}
            className="self-start sm:self-auto px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 hover:text-amber-300 border border-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate Quick Pick</span>
          </button>
        </div>

        {/* Number Inputs */}
        <div className="space-y-4">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
            Enter Your {config.primaryCount} {config.isDigits ? 'Digits' : 'White Ball Numbers'}:
          </label>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {Array.from({ length: config.primaryCount }).map((_, idx) => (
              <input
                key={idx}
                type="number"
                min={config.isDigits ? 0 : 1}
                max={config.maxPrimary}
                value={userNumbers[idx] || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  const newArr = [...userNumbers];
                  newArr[idx] = val;
                  setUserNumbers(newArr);
                }}
                placeholder={config.isDigits ? '0' : String(idx + 1)}
                className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-700 text-center font-black text-lg text-white focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
              />
            ))}

            {/* Special Ball Input */}
            {config.hasSpecial && (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
                <input
                  type="number"
                  min={1}
                  max={config.maxSpecial}
                  value={userSpecialBall}
                  onChange={(e) => setUserSpecialBall(e.target.value)}
                  placeholder="SB"
                  className="w-12 h-12 rounded-xl bg-red-950/80 border border-red-500/60 text-center font-black text-lg text-red-200 focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-500/30"
                />
                <span className="text-xs font-medium text-red-400">{config.specialName}</span>
              </div>
            )}

            {/* Fireball Input */}
            {config.hasFireball && (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
                <input
                  type="number"
                  min={0}
                  max={9}
                  value={userFireball}
                  onChange={(e) => setUserFireball(e.target.value)}
                  placeholder="FB"
                  className="w-12 h-12 rounded-xl bg-orange-950/80 border border-orange-500/60 text-center font-black text-lg text-orange-200 focus:outline-none focus:border-orange-400"
                />
                <span className="text-xs font-medium text-orange-400">Fireball</span>
              </div>
            )}
          </div>
        </div>

        {/* Results Box */}
        {matchResults ? (
          <div
            className={`p-5 rounded-2xl border transition-all ${
              matchResults.isWinner
                ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-100'
                : 'bg-slate-950 border-slate-800 text-slate-300'
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`p-2 rounded-xl ${
                  matchResults.isWinner ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                }`}
              >
                <Trophy className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-base text-white">{matchResults.summary}</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Official winning balls were:{' '}
                  <strong className="text-white">
                    {currentGame?.winningNumbers.primary.join(' - ')}
                  </strong>
                  {currentGame?.winningNumbers.specialBall && (
                    <span className="text-red-400 font-bold ml-1.5">
                      + {currentGame.winningNumbers.specialBall.label}:{' '}
                      {currentGame.winningNumbers.specialBall.number}
                    </span>
                  )}
                  {currentGame?.winningNumbers.fireball && (
                    <span className="text-orange-400 font-bold ml-1.5">
                      + FIREBALL: {currentGame.winningNumbers.fireball}
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800/80 text-xs text-slate-400 flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-slate-500 shrink-0" />
            <span>
              Enter all {config.primaryCount} numbers above to instantly check against the latest
              NJ Lottery draw results.
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
