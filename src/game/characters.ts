// Character Customization & Unlock System

export type SpriteStyle = 
  | 'jumper' 
  | 'shinobi' 
  | 'knight' 
  | 'blaze' 
  | 'valkyrie' 
  | 'phantom' 
  | 'monarch';

export interface CharacterConfig {
  id: string;
  name: string;
  title: string;
  description: string;
  flair: string;
  unlockType: 'default' | 'score' | 'level';
  unlockThreshold: number;
  unlockLabel: string;
  spriteStyle: SpriteStyle;
  colors: {
    head: string;
    visor: string;
    visorGlow: string;
    torso: string;
    core: string;
    cape: string;
    capeTrim?: string;
    legs: string;
    feet: string;
    aura: string;
    dashColor: string;
  };
  agilityRating: string;
  specialAura: string;
}

export const CHARACTERS: CharacterConfig[] = [
  {
    id: 'cyber_jumper',
    name: 'CYBER JUMPER',
    title: 'Neon Courier',
    description: 'The swift and agile courier traversing the high-voltage rooftops of the neon metropolis.',
    flair: 'Classic cyber armor with aerodynamic crimson cape.',
    unlockType: 'default',
    unlockThreshold: 0,
    unlockLabel: 'UNLOCKED BY DEFAULT',
    spriteStyle: 'jumper',
    colors: {
      head: '#0284c7',
      visor: '#e0f2fe',
      visorGlow: '#38bdf8',
      torso: '#0369a1',
      core: '#38bdf8',
      cape: '#ef4444',
      capeTrim: '#fca5a5',
      legs: '#1e293b',
      feet: '#0284c7',
      aura: '#38bdf8',
      dashColor: 'rgba(56, 189, 248, 0.7)',
    },
    agilityRating: '★★★★☆',
    specialAura: 'Cyan Aerodynamic Trail',
  },
  {
    id: 'neon_shinobi',
    name: 'NEON SHINOBI',
    title: 'Shadow Hacker',
    description: 'A covert ninja operative who uses high-frequency grappling physics to strike unseen.',
    flair: 'Obsidian cowl, glowing magenta eye slit, and twin billowing violet scarf tails.',
    unlockType: 'score',
    unlockThreshold: 2500,
    unlockLabel: 'SCORE 2,500+ OR CLEAR STAGE 1',
    spriteStyle: 'shinobi',
    colors: {
      head: '#09090b',
      visor: '#f43f5e',
      visorGlow: '#fb7185',
      torso: '#18181b',
      core: '#e11d48',
      cape: '#a855f7',
      capeTrim: '#c084fc',
      legs: '#09090b',
      feet: '#a855f7',
      aura: '#c084fc',
      dashColor: 'rgba(192, 132, 252, 0.75)',
    },
    agilityRating: '★★★★★',
    specialAura: 'Violet Shadow Ribbons',
  },
  {
    id: 'crystal_knight',
    name: 'CRYSTAL KNIGHT',
    title: 'Geode Sentinel',
    description: 'An ancient subterranean guardian clad in resonating emerald crystal pauldrons.',
    flair: 'Knight helm with golden crest plume and shimmering jade cloak.',
    unlockType: 'score',
    unlockThreshold: 5000,
    unlockLabel: 'SCORE 5,000+ OR CLEAR STAGE 2',
    spriteStyle: 'knight',
    colors: {
      head: '#064e3b',
      visor: '#a7f3d0',
      visorGlow: '#10b981',
      torso: '#047857',
      core: '#fbbf24',
      cape: '#059669',
      capeTrim: '#34d399',
      legs: '#022c22',
      feet: '#10b981',
      aura: '#10b981',
      dashColor: 'rgba(16, 185, 129, 0.75)',
    },
    agilityRating: '★★★★☆',
    specialAura: 'Emerald Crystalline Bloom',
  },
  {
    id: 'magma_blaze',
    name: 'MAGMA BLAZE',
    title: 'Molten Pyromancer',
    description: 'Forged within the volcanic core; channels the searing kinetic heat of molten basalt.',
    flair: 'Charcoal horned helmet, pulsating magma heart, and flaming crown embers.',
    unlockType: 'score',
    unlockThreshold: 8000,
    unlockLabel: 'SCORE 8,000+ OR CLEAR STAGE 3',
    spriteStyle: 'blaze',
    colors: {
      head: '#292524',
      visor: '#fed7aa',
      visorGlow: '#f97316',
      torso: '#44403c',
      core: '#ea580c',
      cape: '#dc2626',
      capeTrim: '#f97316',
      legs: '#1c1917',
      feet: '#ea580c',
      aura: '#f97316',
      dashColor: 'rgba(249, 115, 22, 0.8)',
    },
    agilityRating: '★★★★★',
    specialAura: 'Fiery Molten Flare',
  },
  {
    id: 'astro_valkyrie',
    name: 'ASTRO VALKYRIE',
    title: 'Starlight Guardian',
    description: 'Celestial warrior armed with gravitational solar winglets and interstellar stardust armor.',
    flair: 'Hovering golden halo, celestial solar winglets, and deep indigo mantle.',
    unlockType: 'score',
    unlockThreshold: 12000,
    unlockLabel: 'SCORE 12,000+ OR CLEAR STAGE 4',
    spriteStyle: 'valkyrie',
    colors: {
      head: '#1e1b4b',
      visor: '#fef08a',
      visorGlow: '#eab308',
      torso: '#312e81',
      core: '#38bdf8',
      cape: '#4338ca',
      capeTrim: '#fbbf24',
      legs: '#0f172a',
      feet: '#fbbf24',
      aura: '#fbbf24',
      dashColor: 'rgba(251, 191, 36, 0.8)',
    },
    agilityRating: '★★★★★',
    specialAura: 'Golden Halo & Solar Wings',
  },
  {
    id: 'glitch_phantom',
    name: 'GLITCH PHANTOM',
    title: 'Simulation Anomaly',
    description: 'A sentient digital aberration that cracked the game engine and bends retro physics.',
    flair: 'Holographic matrix skull visor with jittering green scanline pixels.',
    unlockType: 'score',
    unlockThreshold: 16000,
    unlockLabel: 'HIGH SCORE 16,000+ PTS',
    spriteStyle: 'phantom',
    colors: {
      head: '#022c22',
      visor: '#86efac',
      visorGlow: '#22c55e',
      torso: '#064e3b',
      core: '#4ade80',
      cape: '#14532d',
      capeTrim: '#86efac',
      legs: '#022c22',
      feet: '#22c55e',
      aura: '#22c55e',
      dashColor: 'rgba(34, 197, 94, 0.85)',
    },
    agilityRating: '★★★★★',
    specialAura: 'Binary Matrix Glitch Jitter',
  },
  {
    id: 'solar_monarch',
    name: 'SOLAR MONARCH',
    title: 'Arcade Sovereign',
    description: 'The supreme ruler of the arcade leaderboards crowned with celestial diamond regalia.',
    flair: 'Radiant 3-peak golden crown, diamond crest, and royal ermine mantle.',
    unlockType: 'score',
    unlockThreshold: 20000,
    unlockLabel: 'HIGH SCORE 20,000+ PTS',
    spriteStyle: 'monarch',
    colors: {
      head: '#78350f',
      visor: '#ffffff',
      visorGlow: '#fbbf24',
      torso: '#b45309',
      core: '#f59e0b',
      cape: '#fbbf24',
      capeTrim: '#ffffff',
      legs: '#451a03',
      feet: '#fbbf24',
      aura: '#f59e0b',
      dashColor: 'rgba(245, 158, 11, 0.9)',
    },
    agilityRating: '★★★★★',
    specialAura: 'Prismatic Golden Imperial Corona',
  },
];

const SELECTED_CHAR_KEY = 'pixelleap_selected_character';
const MAX_LEVEL_KEY = 'pixelleap_max_level_cleared';
const PERSONAL_BEST_KEY = 'pixelleap_personal_best';

export function getSelectedCharacterId(): string {
  const saved = localStorage.getItem(SELECTED_CHAR_KEY);
  if (saved && CHARACTERS.some(c => c.id === saved)) {
    return saved;
  }
  return 'cyber_jumper';
}

export function setSelectedCharacterId(id: string): void {
  localStorage.setItem(SELECTED_CHAR_KEY, id);
}

export function getSelectedCharacter(): CharacterConfig {
  const id = getSelectedCharacterId();
  return CHARACTERS.find(c => c.id === id) || CHARACTERS[0];
}

export function getCharacterById(id: string): CharacterConfig {
  return CHARACTERS.find(c => c.id === id) || CHARACTERS[0];
}

export function getMaxLevelCleared(): number {
  const val = localStorage.getItem(MAX_LEVEL_KEY);
  return val ? parseInt(val, 10) || 0 : 0;
}

export function updateMaxLevelCleared(levelId: number): boolean {
  const current = getMaxLevelCleared();
  if (levelId > current) {
    localStorage.setItem(MAX_LEVEL_KEY, String(levelId));
    return true;
  }
  return false;
}

export function isCharacterUnlocked(
  char: CharacterConfig,
  highScore: number,
  maxLevel: number
): boolean {
  if (char.unlockType === 'default') return true;

  if (char.id === 'neon_shinobi') {
    return highScore >= 2500 || maxLevel >= 1;
  }
  if (char.id === 'crystal_knight') {
    return highScore >= 5000 || maxLevel >= 2;
  }
  if (char.id === 'magma_blaze') {
    return highScore >= 8000 || maxLevel >= 3;
  }
  if (char.id === 'astro_valkyrie') {
    return highScore >= 12000 || maxLevel >= 4;
  }
  if (char.id === 'glitch_phantom') {
    return highScore >= 16000;
  }
  if (char.id === 'solar_monarch') {
    return highScore >= 20000;
  }

  return highScore >= char.unlockThreshold;
}
