import React, { useState, useEffect } from 'react';
import { Player, GameMode } from '../game/types';
import { submitScore } from '../game/leaderboard';
import { RotateCcw, Trophy, Send, Check, Sparkles, MapPin } from 'lucide-react';

interface GameOverModalProps {
  player: Player;
  mode: GameMode;
  levelId: number;
  hasCheckpoint?: boolean;
  onRespawnCheckpoint?: () => void;
  onRestart: () => void;
  onOpenLeaderboard: (highlightId?: string) => void;
  onOpenCharacterSelect?: () => void;
  onBackToMenu: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  player,
  mode,
  levelId,
  hasCheckpoint,
  onRespawnCheckpoint,
  onRestart,
  onOpenLeaderboard,
  onOpenCharacterSelect,
  onBackToMenu,
}) => {
  const [playerName, setPlayerName] = useState(() => {
    return localStorage.getItem('pixelleap_player_name') || 'PLAYER';
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [rankResult, setRankResult] = useState<number | null>(null);

  // Keyboard shortcut listener for R (Replay) and Space (Save initial/Respawn)
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === 'INPUT') return;
      if (e.code === 'KeyR') {
        e.preventDefault();
        onRestart();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onRestart]);

  const handleSubmitScore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim() || isSubmitting || submitted) return;

    setIsSubmitting(true);
    localStorage.setItem('pixelleap_player_name', playerName.trim().toUpperCase());

    const result = await submitScore({
      name: playerName.trim().toUpperCase(),
      score: player.score,
      mode,
      distance: player.distance,
      coins: player.coins,
      level: levelId,
    });

    setIsSubmitting(false);
    setSubmitted(true);
    if (result.rank) {
      setRankResult(result.rank);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-neutral-950 border-2 border-red-500/80 w-full max-w-md p-6 shadow-[0_0_30px_rgba(239,68,68,0.3)] text-center">
        {/* Game Over Title */}
        <div className="text-xl sm:text-2xl font-pixel text-red-500 mb-2 tracking-widest text-shadow drop-shadow-[0_0_12px_rgba(239,68,68,0.8)] animate-pulse">
          GAME OVER
        </div>
        <p className="text-[11px] font-pixel text-neutral-400 mb-6">
          {mode === 'endless' ? 'THE ODYSSEY CONCLUDED' : 'CRITICAL SYSTEM FAILURE'}
        </p>

        {/* Stats Grid */}
        <div className="bg-neutral-900/60 border border-neutral-800 p-4 mb-6 space-y-3">
          <div>
            <div className="text-[10px] font-pixel text-neutral-500 uppercase tracking-widest">
              FINAL SCORE
            </div>
            <div className="text-2xl font-pixel text-yellow-400 text-glow-amber tracking-wider">
              {player.score.toLocaleString()}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-neutral-800/80">
            <div>
              <div className="text-[9px] font-pixel text-neutral-500">DISTANCE</div>
              <div className="text-xs font-pixel text-cyan-300">{player.distance}m</div>
            </div>
            <div>
              <div className="text-[9px] font-pixel text-neutral-500">COINS</div>
              <div className="text-xs font-pixel text-amber-300">🪙 {player.coins}</div>
            </div>
          </div>
        </div>

        {/* High Score Submission Form */}
        {!submitted ? (
          <form onSubmit={handleSubmitScore} className="mb-6">
            <div className="text-[10px] font-pixel text-neutral-300 mb-2 text-left">
              ENTER INITIALS FOR ONLINE LEADERBOARD:
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                maxLength={10}
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value.toUpperCase())}
                placeholder="YOUR NAME"
                className="flex-1 bg-neutral-900 border border-neutral-700 px-3 py-2 text-xs font-pixel text-yellow-300 uppercase focus:outline-none focus:border-yellow-400 tracking-wider"
              />
              <button
                type="submit"
                disabled={isSubmitting || !playerName.trim()}
                className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-neutral-950 text-xs font-pixel font-bold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                {isSubmitting ? '...' : 'SUBMIT'}
              </button>
            </div>
          </form>
        ) : (
          <div className="mb-6 p-3 bg-emerald-950/60 border border-emerald-500/80 flex items-center justify-between text-emerald-300">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-pixel">
                {rankResult ? `RECORD SAVED! RANK #${rankResult}` : 'SCORE POSTED!'}
              </span>
            </div>
            <button
              onClick={() => onOpenLeaderboard()}
              className="text-[10px] font-pixel text-emerald-200 underline hover:text-white cursor-pointer"
            >
              VIEW
            </button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2">
          {hasCheckpoint && onRespawnCheckpoint && (
            <button
              onClick={onRespawnCheckpoint}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-pixel font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_16px_rgba(16,185,129,0.4)] transition-colors cursor-pointer"
            >
              <MapPin className="w-4 h-4" />
              CONTINUE FROM CHECKPOINT
            </button>
          )}

          <button
            onClick={onRestart}
            className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-neutral-950 font-pixel font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_16px_rgba(6,182,212,0.4)] transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            PLAY AGAIN (PRESS R)
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

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onOpenLeaderboard()}
              className="py-2.5 bg-neutral-900 border border-neutral-700 hover:border-yellow-400 text-neutral-200 hover:text-yellow-300 font-pixel text-[11px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Trophy className="w-3.5 h-3.5" />
              LEADERBOARD
            </button>
            <button
              onClick={onBackToMenu}
              className="py-2.5 bg-neutral-900 border border-neutral-700 hover:border-neutral-500 text-neutral-400 hover:text-neutral-200 font-pixel text-[11px] transition-colors cursor-pointer"
            >
              TITLE MENU
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
