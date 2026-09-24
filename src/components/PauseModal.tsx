import React, { useEffect } from 'react';
import { Play, RotateCcw, Volume2, Music, Trophy, Home, Sparkles, Settings } from 'lucide-react';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  onOpenAudioSettings: () => void;
  onOpenSettings?: () => void;
  onOpenLeaderboard: () => void;
  onOpenCharacterSelect?: () => void;
  onBackToMenu: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestart,
  onOpenAudioSettings,
  onOpenSettings,
  onOpenLeaderboard,
  onOpenCharacterSelect,
  onBackToMenu,
}) => {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === 'INPUT') return;
      if (e.code === 'KeyR') {
        e.preventDefault();
        onRestart();
      } else if (e.code === 'Space') {
        e.preventDefault();
        onResume();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onResume, onRestart]);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in select-none">
      <div className="bg-neutral-950 border-2 border-yellow-500/80 w-full max-w-sm p-6 shadow-[0_0_24px_rgba(245,158,11,0.3)] text-center">
        <h2 className="text-xl font-pixel text-yellow-400 mb-6 tracking-widest text-glow-amber">
          GAME PAUSED
        </h2>

        <div className="space-y-2.5">
          <button
            onClick={onResume}
            className="w-full py-3 bg-yellow-500 hover:bg-yellow-400 text-neutral-950 font-pixel font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_12px_rgba(245,158,11,0.4)] transition-colors cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            RESUME GAME (SPACE)
          </button>

          <button
            onClick={onRestart}
            className="w-full py-2.5 bg-neutral-900 border border-neutral-700 hover:border-neutral-500 text-neutral-200 font-pixel text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            RESTART STAGE (R)
          </button>

          {onOpenCharacterSelect && (
            <button
              onClick={onOpenCharacterSelect}
              className="w-full py-2.5 bg-neutral-900 border border-purple-500/60 hover:border-purple-400 text-purple-300 hover:text-white font-pixel text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              CUSTOMIZE HERO
            </button>
          )}

          <button
            onClick={onOpenSettings || onOpenAudioSettings}
            className="w-full py-2.5 bg-neutral-900 border border-neutral-700 hover:border-cyan-400 text-neutral-300 hover:text-cyan-300 font-pixel text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5 text-cyan-400" />
            SETTINGS & HARDWARE
          </button>

          <button
            onClick={onOpenLeaderboard}
            className="w-full py-2.5 bg-neutral-900 border border-neutral-700 hover:border-yellow-400 text-neutral-300 hover:text-yellow-300 font-pixel text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Trophy className="w-3.5 h-3.5 text-yellow-400" />
            HIGH SCORES (SQLITE)
          </button>

          <button
            onClick={onBackToMenu}
            className="w-full py-2.5 bg-neutral-950 border border-neutral-800 hover:border-neutral-600 text-neutral-400 hover:text-neutral-200 font-pixel text-[11px] flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Home className="w-3.5 h-3.5" />
            EXIT TO TITLE
          </button>
        </div>
      </div>
    </div>
  );
};
