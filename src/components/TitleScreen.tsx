import React, { useState } from 'react';
import { Play, Trophy, Music, HelpCircle, Flame, ArrowRight, Sparkles, CloudRain, UserCheck, Settings, Layers } from 'lucide-react';
import { getSelectedCharacter } from '../game/characters';
import { BiomeType } from '../game/types';

interface TitleScreenProps {
  onStartEndless: () => void;
  onOpenLevelSelect: () => void;
  onOpenLeaderboard: () => void;
  onOpenAudioSettings: () => void;
  onOpenSettings?: () => void;
  onOpenCharacterSelect: () => void;
  personalBest: number;
  activeBiome?: BiomeType;
  onSelectBiome?: (biome: BiomeType) => void;
  isMenuMusicPlaying?: boolean;
  onToggleMenuMusic?: () => void;
}

const STAGE_OPTIONS: { id: BiomeType; label: string; num: string; color: string; bg: string }[] = [
  { id: 'CYBER_CITY', label: 'NEON DISTRICT', num: '01', color: '#38bdf8', bg: 'bg-cyan-950/70 border-cyan-500/60' },
  { id: 'CRYSTAL_CAVERN', label: 'CRYSTAL CAVERN', num: '02', color: '#34d399', bg: 'bg-emerald-950/70 border-emerald-500/60' },
  { id: 'VOLCANIC_CORE', label: 'VOLCANIC CORE', num: '03', color: '#f97316', bg: 'bg-orange-950/70 border-orange-500/60' },
  { id: 'STARLIGHT_CITADEL', label: 'STARLIGHT CITADEL', num: '04', color: '#c084fc', bg: 'bg-purple-950/70 border-purple-500/60' },
];

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStartEndless,
  onOpenLevelSelect,
  onOpenLeaderboard,
  onOpenAudioSettings,
  onOpenSettings,
  onOpenCharacterSelect,
  personalBest,
  activeBiome = 'CYBER_CITY',
  onSelectBiome,
  isMenuMusicPlaying = false,
  onToggleMenuMusic,
}) => {
  const [showHelp, setShowHelp] = useState(false);
  const activeChar = getSelectedCharacter();

  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-between p-4 sm:p-6 select-none overflow-y-auto">
      {/* Top Menu Bar: Stage Background Selector, Audio Controls, Hero Customization */}
      <div className="w-full max-w-5xl flex flex-wrap items-center justify-between gap-2.5 text-xs font-pixel text-neutral-400">
        {/* Left Side: Arcade Status & Stage Background Theme Selector (Moved to Top Menu) */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 px-2 py-1 bg-neutral-900/90 border border-neutral-800 rounded">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
            <span className="text-emerald-400 text-glow-emerald text-[10px]">ARCADE READY</span>
          </div>

          {/* Stage Background Theme Selector */}
          {onSelectBiome && (
            <div className="flex items-center gap-1 bg-neutral-950/90 border border-neutral-800/90 p-1 rounded">
              <span className="hidden sm:flex items-center gap-1 text-[9px] text-cyan-400 px-1 font-pixel">
                <Layers className="w-3 h-3 text-cyan-400" /> STAGE:
              </span>
              <div className="flex items-center gap-1">
                {STAGE_OPTIONS.map((opt) => {
                  const isActive = activeBiome === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => onSelectBiome(opt.id)}
                      className={`px-2 py-0.5 border text-[9px] font-pixel transition-all cursor-pointer rounded-xs flex items-center gap-1 ${
                        isActive
                          ? `${opt.bg} text-white font-bold ring-1 ring-white/50 shadow-[0_0_10px_rgba(255,255,255,0.25)]`
                          : 'bg-neutral-900/80 border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700'
                      }`}
                      title={`Switch background to ${opt.label}`}
                    >
                      <span className="opacity-60 text-[8px]">#{opt.num}</span>
                      <span style={{ color: isActive ? '#ffffff' : opt.color }}>
                        {opt.label.split(' ')[0]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Audio Button, Hero Skins, Personal Best (Moved to Top Menu) */}
        <div className="flex items-center gap-2">
          {/* Audio Controls (Combines BGM toggle & Audio settings modal trigger) */}
          <div className="flex items-center bg-neutral-900/90 border border-neutral-800 rounded overflow-hidden">
            {onToggleMenuMusic && (
              <button
                onClick={onToggleMenuMusic}
                className={`flex items-center gap-1 px-2.5 py-1 text-[10px] font-pixel transition-colors cursor-pointer border-r border-neutral-800 ${
                  isMenuMusicPlaying
                    ? 'bg-cyan-950/80 text-cyan-300'
                    : 'text-neutral-500 hover:text-neutral-300'
                }`}
                title={isMenuMusicPlaying ? 'Mute Menu BGM' : 'Play Menu BGM'}
              >
                <Music className={`w-3 h-3 ${isMenuMusicPlaying ? 'text-cyan-400 animate-pulse' : 'text-neutral-500'}`} />
                <span>{isMenuMusicPlaying ? 'BGM ON' : 'BGM OFF'}</span>
              </button>
            )}
            <button
              onClick={onOpenAudioSettings}
              className="px-2.5 py-1 text-[10px] font-pixel text-neutral-300 hover:text-cyan-300 hover:bg-neutral-800/60 transition-colors cursor-pointer"
              title="Open Audio Settings"
            >
              AUDIO
            </button>
          </div>

          {/* Hero Customization / Skins */}
          <button
            onClick={onOpenCharacterSelect}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-900/90 border border-purple-500/50 hover:border-purple-400 rounded cursor-pointer transition-all shadow-[0_0_10px_rgba(168,85,247,0.25)] hover:shadow-[0_0_15px_rgba(168,85,247,0.45)] group"
            title="Click to customize hero skins"
          >
            <div 
              className="w-2.5 h-2.5 rounded-sm shadow-[0_0_6px_currentColor]"
              style={{ backgroundColor: activeChar.colors.visorGlow }}
            />
            <span className="text-purple-300 group-hover:text-purple-200 font-pixel text-[10px]">
              HERO: {activeChar.name.split(' ')[0]}
            </span>
            <Sparkles className="w-3 h-3 text-amber-400" />
          </button>

          {/* Best Score */}
          {personalBest > 0 && (
            <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 bg-neutral-900/80 border border-amber-500/30 rounded text-yellow-400 text-glow-amber text-[10px]">
              <Flame className="w-3 h-3 fill-yellow-400" />
              <span>BEST: {personalBest.toLocaleString()}</span>
            </div>
          )}
        </div>
      </div>

      {/* Hero Title Section */}
      <div className="my-auto flex flex-col items-center text-center py-4">
        {/* Animated Pixel Hero Icon */}
        <div 
          onClick={onOpenCharacterSelect}
          className="relative mb-5 cursor-pointer group"
          title="Click to customize character skins"
        >
          <div 
            className="w-16 h-16 sm:w-20 sm:h-20 bg-cyan-950/70 border-2 border-cyan-400 flex items-center justify-center shadow-[0_0_25px_rgba(6,182,212,0.5)] transform group-hover:scale-110 transition-transform"
            style={{ borderColor: activeChar.colors.visorGlow }}
          >
            <div className="relative">
              {/* Pixel character graphic tailored to selected skin */}
              <div 
                className="w-8 h-8 sm:w-10 sm:h-10 relative"
                style={{ backgroundColor: activeChar.colors.head }}
              >
                <div 
                  className="absolute top-2 right-1 w-4 h-2 shadow-[0_0_6px_#ffffff]"
                  style={{ backgroundColor: activeChar.colors.visor }}
                />
                <div 
                  className="absolute -bottom-3 left-1 w-2.5 h-3"
                  style={{ backgroundColor: activeChar.colors.legs }}
                />
                <div 
                  className="absolute -bottom-3 right-1 w-2.5 h-3"
                  style={{ backgroundColor: activeChar.colors.legs }}
                />
                <div 
                  className="absolute -left-2 top-2 w-2 h-4"
                  style={{ backgroundColor: activeChar.colors.cape }}
                />
              </div>
            </div>
          </div>
          <div className="absolute -bottom-2 -right-2 bg-amber-500 text-neutral-950 font-pixel text-[9px] px-1.5 py-0.5 font-bold shadow-[0_0_8px_rgba(245,158,11,0.8)] flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5" /> SKINS
          </div>
        </div>

        {/* Main Title */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-pixel text-transparent bg-clip-text bg-gradient-to-b from-cyan-300 via-sky-400 to-indigo-500 tracking-wider mb-2 drop-shadow-[0_0_20px_rgba(6,182,212,0.6)]">
          PIXEL LEAP
        </h1>
        <p className="text-xs sm:text-sm font-pixel text-neutral-300 tracking-widest max-w-lg mb-6 text-glow-cyan">
          RETRO 2D PLATFORMER ODYSSEY
        </p>

        {/* Menu Buttons (Clean, Streamlined, No Clutter) */}
        <div className="w-full max-w-sm space-y-3">
          <button
            onClick={onStartEndless}
            className="w-full py-3.5 sm:py-4 bg-cyan-500 hover:bg-cyan-400 text-neutral-950 font-pixel font-bold text-xs sm:text-sm flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(6,182,212,0.5)] transition-all transform hover:-translate-y-0.5 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            ENDLESS ODYSSEY
          </button>

          <button
            onClick={onOpenLevelSelect}
            className="w-full py-3 sm:py-3.5 bg-neutral-900/90 border-2 border-neutral-700 hover:border-cyan-400 text-neutral-200 hover:text-cyan-300 font-pixel text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-all cursor-pointer"
          >
            <span>CAMPAIGN STAGES</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Secondary Buttons Row: Scores & Config */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <button
              onClick={onOpenLeaderboard}
              className="py-2.5 bg-neutral-900/90 border border-neutral-800 hover:border-yellow-400 text-neutral-300 hover:text-yellow-300 font-pixel text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Trophy className="w-3.5 h-3.5 text-yellow-400" />
              <span>SCORES</span>
            </button>

            <button
              onClick={onOpenSettings || onOpenAudioSettings}
              className="py-2.5 bg-neutral-900/90 border border-neutral-800 hover:border-purple-400 text-neutral-300 hover:text-purple-300 font-pixel text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5 text-purple-400" />
              <span>CONFIG</span>
            </button>
          </div>

          <button
            onClick={() => setShowHelp(!showHelp)}
            className="w-full py-2 text-[11px] font-pixel text-neutral-400 hover:text-neutral-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            {showHelp ? 'HIDE CONTROLS' : 'HOW TO PLAY & ATMOSPHERE'}
          </button>
        </div>

        {/* How to Play Guide Drawer */}
        {showHelp && (
          <div className="mt-5 w-full max-w-lg bg-neutral-950/90 border border-neutral-800 p-4 text-left space-y-4 animate-fade-in shadow-2xl">
            <div>
              <div className="text-[10px] font-pixel text-cyan-400 mb-2">CONTROLS (DESKTOP & MOBILE)</div>
              <div className="grid grid-cols-2 gap-2 text-xs text-neutral-300">
                <div className="bg-neutral-900/80 p-2 border border-neutral-800">
                  <span className="font-pixel text-[10px] text-yellow-400 block">MOVE</span>
                  <span className="text-neutral-400">A / D or Arrow Keys</span>
                </div>
                <div className="bg-neutral-900/80 p-2 border border-neutral-800">
                  <span className="font-pixel text-[10px] text-yellow-400 block">JUMP / DOUBLE JUMP</span>
                  <span className="text-neutral-400">🖱️ Left Click / Space / W</span>
                </div>
                <div className="bg-neutral-900/80 p-2 border border-neutral-800">
                  <span className="font-pixel text-[10px] text-yellow-400 block">SONIC DASH</span>
                  <span className="text-neutral-400">🖱️ Right Click / Shift / X</span>
                </div>
                <div className="bg-neutral-900/80 p-2 border border-neutral-800">
                  <span className="font-pixel text-[10px] text-yellow-400 block">REPLAY / RESTART</span>
                  <span className="text-neutral-400">Press Key R</span>
                </div>
              </div>
            </div>

            {/* Dynamic Weather System */}
            <div>
              <div className="text-[10px] font-pixel text-sky-400 mb-2 flex items-center gap-1.5">
                <CloudRain className="w-3.5 h-3.5 text-sky-400" />
                DYNAMIC WEATHER SYSTEM
              </div>
              <p className="text-xs text-neutral-300 leading-relaxed">
                Atmospheric conditions shift dynamically during gameplay:
                <span className="text-sky-300"> ⚡ Cyber Rain</span> with distant lightning,
                <span className="text-indigo-200"> ❄️ Cosmic Snow</span> with frosty winds,
                <span className="text-amber-400"> 🔥 Ember Storms</span> with rising volcanic motes, and
                <span className="text-emerald-400"> 👾 Data Streams</span> with digital matrix cascades.
              </p>
            </div>

            {/* Character Customization */}
            <div>
              <div className="text-[10px] font-pixel text-purple-400 mb-2 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-purple-400" />
                UNLOCKABLE CHARACTERS
              </div>
              <p className="text-xs text-neutral-300 leading-relaxed">
                Clear campaign sectors or achieve high scores on the leaderboards to unlock 7 unique pixel-art characters—including the <span className="text-purple-300">Neon Shinobi</span>, <span className="text-emerald-300">Crystal Knight</span>, <span className="text-orange-300">Magma Blaze</span>, <span className="text-amber-300">Astro Valkyrie</span>, <span className="text-green-300">Glitch Phantom</span>, and <span className="text-yellow-300">Solar Monarch</span>!
              </p>
            </div>

            <div className="text-[10px] text-neutral-500 font-pixel text-center pt-1 border-t border-neutral-800">
              TIP: Wall-slide down vertical pillars and press Jump to Wall-Jump!
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
