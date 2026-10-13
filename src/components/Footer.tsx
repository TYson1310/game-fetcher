import React from 'react';
import { ExternalLink, ShieldCheck, HeartHandshake } from 'lucide-react';

interface FooterProps {
  lastUpdated?: string;
}

export const Footer: React.FC<FooterProps> = ({ lastUpdated }) => {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 text-slate-400 text-xs py-8 px-4 mt-12">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-400 flex items-center justify-center text-slate-950 font-black text-sm">
              NJ
            </div>
            <div>
              <div className="font-bold text-white text-sm">
                New Jersey Lottery Explorer
              </div>
              <div className="text-[11px] text-slate-400">
                Live Active Scratch-Offs & Official Draw Results
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs">
            <a
              href="https://www.njlottery.com/en-us/scratch-offs/active.html#tab-active"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-amber-300 transition-colors flex items-center gap-1"
            >
              <span>NJLottery.com Active Scratch-Offs</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href="https://www.njlottery.com/en-us/drawgames.html"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-amber-300 transition-colors flex items-center gap-1"
            >
              <span>Draw Games Hub</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Responsible Gaming & Disclaimers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px] leading-relaxed text-slate-400">
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Official Data & Verification</span>
            </div>
            <p>
              Information displayed is sourced live from the New Jersey Lottery official
              publishing services. Winning numbers and prize balances are for informational
              purposes only. In the event of a discrepancy, the official records of the New
              Jersey Lottery prevail.
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
              <HeartHandshake className="w-3.5 h-3.5" />
              <span>Play Responsibly</span>
            </div>
            <p>
              You must be 18 or older to buy a lottery ticket in New Jersey. If you or someone you
              know has a gambling problem and wants help, call{' '}
              <strong className="text-amber-300 font-bold">1-800-GAMBLER</strong> or visit{' '}
              <a
                href="https://800gambler.org"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-white"
              >
                800gambler.org
              </a>
              .
            </p>
          </div>
        </div>

        {lastUpdated && (
          <div className="pt-2 text-center text-[10px] text-slate-400 border-t border-slate-900">
            Data snapshot synchronized at {new Date(lastUpdated).toLocaleString()}
          </div>
        )}
      </div>
    </footer>
  );
};
