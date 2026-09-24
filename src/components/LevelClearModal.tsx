import React from 'react';
import { Player } from '../game/types';
import { Sparkles, ArrowRight, RotateCcw, Trophy } from 'lucide-react';

interface LevelClearModalProps {
  player: Player;
  levelId: number;
  onNextLevel: () => void;
  onRestartLevel: () => void;
  onOpenLeaderboard: () => void;
  onOpenCharacterSelect?: () => void;
  hasNextLevel: boolean;
}

export const LevelClearModal: React.FC<LevelClearModalProps> = ({
  player,
  levelId,
  onNextLevel,
  onRestartLevel,
  onOpenLeaderboard,
  onOpenCharacterSelect,
  hasNextLevel,
}) => {
  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-neutral-950 border-2 border-emerald-500/80 w-full max-w-md p-6 shadow-[0_0_30px_rgba(16,185,129,0.3)] text-center">
        <div className="text-xl sm:text-2xl font-pixel text-emerald-400 mb-2 tracking-widest text-glow-emerald animate-bounce">
          STAGE CLEARED!
        </div>
        <p className="text-[11px] font-pixel text-neutral-400 mb-6">
          SECTOR 0{levelId} COMPLETED IN EXCELLENT TIME
        </p>

        {/* Score Card */}
        <div className="bg-neutral-900/60 border border-neutral-800 p-4 mb-6 space-y-3">
          <div>
            <div className="text-[10px] font-pixel text-neutral-500 uppercase tracking-widest">
              CURRENT SCORE
            </div>
            <div className="text-2xl font-pixel text-yellow-400 text-glow-amber tracking-wider">
              {player.score.toLocaleString()}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-neutral-800/80">
            <div>
              <div className="text-[9px] font-pixel text-neutral-500">COINS COLLECTED</div>
              <div className="text-xs font-pixel text-amber-300">🪙 {player.coins}</div>
            </div>
            <div>
              <div className="text-[9px] font-pixel text-neutral-500">LIVES REMAINING</div>
              <div className="text-xs font-pixel text-red-400">♥ {player.lives}</div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2.5">
          {hasNextLevel ? (
            <button
              onClick={onNextLevel}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-pixel font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_16px_rgba(16,185,129,0.4)] transition-colors cursor-pointer"
            >
              NEXT STAGE
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onOpenLeaderboard}
              className="w-full py-3 bg-yellow-500 hover:bg-yellow-400 text-neutral-950 font-pixel font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_16px_rgba(245,158,11,0.4)] transition-colors cursor-pointer"
            >
              <Trophy className="w-4 h-4" />
              VIEW HALL OF FAME
            </button>
          )}

          {onOpenCharacterSelect && (
            <button
              onClick={onOpenCharacterSelect}
              className="w-full py-2.5 bg-neutral-900 border border-purple-500/60 hover:border-purple-400 text-purple-300 hover:text-white font-pixel text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              CUSTOMIZE HERO
            </button>
          )}

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onRestartLevel}
              className="py-2.5 bg-neutral-900 border border-neutral-700 hover:border-neutral-500 text-neutral-200 font-pixel text-[11px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              REPLAY STAGE
            </button>
            <button
              onClick={onOpenLeaderboard}
              className="py-2.5 bg-neutral-900 border border-neutral-700 hover:border-yellow-400 text-neutral-200 hover:text-yellow-300 font-pixel text-[11px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Trophy className="w-3.5 h-3.5" />
              LEADERBOARD
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
