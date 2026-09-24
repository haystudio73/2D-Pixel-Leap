import React from 'react';
import { CAMPAIGN_LEVELS } from '../game/levels';
import { BiomeType } from '../game/types';
import { X, Play, MapPin, Eye, Sparkles } from 'lucide-react';

interface LevelSelectModalProps {
  onClose: () => void;
  onSelectLevel: (levelId: number) => void;
  activeBiome?: BiomeType;
  onPreviewBiome?: (biome: BiomeType) => void;
}

interface BiomeThemeMeta {
  badge: string;
  badgeBg: string;
  badgeText: string;
  borderColor: string;
  glowColor: string;
  accentColor: string;
  bgGrad: string;
  highlights: string[];
}

const BIOME_THEMES: Record<BiomeType, BiomeThemeMeta> = {
  CYBER_CITY: {
    badge: 'STAGE 1: NEON METROPOLIS',
    badgeBg: 'bg-cyan-950/80',
    badgeText: 'text-cyan-400',
    borderColor: 'border-cyan-500/60 hover:border-cyan-400',
    glowColor: 'shadow-[0_0_20px_rgba(6,182,212,0.3)]',
    accentColor: '#38bdf8',
    bgGrad: 'from-cyan-950/40 via-neutral-900/80 to-purple-950/40',
    highlights: ['Digital Reticle Moon', 'Mega-Skyscrapers', 'Neon Billboards', 'Flying Speeders'],
  },
  CRYSTAL_CAVERN: {
    badge: 'STAGE 2: SUBTERRANEAN CAVERN',
    badgeBg: 'bg-emerald-950/80',
    badgeText: 'text-emerald-400',
    borderColor: 'border-emerald-500/60 hover:border-emerald-400',
    glowColor: 'shadow-[0_0_20px_rgba(16,185,129,0.3)]',
    accentColor: '#34d399',
    bgGrad: 'from-emerald-950/40 via-neutral-900/80 to-teal-950/40',
    highlights: ['Radiant Geode Heart', 'Glowing Stalactites', 'Bioluminescent Spores', 'Prismatic Spires'],
  },
  VOLCANIC_CORE: {
    badge: 'STAGE 3: MAGMA FOUNDRY',
    badgeBg: 'bg-orange-950/80',
    badgeText: 'text-orange-400',
    borderColor: 'border-orange-500/60 hover:border-orange-400',
    glowColor: 'shadow-[0_0_20px_rgba(249,115,22,0.3)]',
    accentColor: '#f97316',
    bgGrad: 'from-red-950/40 via-neutral-900/80 to-amber-950/40',
    highlights: ['Eclipsed Blood Moon', 'Caldera Fissures', 'Molten Lavafalls', 'Boiling Magma Lake'],
  },
  STARLIGHT_CITADEL: {
    badge: 'STAGE 4: CELESTIAL REALM',
    badgeBg: 'bg-purple-950/80',
    badgeText: 'text-purple-400',
    borderColor: 'border-purple-500/60 hover:border-purple-400',
    glowColor: 'shadow-[0_0_20px_rgba(168,85,247,0.3)]',
    accentColor: '#c084fc',
    bgGrad: 'from-purple-950/40 via-neutral-900/80 to-indigo-950/40',
    highlights: ['Ringed Gas Giant', 'Cosmic Nebula Clouds', 'Floating Temples', 'Aurora Borealis'],
  },
};

export const LevelSelectModal: React.FC<LevelSelectModalProps> = ({
  onClose,
  onSelectLevel,
  activeBiome,
  onPreviewBiome,
}) => {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-neutral-950/95 border-2 border-cyan-500/80 w-full max-w-3xl max-h-[92vh] flex flex-col shadow-[0_0_40px_rgba(6,182,212,0.25)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 p-4 bg-neutral-900/70">
          <div className="flex items-center gap-2.5">
            <MapPin className="w-5 h-5 text-cyan-400" />
            <div>
              <h2 className="text-sm sm:text-base font-pixel text-neutral-100 tracking-wide text-glow-cyan">
                CAMPAIGN SECTORS & BACKGROUNDS
              </h2>
              <p className="text-[10px] font-pixel text-neutral-400">
                Select a stage to launch or preview its unique background environment
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-100 transition-colors cursor-pointer p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Level List */}
        <div className="overflow-y-auto flex-1 p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {CAMPAIGN_LEVELS.map((lvl) => {
            const theme = BIOME_THEMES[lvl.biome] || BIOME_THEMES.CYBER_CITY;
            const isCurrentBiome = activeBiome === lvl.biome;

            return (
              <div
                key={lvl.id}
                className={`bg-gradient-to-b ${theme.bgGrad} border-2 ${theme.borderColor} ${
                  isCurrentBiome ? 'ring-2 ring-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.4)]' : ''
                } p-4 flex flex-col justify-between transition-all rounded-sm group relative`}
              >
                {isCurrentBiome && (
                  <div className="absolute -top-2.5 right-3 bg-cyan-500 text-neutral-950 font-pixel text-[8px] font-bold px-2 py-0.5 shadow-[0_0_10px_rgba(6,182,212,0.8)] flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5 fill-current" /> ACTIVE BACKGROUND
                  </div>
                )}

                <div>
                  {/* Biome Badge & Target Distance */}
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[9px] font-pixel px-2 py-0.5 rounded border border-neutral-700 ${theme.badgeBg} ${theme.badgeText}`}>
                      {theme.badge}
                    </span>
                    <span className="text-[9px] font-pixel text-neutral-400">
                      {lvl.targetDistance}m GOAL
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base font-pixel text-neutral-100 group-hover:text-white transition-colors mb-1.5 flex items-center gap-2">
                    <span style={{ color: theme.accentColor }}>#{lvl.id}</span>
                    <span>{lvl.name}</span>
                  </h3>

                  <p className="text-xs text-neutral-300 leading-relaxed mb-3">
                    {lvl.description}
                  </p>

                  {/* Stage Visual Highlights */}
                  <div className="bg-neutral-950/70 border border-neutral-800/80 p-2.5 rounded-sm mb-4">
                    <div className="text-[9px] font-pixel text-neutral-400 mb-1.5 flex items-center gap-1">
                      <Eye className="w-3 h-3 text-cyan-400" />
                      <span>BACKGROUND MOTIF:</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {theme.highlights.map((h, idx) => (
                        <span
                          key={idx}
                          className="text-[9px] font-pixel bg-neutral-900/90 text-neutral-300 px-1.5 py-0.5 border border-neutral-800"
                        >
                          {h}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  {onPreviewBiome && (
                    <button
                      onClick={() => onPreviewBiome(lvl.biome)}
                      className="py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 hover:text-white text-[10px] font-pixel flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-cyan-400" />
                      PREVIEW BG
                    </button>
                  )}

                  <button
                    onClick={() => onSelectLevel(lvl.id)}
                    className={`py-2 text-neutral-950 text-xs font-pixel font-bold flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer ${
                      onPreviewBiome ? '' : 'col-span-2'
                    }`}
                    style={{ backgroundColor: theme.accentColor }}
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    LAUNCH
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-neutral-800 bg-neutral-900/50 flex justify-between items-center text-[10px] font-pixel text-neutral-400">
          <span>ALL 4 STAGES FEATURE CUSTOM MULTI-LAYERED PARALLAX ART</span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-100 text-xs font-pixel transition-colors cursor-pointer"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
