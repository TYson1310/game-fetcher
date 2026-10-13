import React, { useState, useRef, useEffect } from 'react';
import { ScratchOffGame } from '../types/lottery';
import { Sparkles, RotateCcw, Trophy, CheckCircle, Ticket, Eye } from 'lucide-react';

interface ScratchSimulatorProps {
  games: ScratchOffGame[];
  selectedGame?: ScratchOffGame | null;
}

export const ScratchSimulator: React.FC<ScratchSimulatorProps> = ({
  games,
  selectedGame: initialGame,
}) => {
  const [activeGame, setActiveGame] = useState<ScratchOffGame>(
    initialGame || games[0] || ({} as ScratchOffGame)
  );

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isScratching, setIsScratching] = useState(false);
  const [percentScratched, setPercentScratched] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);

  // Generate game board numbers based on ticket
  const [ticketData, setTicketData] = useState<{
    winningNumbers: number[];
    playerPicks: Array<{ number: number; prize: string; isMatch: boolean }>;
    totalWin: number;
    won: boolean;
  }>({
    winningNumbers: [],
    playerPicks: [],
    totalWin: 0,
    won: false,
  });

  const setupGameBoard = (game: ScratchOffGame) => {
    // Generate 2 or 3 winning numbers
    const winNums = [
      Math.floor(Math.random() * 30) + 1,
      Math.floor(Math.random() * 30) + 1,
    ];

    // Generate 6 player spots
    const prizes = ['$5', '$10', '$25', '$50', '$100', game.topPrize || '$500'];
    let won = false;
    let totalWin = 0;

    const picks = Array.from({ length: 6 }).map((_, i) => {
      // 35% chance to match for fun
      const willMatch = Math.random() < 0.35;
      const num = willMatch
        ? winNums[Math.floor(Math.random() * winNums.length)]
        : (Math.floor(Math.random() * 25) + 31);

      const prizeStr = prizes[i % prizes.length];
      const isMatch = winNums.includes(num);

      if (isMatch) {
        won = true;
        totalWin += parseInt(prizeStr.replace(/[^0-9]/g, ''), 10) || 5;
      }

      return {
        number: num,
        prize: prizeStr,
        isMatch,
      };
    });

    setTicketData({
      winningNumbers: winNums,
      playerPicks: picks,
      totalWin,
      won,
    });

    setIsRevealed(false);
    setPercentScratched(0);
    resetCanvas();
  };

  const resetCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.globalCompositeOperation = 'source-over';
    // Silver latex scratch coating with subtle metallic gradient
    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grad.addColorStop(0, '#94a3b8');
    grad.addColorStop(0.3, '#cbd5e1');
    grad.addColorStop(0.5, '#64748b');
    grad.addColorStop(0.7, '#cbd5e1');
    grad.addColorStop(1, '#94a3b8');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add scratch foil security pattern
    ctx.fillStyle = '#475569';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    for (let x = 30; x < canvas.width; x += 60) {
      for (let y = 30; y < canvas.height; y += 40) {
        ctx.fillText('SCRATCH', x, y);
      }
    }
  };

  useEffect(() => {
    if (activeGame && activeGame.gameId) {
      setupGameBoard(activeGame);
    }
  }, [activeGame]);

  const scratch = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 22, 0, Math.PI * 2, false);
    ctx.fill();

    // Calculate approximate percent scratched every few moves
    if (Math.random() < 0.2) {
      checkPercentScratched();
    }
  };

  const checkPercentScratched = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let transparent = 0;
    const total = imgData.data.length / 4;

    for (let i = 3; i < imgData.data.length; i += 16) {
      if (imgData.data[i] < 128) {
        transparent++;
      }
    }

    const pct = Math.round((transparent / (total / 4)) * 100);
    setPercentScratched(pct);
    if (pct > 60) {
      setIsRevealed(true);
    }
  };

  const handleRevealAll = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setIsRevealed(true);
    setPercentScratched(100);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Simulator Intro Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 rounded-2xl p-6 text-slate-950 shadow-xl border border-amber-400">
        <div className="flex items-center gap-2 mb-1 text-slate-900 font-extrabold text-xs tracking-wider uppercase">
          <Sparkles className="w-4 h-4" />
          <span>Interactive Scratch Simulator</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950">
          Virtual NJ Scratch Card
        </h1>
        <p className="text-xs sm:text-sm text-slate-900 font-medium mt-1">
          Pick any active New Jersey scratch-off ticket and scratch the silver latex coating to
          reveal matching numbers and prizes!
        </p>

        {/* Ticket Picker Dropdown */}
        <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <label className="text-xs font-bold text-slate-900 shrink-0">
            Select Active Ticket:
          </label>
          <select
            value={activeGame.gameId}
            onChange={(e) => {
              const selected = games.find((g) => g.gameId === e.target.value);
              if (selected) setActiveGame(selected);
            }}
            className="bg-slate-950 text-white text-xs rounded-xl px-3 py-2 border border-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-300"
          >
            {games.map((g) => (
              <option key={g.gameId} value={g.gameId}>
                {g.formattedPrice} - {g.gameName} (Top Prize: {g.topPrize})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Virtual Scratch Card Area */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col items-center">
        {/* Card Header */}
        <div className="w-full flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
          <div className="flex items-center gap-3">
            <span className="bg-amber-400 text-slate-950 text-xs font-black px-2.5 py-1 rounded-md">
              {activeGame.formattedPrice}
            </span>
            <div>
              <h2 className="text-lg font-bold text-white">{activeGame.gameName}</h2>
              <p className="text-xs text-amber-400 font-semibold">
                Top Prize: {activeGame.topPrize}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setupGameBoard(activeGame)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>New Ticket</span>
            </button>
            <button
              onClick={handleRevealAll}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Scratch All</span>
            </button>
          </div>
        </div>

        {/* Scratch Card Body (Container with Underlay Numbers & Canvas Overlay) */}
        <div className="relative w-full max-w-md aspect-[4/3] rounded-2xl overflow-hidden border-4 border-amber-500/40 shadow-2xl bg-gradient-to-br from-slate-950 to-blue-950 select-none">
          {/* Underneath content: Revealed numbers */}
          <div className="absolute inset-0 p-5 flex flex-col justify-between">
            {/* Top row: Winning numbers */}
            <div className="text-center bg-black/50 p-2.5 rounded-xl border border-amber-400/30">
              <span className="text-[10px] uppercase font-bold text-amber-300 tracking-wider">
                Winning Numbers
              </span>
              <div className="flex justify-center items-center gap-4 mt-1">
                {ticketData.winningNumbers.map((num, i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full bg-amber-400 text-slate-950 font-black text-lg flex items-center justify-center shadow-md border-2 border-amber-200"
                  >
                    {num}
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom row: Your numbers and prizes */}
            <div className="grid grid-cols-3 gap-2">
              {ticketData.playerPicks.map((pick, i) => (
                <div
                  key={i}
                  className={`p-2 rounded-xl text-center border transition-all ${
                    pick.isMatch
                      ? 'bg-emerald-950/80 border-emerald-400 text-emerald-300 scale-105 shadow-lg'
                      : 'bg-slate-900/80 border-slate-800 text-white'
                  }`}
                >
                  <div className="text-lg font-black">{pick.number}</div>
                  <div
                    className={`text-[10px] font-bold ${
                      pick.isMatch ? 'text-amber-300 font-extrabold' : 'text-slate-400'
                    }`}
                  >
                    {pick.prize}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* HTML5 Scratch Canvas Overlay */}
          <canvas
            ref={canvasRef}
            width={448}
            height={336}
            className="absolute inset-0 w-full h-full cursor-crosshair touch-none"
            onMouseDown={() => setIsScratching(true)}
            onMouseUp={() => setIsScratching(false)}
            onMouseLeave={() => setIsScratching(false)}
            onMouseMove={(e) => {
              if (isScratching) scratch(e.clientX, e.clientY);
            }}
            onTouchStart={() => setIsScratching(true)}
            onTouchEnd={() => setIsScratching(false)}
            onTouchMove={(e) => {
              if (e.touches[0]) {
                scratch(e.touches[0].clientX, e.touches[0].clientY);
              }
            }}
          />
        </div>

        {/* Scratch Progress indicator */}
        <div className="w-full max-w-md mt-4 flex items-center justify-between text-xs text-slate-400">
          <span>Scratched: {percentScratched}%</span>
          <span className="text-[11px] text-slate-400">
            Use cursor or touch to scratch silver coating
          </span>
        </div>

        {/* Win / Result Banner */}
        {isRevealed && (
          <div
            className={`w-full max-w-md mt-4 p-4 rounded-xl text-center border animate-fadeIn ${
              ticketData.won
                ? 'bg-emerald-950 border-emerald-500/80 text-emerald-200'
                : 'bg-slate-800 border-slate-700 text-slate-300'
            }`}
          >
            {ticketData.won ? (
              <div>
                <Trophy className="w-7 h-7 text-amber-400 mx-auto mb-1 animate-bounce" />
                <div className="text-base font-extrabold text-white">
                  WINNER! You won ${ticketData.totalWin}!
                </div>
                <p className="text-xs text-emerald-300 mt-0.5">
                  Your numbers matched the winning numbers!
                </p>
              </div>
            ) : (
              <div>
                <div className="text-sm font-bold text-white">No Match This Time</div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Click &quot;New Ticket&quot; to test your luck on another scratch card!
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
