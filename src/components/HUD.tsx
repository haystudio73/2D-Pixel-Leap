import React from 'react';
import { Player, BiomeType, WeatherState } from '../game/types';
import { WEATHER_CONFIGS } from '../game/weather';
import { getCharacterById } from '../game/characters';
import { Heart, Volume2, VolumeX, Pause, Music, Zap, Shield, Compass, Sparkles, Clock, User, Settings, Gauge } from 'lucide-react';

interface HUDProps {
  player: Player;
  biome: BiomeType;
  levelName: string;
  isEndless: boolean;
  personalBest: number;
  isMuted: boolean;
  weather?: WeatherState;
  characterSkinId?: string;
  fps?: number;
  showFpsCounter?: boolean;
  onToggleMute: () => void;
  onPause: () => void;
  onOpenAudioSettings: () => void;
  onOpenSettings?: () => void;
  onOpenCharacterSelect?: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  player,
  levelName,
  isEndless,
  personalBest,
  isMuted,
  weather,
  characterSkinId = 'cyber_jumper',
  fps = 60,
  showFpsCounter = false,
  onToggleMute,
  onPause,
  onOpenAudioSettings,
  onOpenSettings,
  onOpenCharacterSelect,
}) => {
  const formattedScore = player.score.toString().padStart(6, '0');
  const formattedBest = personalBest.toString().padStart(6, '0');

  const currentChar = getCharacterById(characterSkinId);
  const weatherConfig = weather ? WEATHER_CONFIGS[weather.type] : null;

  return (
    <div className="absolute top-0 left-0 right-0 p-3 sm:p-4 pointer-events-none flex flex-col gap-2 select-none z-30">
      {/* Top Bar */}
      <div className="flex items-center justify-between gap-2 max-w-5xl mx-auto w-full">
        {/* Left: Score & Best */}
        <div className="flex items-center gap-3 bg-neutral-950/85 backdrop-blur-sm border border-neutral-800/80 px-3.5 py-1.5 shadow-lg">
          <div>
            <div className="text-[9px] uppercase tracking-widest text-neutral-500 font-pixel">
              Score
            </div>
            <div className="text-sm sm:text-base text-yellow-400 font-pixel tracking-wider text-glow-amber">
              {formattedScore}
            </div>
          </div>

          <div className="hidden sm:block w-px h-7 bg-neutral-800" />

          <div className="hidden sm:block">
            <div className="text-[9px] uppercase tracking-widest text-neutral-500 font-pixel">
              High
            </div>
            <div className="text-xs sm:text-sm text-neutral-300 font-pixel tracking-wider">
              {formattedBest}
            </div>
          </div>

          {showFpsCounter && (
            <div className="hidden sm:flex items-center gap-1 pl-2 border-l border-neutral-800 text-[9px] font-pixel text-emerald-400">
              <Gauge className="w-3 h-3" />
              <span>{fps} FPS</span>
            </div>
          )}
        </div>

        {/* Center: Stage / Mode & Distance + Weather Badge */}
        <div className="flex items-center gap-2.5 bg-neutral-950/85 backdrop-blur-sm border border-neutral-800/80 px-3 py-1.5 shadow-lg">
          <div className="text-center">
            <div className="text-[9px] uppercase tracking-widest text-cyan-400 font-pixel">
              {isEndless ? 'Endless Odyssey' : levelName}
            </div>
            <div className="text-xs sm:text-sm text-cyan-200 font-pixel tracking-wider text-glow-cyan">
              {player.distance}m
            </div>
          </div>

          {/* Coins Count */}
          <div className="flex items-center gap-1.5 pl-2 border-l border-neutral-800">
            <div className="w-3.5 h-3.5 bg-amber-400 border border-amber-200 rotate-45 flex items-center justify-center shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
            <span className="text-xs sm:text-sm text-amber-300 font-pixel">
              ×{player.coins}
            </span>
          </div>

          {/* Dynamic Weather Indicator Badge */}
          {weatherConfig && (
            <div 
              className={`hidden md:flex items-center gap-1.5 pl-2 border-l border-neutral-800 px-2 py-0.5 border rounded text-[10px] font-pixel ${weatherConfig.badgeColor}`}
              title={`Active Atmospheric Weather: ${weatherConfig.name} - ${weatherConfig.description}`}
            >
              <span>{weatherConfig.icon}</span>
              <span className="tracking-wider">{weatherConfig.name}</span>
            </div>
          )}
        </div>

        {/* Right: Lives, Character Avatar & Controls */}
        <div className="flex items-center gap-2">
          {/* Lives Counter */}
          <div className="flex items-center gap-1 bg-neutral-950/85 backdrop-blur-sm border border-neutral-800/80 px-3 py-2">
            {Array.from({ length: player.maxLives }).map((_, i) => (
              <Heart
                key={i}
                className={`w-4 h-4 transition-transform duration-200 ${
                  i < player.lives
                    ? 'text-red-500 fill-red-500 drop-shadow-[0_0_6px_rgba(239,68,68,0.8)]'
                    : 'text-neutral-700'
                }`}
              />
            ))}
          </div>

          {/* Interactive Hero Character & System Buttons */}
          <div className="pointer-events-auto flex items-center gap-1">
            {/* Quick Character Customize Button */}
            {onOpenCharacterSelect && (
              <button
                onClick={onOpenCharacterSelect}
                className="flex items-center gap-1.5 px-2 py-1.5 bg-slate-900 border border-cyan-500/50 hover:border-cyan-400 text-cyan-300 hover:text-white transition-all cursor-pointer shadow-[0_0_10px_rgba(6,182,212,0.25)] group"
                title={`Equipped Hero: ${currentChar.name} (${currentChar.title}) - Click to Customize (C)`}
              >
                <div 
                  className="w-3.5 h-3.5 rounded-sm border border-white/40"
                  style={{ backgroundColor: currentChar.colors.visorGlow }}
                />
                <span className="hidden lg:inline text-[9px] font-pixel text-cyan-200 group-hover:text-white">
                  {currentChar.name.split(' ')[0]}
                </span>
                <Sparkles className="w-3 h-3 text-cyan-400 group-hover:rotate-12 transition-transform" />
              </button>
            )}

            <button
              onClick={onToggleMute}
              className="p-2 bg-neutral-900/90 border border-neutral-700 hover:border-cyan-400 hover:text-cyan-400 text-neutral-300 transition-colors cursor-pointer"
              title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* Comprehensive System & Hardware Settings */}
            <button
              onClick={onOpenSettings || onOpenAudioSettings}
              className="p-2 bg-neutral-900/90 border border-neutral-700 hover:border-cyan-400 hover:text-cyan-400 text-neutral-300 transition-colors cursor-pointer"
              title="Hardware Optimization & Sound Settings (O)"
            >
              <Settings className="w-4 h-4" />
            </button>

            <button
              onClick={onPause}
              className="p-2 bg-neutral-900/90 border border-neutral-700 hover:border-yellow-400 hover:text-yellow-400 text-neutral-300 transition-colors cursor-pointer"
              title="Pause Game (ESC or P)"
            >
              <Pause className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Active Power-Ups Row (Glowing Visual Badges) */}
      <div className="flex items-center gap-2 max-w-5xl mx-auto w-full overflow-x-auto py-1">
        {player.activePowerUps.DOUBLE_JUMP > 0 && (
          <div className="flex items-center gap-2 bg-cyan-950/80 border border-cyan-500/80 px-2.5 py-1 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.4)] animate-pulse">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[10px] font-pixel">FLIGHT JUMP</span>
            <span className="text-[10px] font-pixel text-cyan-200">
              {Math.ceil(player.activePowerUps.DOUBLE_JUMP)}s
            </span>
          </div>
        )}

        {player.activePowerUps.SPEED_DASH > 0 && (
          <div className="flex items-center gap-2 bg-amber-950/80 border border-amber-500/80 px-2.5 py-1 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.4)] animate-pulse">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[10px] font-pixel">SONIC DASH</span>
            <span className="text-[10px] font-pixel text-amber-200">
              {Math.ceil(player.activePowerUps.SPEED_DASH)}s
            </span>
          </div>
        )}

        {player.activePowerUps.SHIELD > 0 && (
          <div className="flex items-center gap-2 bg-emerald-950/80 border border-emerald-500/80 px-2.5 py-1 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.4)] animate-pulse">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[10px] font-pixel">SHIELD (2X SCORE)</span>
            <span className="text-[10px] font-pixel text-emerald-200">
              {Math.ceil(player.activePowerUps.SHIELD)}s
            </span>
          </div>
        )}

        {player.activePowerUps.COIN_MAGNET > 0 && (
          <div className="flex items-center gap-2 bg-purple-950/80 border border-purple-500/80 px-2.5 py-1 text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.4)] animate-pulse">
            <Compass className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-[10px] font-pixel">VORTEX MAGNET</span>
            <span className="text-[10px] font-pixel text-purple-200">
              {Math.ceil(player.activePowerUps.COIN_MAGNET)}s
            </span>
          </div>
        )}

        {player.activePowerUps.TIME_WARP > 0 && (
          <div className="flex items-center gap-2 bg-indigo-950/80 border border-indigo-500/80 px-2.5 py-1 text-indigo-300 shadow-[0_0_12px_rgba(99,102,241,0.4)] animate-pulse">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-[10px] font-pixel">TIME WARP (2X)</span>
            <span className="text-[10px] font-pixel text-indigo-200">
              {Math.ceil(player.activePowerUps.TIME_WARP)}s
            </span>
          </div>
        )}

        {/* Quick Controls Hint Badge */}
        <div className="hidden lg:flex items-center gap-2 ml-auto bg-neutral-950/75 border border-neutral-800/80 px-2.5 py-1 text-[9px] font-pixel text-neutral-400">
          <span className="text-yellow-300">🖱️ L-Click / Space:</span> Jump
          <span className="text-neutral-600">|</span>
          <span className="text-amber-300">R-Click / Shift:</span> Dash
          <span className="text-neutral-600">|</span>
          <span className="text-red-400">R:</span> Replay
        </div>
      </div>
    </div>
  );
};
