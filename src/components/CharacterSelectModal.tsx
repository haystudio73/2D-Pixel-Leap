import React, { useEffect, useRef, useState } from 'react';
import { 
  CHARACTERS, 
  CharacterConfig, 
  isCharacterUnlocked, 
  setSelectedCharacterId 
} from '../game/characters';
import { GameRenderer } from '../game/renderer';
import { sound } from '../game/audio';
import { Sparkles, Lock, CheckCircle2, Shield, Zap, X } from 'lucide-react';

interface CharacterSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSkinId: string;
  onSelectSkin: (id: string) => void;
  highScore: number;
  maxLevelCleared: number;
}

export const CharacterSelectModal: React.FC<CharacterSelectModalProps> = ({
  isOpen,
  onClose,
  selectedSkinId,
  onSelectSkin,
  highScore,
  maxLevelCleared,
}) => {
  const [activePreviewId, setActivePreviewId] = useState<string>(selectedSkinId);
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Sync active preview when modal opens
  useEffect(() => {
    if (isOpen) {
      setActivePreviewId(selectedSkinId);
    }
  }, [isOpen, selectedSkinId]);

  const activeChar: CharacterConfig = 
    CHARACTERS.find((c) => c.id === activePreviewId) || CHARACTERS[0];

  const isCurrentUnlocked = isCharacterUnlocked(activeChar, highScore, maxLevelCleared);
  const isCurrentEquipped = activeChar.id === selectedSkinId;

  // Real-time animated canvas preview of the character
  useEffect(() => {
    if (!isOpen || !previewCanvasRef.current) return;

    const canvas = previewCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let startTime = performance.now();

    const renderLoop = (time: number) => {
      const elapsed = (time - startTime) / 1000;

      // Clear canvas with deep neon background
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Radial stage backlight
      const grad = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2 + 10,
        10,
        canvas.width / 2,
        canvas.height / 2 + 10,
        canvas.width * 0.48
      );
      grad.addColorStop(0, `${activeChar.colors.aura}33`);
      grad.addColorStop(1, 'rgba(15, 23, 42, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Pedestal Platform
      const pw = 84;
      const py = canvas.height / 2 + 48;
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(canvas.width / 2 - pw / 2, py, pw, 8);
      ctx.fillStyle = activeChar.colors.visorGlow;
      ctx.fillRect(canvas.width / 2 - pw / 2, py, pw, 2);

      // Render the animated pixel character at 3.5x scale
      GameRenderer.renderCharacterPreview(
        ctx,
        activeChar,
        canvas.width / 2,
        canvas.height / 2 + 12,
        3.5,
        elapsed
      );

      animFrameRef.current = requestAnimationFrame(renderLoop);
    };

    animFrameRef.current = requestAnimationFrame(renderLoop);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isOpen, activePreviewId, activeChar]);

  if (!isOpen) return null;

  const handleSelect = (char: CharacterConfig) => {
    sound.init();
    sound.buttonClick();
    setActivePreviewId(char.id);
  };

  const handleEquip = () => {
    if (!isCurrentUnlocked) return;
    sound.init();
    sound.powerupCollect();
    setSelectedCharacterId(activeChar.id);
    onSelectSkin(activeChar.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-4xl bg-slate-900 border-2 border-cyan-500/60 rounded-xl shadow-[0_0_50px_rgba(6,182,212,0.3)] overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950/80 border-b border-cyan-500/30">
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-cyan-400 animate-pulse" />
            <div>
              <h2 className="text-xl font-bold tracking-wider text-cyan-400 font-mono">
                CHARACTER CUSTOMIZATION
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Unlock legendary cyber avatars with high scores and stage mastery
              </p>
            </div>
          </div>

          {/* Quick Stats Badges */}
          <div className="hidden sm:flex items-center gap-3">
            <div className="px-3 py-1.5 bg-slate-900 border border-amber-500/40 rounded-md font-mono text-xs text-amber-300">
              BEST: <span className="text-white font-bold">{highScore.toLocaleString()}</span> PTS
            </div>
            <div className="px-3 py-1.5 bg-slate-900 border border-cyan-500/40 rounded-md font-mono text-xs text-cyan-300">
              CLEARED: <span className="text-white font-bold">{maxLevelCleared} / 4</span> SECTORS
            </div>
          </div>

          <button
            onClick={() => {
              sound.buttonClick();
              onClose();
            }}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Body: Split Roster & Preview */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 p-5 overflow-y-auto">
          
          {/* Left: Character Roster Grid */}
          <div className="md:col-span-7 flex flex-col gap-2.5 overflow-y-auto pr-1 max-h-[60vh] md:max-h-[62vh]">
            {CHARACTERS.map((char) => {
              const unlocked = isCharacterUnlocked(char, highScore, maxLevelCleared);
              const isSelected = char.id === activePreviewId;
              const isEquipped = char.id === selectedSkinId;

              // Progress percentage towards unlocking
              let progressPercent = 100;
              if (!unlocked && char.unlockThreshold > 0) {
                progressPercent = Math.min(99, Math.round((highScore / char.unlockThreshold) * 100));
              }

              return (
                <div
                  key={char.id}
                  onClick={() => handleSelect(char)}
                  className={`relative flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-slate-800/90 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.35)] scale-[1.01]'
                      : unlocked
                      ? 'bg-slate-950/60 border-slate-700/70 hover:border-slate-500 hover:bg-slate-800/50'
                      : 'bg-slate-950/40 border-slate-800/80 opacity-70 hover:opacity-90'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Character Color Swatch / Icon */}
                    <div 
                      className="w-11 h-11 rounded-md border flex items-center justify-center font-mono font-bold text-xs"
                      style={{ 
                        backgroundColor: char.colors.torso, 
                        borderColor: char.colors.visorGlow,
                        boxShadow: `0 0 10px ${char.colors.aura}44`
                      }}
                    >
                      <div 
                        className="w-4 h-4 rounded-sm"
                        style={{ backgroundColor: char.colors.visor }}
                      />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm tracking-wide text-white font-mono">
                          {char.name}
                        </span>
                        {isEquipped && (
                          <span className="px-1.5 py-0.5 text-[9px] font-bold bg-cyan-500 text-slate-950 rounded font-mono">
                            EQUIPPED
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 font-mono">{char.title}</p>
                    </div>
                  </div>

                  {/* Status Indicator */}
                  <div className="flex flex-col items-end text-right">
                    {unlocked ? (
                      <span className="flex items-center gap-1 text-xs font-mono text-emerald-400">
                        <CheckCircle2 className="w-4 h-4" /> UNLOCKED
                      </span>
                    ) : (
                      <div className="flex flex-col items-end">
                        <span className="flex items-center gap-1 text-[11px] font-mono text-rose-400">
                          <Lock className="w-3.5 h-3.5" /> LOCKED
                        </span>
                        <div className="w-24 h-1.5 bg-slate-800 rounded-full mt-1.5 overflow-hidden">
                          <div 
                            className="h-full bg-rose-500 rounded-full transition-all"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                        <span className="text-[9px] text-slate-500 font-mono mt-0.5">
                          {progressPercent}% unlocked
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: Selected Character Details & Live Animated Canvas Preview */}
          <div className="md:col-span-5 flex flex-col bg-slate-950/70 border border-slate-800 rounded-lg p-4 justify-between">
            <div>
              {/* Animated Canvas */}
              <div className="relative w-full h-44 bg-slate-900/90 rounded-lg border border-slate-700/60 flex items-center justify-center overflow-hidden mb-4">
                <canvas
                  ref={previewCanvasRef}
                  width={280}
                  height={176}
                  className="w-full h-full object-contain"
                />
                <div className="absolute top-2 right-2 px-2 py-0.5 bg-slate-950/80 border border-slate-700 rounded text-[9px] font-mono text-cyan-300">
                  LIVE PREVIEW
                </div>
              </div>

              {/* Character Details */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white font-mono">
                    {activeChar.name}
                  </h3>
                  <span className="text-xs text-amber-400 font-mono font-semibold">
                    {activeChar.agilityRating}
                  </span>
                </div>

                <p className="text-xs text-cyan-400 font-mono font-medium">
                  {activeChar.title}
                </p>

                <p className="text-xs text-slate-300 font-mono leading-relaxed">
                  {activeChar.description}
                </p>

                <div className="p-2.5 bg-slate-900 border border-slate-800 rounded text-xs space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-300 font-mono text-[11px]">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-slate-400">Visual Aura:</span>
                    <span className="text-amber-300 font-medium">{activeChar.specialAura}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-300 font-mono text-[11px]">
                    <Shield className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="text-slate-400">Requirement:</span>
                    <span className="text-cyan-300 font-medium">{activeChar.unlockLabel}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Equip / Unlock Action Button */}
            <div className="mt-4 pt-3 border-t border-slate-800">
              {isCurrentEquipped ? (
                <button
                  disabled
                  className="w-full py-2.5 px-4 bg-slate-800 text-cyan-400 font-mono font-bold text-xs rounded-lg border border-cyan-500/30 flex items-center justify-center gap-2 cursor-default"
                >
                  <CheckCircle2 className="w-4 h-4" /> CURRENTLY EQUIPPED
                </button>
              ) : isCurrentUnlocked ? (
                <button
                  onClick={handleEquip}
                  className="w-full py-2.5 px-4 bg-cyan-500 hover:bg-cyan-400 active:scale-95 text-slate-950 font-mono font-bold text-xs rounded-lg shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" /> EQUIP CHARACTER
                </button>
              ) : (
                <button
                  disabled
                  className="w-full py-2.5 px-4 bg-slate-900 text-slate-500 font-mono font-bold text-xs rounded-lg border border-slate-800 flex items-center justify-center gap-2 cursor-not-allowed"
                >
                  <Lock className="w-4 h-4" /> LOCKED: {activeChar.unlockLabel}
                </button>
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
