import React from 'react';
import { ArrowLeft, ArrowRight, ArrowDown, Zap, ChevronUp } from 'lucide-react';
import { InputState } from '../game/types';

interface TouchControlsProps {
  onInputDown: (key: keyof InputState) => void;
  onInputUp: (key: keyof InputState) => void;
}

export const TouchControls: React.FC<TouchControlsProps> = ({ onInputDown, onInputUp }) => {
  const bindTouch = (key: keyof InputState) => ({
    onTouchStart: (e: React.TouchEvent) => {
      e.preventDefault();
      onInputDown(key);
    },
    onTouchEnd: (e: React.TouchEvent) => {
      e.preventDefault();
      onInputUp(key);
    },
    onMouseDown: (e: React.MouseEvent) => {
      e.preventDefault();
      onInputDown(key);
    },
    onMouseUp: (e: React.MouseEvent) => {
      e.preventDefault();
      onInputUp(key);
    },
    onMouseLeave: () => {
      onInputUp(key);
    },
  });

  return (
    <div className="absolute bottom-4 left-0 right-0 px-4 sm:hidden flex justify-between items-end pointer-events-none select-none z-30">
      {/* Left / Right / Down D-Pad */}
      <div className="flex items-center gap-2 pointer-events-auto">
        <button
          {...bindTouch('left')}
          className="w-14 h-14 bg-neutral-900/90 active:bg-cyan-900/80 border-2 border-neutral-700 active:border-cyan-400 flex items-center justify-center text-cyan-400 shadow-lg cursor-pointer"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        <button
          {...bindTouch('down')}
          className="w-12 h-12 bg-neutral-900/90 active:bg-cyan-900/80 border-2 border-neutral-700 active:border-cyan-400 flex items-center justify-center text-neutral-300 shadow-lg cursor-pointer"
        >
          <ArrowDown className="w-5 h-5" />
        </button>

        <button
          {...bindTouch('right')}
          className="w-14 h-14 bg-neutral-900/90 active:bg-cyan-900/80 border-2 border-neutral-700 active:border-cyan-400 flex items-center justify-center text-cyan-400 shadow-lg cursor-pointer"
        >
          <ArrowRight className="w-6 h-6" />
        </button>
      </div>

      {/* Action Buttons: Jump (A) & Dash (B) */}
      <div className="flex items-center gap-3 pointer-events-auto">
        <button
          {...bindTouch('dash')}
          className="w-14 h-14 bg-neutral-900/90 active:bg-amber-900/80 border-2 border-neutral-700 active:border-amber-400 flex flex-col items-center justify-center text-amber-400 shadow-lg cursor-pointer"
        >
          <Zap className="w-5 h-5" />
          <span className="text-[9px] font-pixel">DASH</span>
        </button>

        <button
          {...bindTouch('jump')}
          className="w-16 h-16 bg-neutral-900/90 active:bg-cyan-900/80 border-2 border-cyan-500 active:border-cyan-300 flex flex-col items-center justify-center text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.4)] cursor-pointer"
        >
          <ChevronUp className="w-6 h-6" />
          <span className="text-[10px] font-pixel">JUMP</span>
        </button>
      </div>
    </div>
  );
};
