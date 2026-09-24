import { 
  LevelData, 
  Platform, 
  Collectible, 
  Enemy, 
  Checkpoint, 
  ExitPortal, 
  PowerUpType 
} from './types';

export const CAMPAIGN_LEVELS: LevelData[] = [
  {
    id: 1,
    name: 'Neon District',
    biome: 'CYBER_CITY',
    description: 'Rooftops of the neon metropolis. Master basic jumping and dash maneuvers.',
    targetDistance: 1200,
    playerStart: { x: 80, y: 350 },
    platforms: [
      // Starting base
      { id: 'p1', x: 20, y: 450, width: 340, height: 60, type: 'SOLID' },
      // Stepping platforms
      { id: 'p2', x: 420, y: 400, width: 140, height: 24, type: 'SOLID' },
      { id: 'p3', x: 620, y: 340, width: 150, height: 24, type: 'ONE_WAY' },
      // Moving platform
      { 
        id: 'p4', 
        x: 840, 
        y: 350, 
        width: 120, 
        height: 24, 
        type: 'MOVING', 
        startX: 840, 
        targetX: 1060, 
        speed: 1.2,
        progress: 0,
        direction: 1
      },
      // Higher ledge with spring
      { id: 'p5', x: 1240, y: 380, width: 180, height: 24, type: 'SOLID' },
      { id: 'p5_spring', x: 1360, y: 364, width: 36, height: 16, type: 'SPRING' },
      // Floating high ledge
      { id: 'p6', x: 1420, y: 200, width: 160, height: 24, type: 'SOLID' },
      // Crumbling bridge
      { id: 'p7_1', x: 1640, y: 260, width: 80, height: 24, type: 'CRUMBLING' },
      { id: 'p7_2', x: 1740, y: 260, width: 80, height: 24, type: 'CRUMBLING' },
      { id: 'p7_3', x: 1840, y: 260, width: 80, height: 24, type: 'CRUMBLING' },
      // Intermediate floor with checkpoint
      { id: 'p8', x: 1980, y: 420, width: 300, height: 60, type: 'SOLID' },
      // Spikes pit with moving platform above
      { id: 'p9_spike', x: 2320, y: 460, width: 220, height: 24, type: 'SPIKE' },
      { 
        id: 'p9_mov', 
        x: 2340, 
        y: 340, 
        width: 120, 
        height: 24, 
        type: 'MOVING', 
        startY: 340, 
        targetY: 220, 
        speed: 1.4,
        progress: 0,
        direction: 1
      },
      // Final rooftop stretch
      { id: 'p10', x: 2600, y: 360, width: 400, height: 60, type: 'SOLID' },
    ],
    collectibles: [
      { id: 'c1', x: 450, y: 360, width: 16, height: 16, type: 'COIN', collected: false, animOffset: 0 },
      { id: 'c2', x: 480, y: 360, width: 16, height: 16, type: 'COIN', collected: false, animOffset: 0.2 },
      { id: 'c3', x: 670, y: 290, width: 16, height: 16, type: 'COIN', collected: false, animOffset: 0.4 },
      { id: 'c4', x: 700, y: 290, width: 16, height: 16, type: 'COIN', collected: false, animOffset: 0.6 },
      // Wing boots power-up
      { id: 'pw1', x: 1490, y: 150, width: 22, height: 22, type: 'DOUBLE_JUMP', collected: false, animOffset: 0 },
      // Blue gem
      { id: 'g1', x: 1770, y: 210, width: 18, height: 18, type: 'GEM', collected: false, animOffset: 0.5 },
      // Magnet power-up
      { id: 'pw2', x: 2100, y: 370, width: 22, height: 22, type: 'COIN_MAGNET', collected: false, animOffset: 0.3 },
      { id: 'c5', x: 2390, y: 170, width: 16, height: 16, type: 'COIN', collected: false, animOffset: 0.8 },
      { id: 'c6', x: 2430, y: 170, width: 16, height: 16, type: 'COIN', collected: false, animOffset: 0.1 },
      { id: 'g2', x: 2800, y: 310, width: 18, height: 18, type: 'GEM', collected: false, animOffset: 0.7 },
    ],
    enemies: [
      { id: 'e1', x: 500, y: 372, vx: 60, vy: 0, width: 24, height: 24, type: 'PATROL', minX: 430, maxX: 550, speed: 60, facing: 'right', alive: true },
      { id: 'e2', x: 2140, y: 392, vx: 70, vy: 0, width: 24, height: 24, type: 'PATROL', minX: 2020, maxX: 2240, speed: 70, facing: 'left', alive: true },
    ],
    checkpoints: [
      { id: 'cp1', x: 2040, y: 360, width: 28, height: 60, activated: false },
    ],
    portal: {
      x: 2900,
      y: 280,
      width: 44,
      height: 80,
      pulseTimer: 0,
    },
  },
  {
    id: 2,
    name: 'Crystal Cavern',
    biome: 'CRYSTAL_CAVERN',
    description: 'Deep subterranean crystalline vaults. Watch for collapsing stalactites and bouncy springs.',
    targetDistance: 1600,
    playerStart: { x: 80, y: 350 },
    platforms: [
      { id: 'c_p1', x: 20, y: 440, width: 280, height: 60, type: 'SOLID' },
      { id: 'c_p2', x: 360, y: 390, width: 120, height: 24, type: 'CRUMBLING' },
      { id: 'c_p3', x: 540, y: 330, width: 130, height: 24, type: 'ONE_WAY' },
      { id: 'c_p4_spring', x: 620, y: 314, width: 36, height: 16, type: 'SPRING' },
      { id: 'c_p5', x: 740, y: 180, width: 160, height: 24, type: 'SOLID' },
      // Spikes below
      { id: 'c_p6_spike', x: 920, y: 460, width: 360, height: 24, type: 'SPIKE' },
      { 
        id: 'c_p6_mov1', 
        x: 960, 
        y: 260, 
        width: 100, 
        height: 24, 
        type: 'MOVING', 
        startX: 960, 
        targetX: 1180, 
        speed: 1.5,
        progress: 0,
        direction: 1
      },
      { id: 'c_p7', x: 1340, y: 360, width: 220, height: 60, type: 'SOLID' },
      // Wall jump corridor
      { id: 'c_w1', x: 1640, y: 160, width: 32, height: 260, type: 'SOLID' },
      { id: 'c_w2', x: 1760, y: 160, width: 32, height: 260, type: 'SOLID' },
      { id: 'c_p8', x: 1840, y: 220, width: 180, height: 24, type: 'SOLID' },
      { id: 'c_p9', x: 2080, y: 320, width: 140, height: 24, type: 'CRUMBLING' },
      { id: 'c_p10', x: 2280, y: 420, width: 440, height: 60, type: 'SOLID' },
    ],
    collectibles: [
      { id: 'cc1', x: 400, y: 340, width: 16, height: 16, type: 'COIN', collected: false, animOffset: 0.1 },
      { id: 'cc2', x: 590, y: 280, width: 16, height: 16, type: 'COIN', collected: false, animOffset: 0.3 },
      { id: 'cpw1', x: 810, y: 130, width: 22, height: 22, type: 'SHIELD', collected: false, animOffset: 0.5 },
      { id: 'cg1', x: 1070, y: 200, width: 18, height: 18, type: 'GEM', collected: false, animOffset: 0 },
      { id: 'cg2', x: 1700, y: 180, width: 18, height: 18, type: 'GEM', collected: false, animOffset: 0.6 },
      { id: 'cpw2', x: 1910, y: 170, width: 22, height: 22, type: 'SPEED_DASH', collected: false, animOffset: 0.2 },
      { id: 'cc3', x: 2420, y: 370, width: 16, height: 16, type: 'COIN', collected: false, animOffset: 0.4 },
      { id: 'cc4', x: 2460, y: 370, width: 16, height: 16, type: 'COIN', collected: false, animOffset: 0.7 },
    ],
    enemies: [
      { id: 'ce1', x: 800, y: 152, vx: 50, vy: 0, width: 24, height: 24, type: 'PATROL', minX: 745, maxX: 880, speed: 50, facing: 'left', alive: true },
      { id: 'ce2', x: 1420, y: 332, vx: 75, vy: 0, width: 24, height: 24, type: 'PATROL', minX: 1350, maxX: 1540, speed: 75, facing: 'right', alive: true },
      { id: 'ce3', x: 2130, y: 280, vx: 0, vy: 60, width: 24, height: 24, type: 'FLYER', minY: 200, maxY: 350, speed: 60, facing: 'right', alive: true },
    ],
    checkpoints: [
      { id: 'ccp1', x: 1440, y: 300, width: 28, height: 60, activated: false },
    ],
    portal: {
      x: 2600,
      y: 340,
      width: 44,
      height: 80,
      pulseTimer: 0,
    },
  },
  {
    id: 3,
    name: 'Volcanic Core',
    biome: 'VOLCANIC_CORE',
    description: 'Intense magma currents and rising heat. Precision dash leaps required.',
    targetDistance: 2000,
    playerStart: { x: 80, y: 350 },
    platforms: [
      { id: 'v_p1', x: 20, y: 440, width: 240, height: 60, type: 'SOLID' },
      { 
        id: 'v_p2', 
        x: 320, 
        y: 400, 
        width: 100, 
        height: 24, 
        type: 'MOVING', 
        startX: 320, 
        targetX: 520, 
        speed: 1.8,
        progress: 0,
        direction: 1 
      },
      { id: 'v_p3_spike', x: 280, y: 470, width: 380, height: 24, type: 'SPIKE' },
      { id: 'v_p4', x: 680, y: 340, width: 110, height: 24, type: 'CRUMBLING' },
      { id: 'v_p5', x: 850, y: 280, width: 110, height: 24, type: 'CRUMBLING' },
      { id: 'v_p6', x: 1020, y: 220, width: 160, height: 24, type: 'SOLID' },
      { id: 'v_p6_spring', x: 1130, y: 204, width: 36, height: 16, type: 'SPRING' },
      { id: 'v_p7', x: 1240, y: 120, width: 140, height: 24, type: 'SOLID' },
      { 
        id: 'v_p8_mov', 
        x: 1440, 
        y: 220, 
        width: 110, 
        height: 24, 
        type: 'MOVING', 
        startY: 220, 
        targetY: 380, 
        speed: 1.6,
        progress: 0,
        direction: 1 
      },
      { id: 'v_p9', x: 1620, y: 380, width: 280, height: 60, type: 'SOLID' },
      { id: 'v_p10', x: 1960, y: 320, width: 90, height: 24, type: 'SOLID' },
      { id: 'v_p11', x: 2120, y: 260, width: 90, height: 24, type: 'SOLID' },
      { id: 'v_p12', x: 2280, y: 380, width: 440, height: 60, type: 'SOLID' },
    ],
    collectibles: [
      { id: 'vc1', x: 420, y: 330, width: 16, height: 16, type: 'COIN', collected: false, animOffset: 0.1 },
      { id: 'vpw1', x: 1060, y: 170, width: 22, height: 22, type: 'TIME_WARP', collected: false, animOffset: 0.3 },
      { id: 'vg1', x: 1300, y: 70, width: 18, height: 18, type: 'GEM', collected: false, animOffset: 0 },
      { id: 'vpw2', x: 1740, y: 330, width: 22, height: 22, type: 'SHIELD', collected: false, animOffset: 0.5 },
      { id: 'vc2', x: 2000, y: 270, width: 16, height: 16, type: 'COIN', collected: false, animOffset: 0.2 },
      { id: 'vc3', x: 2160, y: 210, width: 16, height: 16, type: 'COIN', collected: false, animOffset: 0.4 },
      { id: 'vg2', x: 2480, y: 320, width: 18, height: 18, type: 'GEM', collected: false, animOffset: 0.8 },
    ],
    enemies: [
      { id: 've1', x: 1030, y: 192, vx: 50, vy: 0, width: 24, height: 24, type: 'PATROL', minX: 1020, maxX: 1120, speed: 50, facing: 'right', alive: true },
      { id: 've2', x: 1700, y: 352, vx: 80, vy: 0, width: 24, height: 24, type: 'PATROL', minX: 1630, maxX: 1880, speed: 80, facing: 'left', alive: true },
    ],
    checkpoints: [
      { id: 'vcp1', x: 1680, y: 320, width: 28, height: 60, activated: false },
    ],
    portal: {
      x: 2600,
      y: 300,
      width: 44,
      height: 80,
      pulseTimer: 0,
    },
  },
  {
    id: 4,
    name: 'Starlight Citadel',
    biome: 'STARLIGHT_CITADEL',
    description: 'Ascend the celestial spire above the clouds. Test all skills in sequence.',
    targetDistance: 2400,
    playerStart: { x: 80, y: 350 },
    platforms: [
      { id: 's_p1', x: 20, y: 440, width: 280, height: 60, type: 'SOLID' },
      { id: 's_p2_spring', x: 240, y: 424, width: 36, height: 16, type: 'SPRING' },
      { id: 's_p3', x: 340, y: 220, width: 140, height: 24, type: 'ONE_WAY' },
      { 
        id: 's_p4_mov', 
        x: 540, 
        y: 260, 
        width: 110, 
        height: 24, 
        type: 'MOVING', 
        startX: 540, 
        targetX: 740, 
        speed: 2.0,
        progress: 0,
        direction: 1 
      },
      { id: 's_p5_1', x: 900, y: 320, width: 70, height: 24, type: 'CRUMBLING' },
      { id: 's_p5_2', x: 1010, y: 280, width: 70, height: 24, type: 'CRUMBLING' },
      { id: 's_p5_3', x: 1120, y: 240, width: 70, height: 24, type: 'CRUMBLING' },
      { id: 's_p6', x: 1250, y: 360, width: 260, height: 60, type: 'SOLID' },
      { id: 's_p7_spike', x: 1540, y: 460, width: 300, height: 24, type: 'SPIKE' },
      { 
        id: 's_p7_mov', 
        x: 1580, 
        y: 300, 
        width: 100, 
        height: 24, 
        type: 'MOVING', 
        startY: 320, 
        targetY: 180, 
        speed: 1.8,
        progress: 0,
        direction: 1 
      },
      { id: 's_p8', x: 1880, y: 240, width: 140, height: 24, type: 'SOLID' },
      { id: 's_p8_spring', x: 1980, y: 224, width: 36, height: 16, type: 'SPRING' },
      { id: 's_p9', x: 2060, y: 100, width: 160, height: 24, type: 'SOLID' },
      { id: 's_p10', x: 2280, y: 360, width: 450, height: 60, type: 'SOLID' },
    ],
    collectibles: [
      { id: 'sc1', x: 380, y: 170, width: 16, height: 16, type: 'COIN', collected: false, animOffset: 0 },
      { id: 'spw1', x: 630, y: 190, width: 22, height: 22, type: 'DOUBLE_JUMP', collected: false, animOffset: 0.2 },
      { id: 'sg1', x: 1040, y: 220, width: 18, height: 18, type: 'GEM', collected: false, animOffset: 0.4 },
      { id: 'spw2', x: 1360, y: 300, width: 22, height: 22, type: 'COIN_MAGNET', collected: false, animOffset: 0.6 },
      { id: 'sg2', x: 2130, y: 50, width: 18, height: 18, type: 'GEM', collected: false, animOffset: 0.8 },
      { id: 'sc2', x: 2420, y: 300, width: 16, height: 16, type: 'COIN', collected: false, animOffset: 0.1 },
    ],
    enemies: [
      { id: 'se1', x: 1350, y: 332, vx: 80, vy: 0, width: 24, height: 24, type: 'PATROL', minX: 1260, maxX: 1490, speed: 80, facing: 'right', alive: true },
      { id: 'se2', x: 1720, y: 240, vx: 0, vy: 70, width: 24, height: 24, type: 'FLYER', minY: 160, maxY: 340, speed: 70, facing: 'left', alive: true },
    ],
    checkpoints: [
      { id: 'scp1', x: 1310, y: 300, width: 28, height: 60, activated: false },
    ],
    portal: {
      x: 2600,
      y: 280,
      width: 44,
      height: 80,
      pulseTimer: 0,
    },
  },
];

// --- LIMITLESS PROCEDURAL ENDLESS GENERATOR ---

export interface EndlessLevelState {
  lastGeneratedX: number;
  chunkCount: number;
  platforms: Platform[];
  collectibles: Collectible[];
  enemies: Enemy[];
  checkpoints: Checkpoint[];
  currentBiome: LevelData['biome'];
}

export function createInitialEndlessState(): EndlessLevelState {
  const initialPlatforms: Platform[] = [
    // Starting safety ground
    { id: 'start_0', x: 0, y: 440, width: 480, height: 80, type: 'SOLID' },
  ];

  const initialCollectibles: Collectible[] = [
    { id: 'start_c1', x: 200, y: 390, width: 16, height: 16, type: 'COIN', collected: false, animOffset: 0 },
    { id: 'start_c2', x: 240, y: 390, width: 16, height: 16, type: 'COIN', collected: false, animOffset: 0.2 },
    { id: 'start_c3', x: 280, y: 390, width: 16, height: 16, type: 'COIN', collected: false, animOffset: 0.4 },
  ];

  const state: EndlessLevelState = {
    lastGeneratedX: 480,
    chunkCount: 1,
    platforms: initialPlatforms,
    collectibles: initialCollectibles,
    enemies: [],
    checkpoints: [],
    currentBiome: 'CYBER_CITY',
  };

  // Pre-generate several chunks forward
  for (let i = 0; i < 4; i++) {
    generateEndlessChunk(state);
  }

  return state;
}

export function updateEndlessLevel(state: EndlessLevelState, playerX: number) {
  // If player respawned backwards or generator is out of sync, resynchronize
  if (state.lastGeneratedX > playerX + 3500 || state.lastGeneratedX < playerX - 400) {
    state.lastGeneratedX = playerX + 100;
  }

  // Generate chunks as player moves forward with safety guard
  let chunkIterations = 0;
  while (state.lastGeneratedX < playerX + 1800 && chunkIterations < 30) {
    chunkIterations++;
    generateEndlessChunk(state);
  }

  // Despawn off-screen elements behind player to prevent memory leaks while keeping 60fps
  const cullX = playerX - 1000;
  if (state.platforms.length > 8) {
    state.platforms = state.platforms.filter((p) => p.x + p.width > cullX);
  }
  state.collectibles = state.collectibles.filter((c) => c.x + c.width > cullX && !c.collected);
  state.enemies = state.enemies.filter((e) => e.x + e.width > cullX && e.alive);
  state.checkpoints = state.checkpoints.filter((cp) => cp.x + cp.width > cullX);

  // Dynamic biome cycling every ~1200m
  const distMeters = Math.floor(playerX / 10);
  if (distMeters >= 3600) {
    state.currentBiome = 'STARLIGHT_CITADEL';
  } else if (distMeters >= 2400) {
    state.currentBiome = 'VOLCANIC_CORE';
  } else if (distMeters >= 1200) {
    state.currentBiome = 'CRYSTAL_CAVERN';
  } else {
    state.currentBiome = 'CYBER_CITY';
  }
}

export function generateEndlessChunk(state: EndlessLevelState) {
  const chunkId = ++state.chunkCount;
  const startX = state.lastGeneratedX;
  const difficulty = Math.min(1.0, (startX / 25000)); // 0.0 at start to 1.0 at high distance

  // Pick random chunk pattern with weighted archetypes
  const patterns = [
    'GAP_LEAP',
    'SPRING_TOWER',
    'CRUMBLING_RUN',
    'MOVING_PLATFORMS',
    'HAZARD_TUNNEL',
    'COIN_VALLEY',
  ];
  const pattern = patterns[Math.floor(Math.random() * patterns.length)];

  const gap = 110 + Math.floor(Math.random() * (70 + difficulty * 60));
  const chunkX = startX + gap;

  if (pattern === 'SPRING_TOWER') {
    // Low base with spring leading to high suspended rewards
    const platY = 400 + Math.floor(Math.random() * 40);
    state.platforms.push({
      id: `end_${chunkId}_base`,
      x: chunkX,
      y: platY,
      width: 140,
      height: 30,
      type: 'SOLID',
    });
    state.platforms.push({
      id: `end_${chunkId}_spr`,
      x: chunkX + 90,
      y: platY - 16,
      width: 36,
      height: 16,
      type: 'SPRING',
    });
    // High sky platform
    state.platforms.push({
      id: `end_${chunkId}_sky`,
      x: chunkX + 160,
      y: platY - 240,
      width: 160,
      height: 24,
      type: 'ONE_WAY',
    });

    // High reward collectible (Power-up or Gem)
    const powerUps: PowerUpType[] = ['DOUBLE_JUMP', 'SPEED_DASH', 'COIN_MAGNET', 'SHIELD', 'TIME_WARP'];
    const pType = powerUps[Math.floor(Math.random() * powerUps.length)];
    state.collectibles.push({
      id: `end_${chunkId}_item`,
      x: chunkX + 220,
      y: platY - 290,
      width: 22,
      height: 22,
      type: pType,
      collected: false,
      animOffset: Math.random(),
    });

    // Arch of coins below
    for (let c = 0; c < 4; c++) {
      state.collectibles.push({
        id: `end_${chunkId}_c_${c}`,
        x: chunkX + 110 + c * 35,
        y: platY - 100 - Math.sin((c / 3) * Math.PI) * 70,
        width: 16,
        height: 16,
        type: 'COIN',
        collected: false,
        animOffset: c * 0.15,
      });
    }

    state.lastGeneratedX = chunkX + 350;

  } else if (pattern === 'CRUMBLING_RUN') {
    // Series of 3-4 crumbling blocks
    const numBlocks = 3 + Math.floor(Math.random() * 2);
    let curX = chunkX;
    const baseHeight = 360 + Math.floor(Math.random() * 60);

    for (let i = 0; i < numBlocks; i++) {
      state.platforms.push({
        id: `end_${chunkId}_cr_${i}`,
        x: curX,
        y: baseHeight - i * 15,
        width: 75,
        height: 24,
        type: 'CRUMBLING',
      });
      state.collectibles.push({
        id: `end_${chunkId}_cc_${i}`,
        x: curX + 28,
        y: baseHeight - i * 15 - 35,
        width: 16,
        height: 16,
        type: i === numBlocks - 1 ? 'GEM' : 'COIN',
        collected: false,
        animOffset: i * 0.2,
      });
      curX += 115;
    }
    state.lastGeneratedX = curX + 40;

  } else if (pattern === 'MOVING_PLATFORMS') {
    // Moving elevator or horizontal runner
    const isVert = Math.random() > 0.5;
    const platY = 360;
    const platW = 110;

    state.platforms.push({
      id: `end_${chunkId}_mov`,
      x: chunkX,
      y: platY,
      width: platW,
      height: 24,
      type: 'MOVING',
      startX: chunkX,
      targetX: isVert ? chunkX : chunkX + 180,
      startY: platY,
      targetY: isVert ? platY - 140 : platY,
      speed: 1.4 + difficulty * 0.8,
      progress: 0,
      direction: 1,
    });

    // Spike pit beneath
    if (Math.random() < 0.7 + difficulty * 0.3) {
      state.platforms.push({
        id: `end_${chunkId}_spk`,
        x: chunkX - 40,
        y: 470,
        width: 280,
        height: 24,
        type: 'SPIKE',
      });
    }

    state.collectibles.push({
      id: `end_${chunkId}_mc1`,
      x: chunkX + 40,
      y: platY - 40,
      width: 16,
      height: 16,
      type: 'COIN',
      collected: false,
      animOffset: 0.1,
    });

    state.lastGeneratedX = chunkX + (isVert ? 150 : 250);

  } else if (pattern === 'HAZARD_TUNNEL') {
    // Platform with patrol bot or flyer
    const platW = 260 + Math.floor(Math.random() * 80);
    const platY = 380 + Math.floor(Math.random() * 40);

    state.platforms.push({
      id: `end_${chunkId}_haz`,
      x: chunkX,
      y: platY,
      width: platW,
      height: 30,
      type: 'SOLID',
    });

    // Enemy bot
    if (Math.random() < 0.75) {
      state.enemies.push({
        id: `end_${chunkId}_bot`,
        x: chunkX + 60,
        y: platY - 24,
        vx: 60 + difficulty * 40,
        vy: 0,
        width: 24,
        height: 24,
        type: 'PATROL',
        minX: chunkX + 20,
        maxX: chunkX + platW - 20,
        speed: 60 + difficulty * 40,
        facing: 'left',
        alive: true,
      });
    }

    // Power-up chance
    if (Math.random() < 0.45) {
      const powerUps: PowerUpType[] = ['SHIELD', 'SPEED_DASH', 'DOUBLE_JUMP', 'COIN_MAGNET', 'TIME_WARP'];
      state.collectibles.push({
        id: `end_${chunkId}_pw`,
        x: chunkX + platW / 2 - 11,
        y: platY - 60,
        width: 22,
        height: 22,
        type: powerUps[Math.floor(Math.random() * powerUps.length)],
        collected: false,
        animOffset: 0.3,
      });
    }

    state.lastGeneratedX = chunkX + platW;

  } else {
    // GAP_LEAP or COIN_VALLEY (Safe multi-platform sequence)
    const platW = 180 + Math.floor(Math.random() * 100);
    const platY = 350 + Math.floor(Math.random() * 80);

    state.platforms.push({
      id: `end_${chunkId}_std`,
      x: chunkX,
      y: platY,
      width: platW,
      height: 30,
      type: 'SOLID',
    });

    // Coins on platform
    for (let i = 0; i < 3; i++) {
      state.collectibles.push({
        id: `end_${chunkId}_sc_${i}`,
        x: chunkX + 30 + i * 40,
        y: platY - 35,
        width: 16,
        height: 16,
        type: 'COIN',
        collected: false,
        animOffset: i * 0.15,
      });
    }

    // Power-up / Heart chance on safe platform
    if (Math.random() < 0.30) {
      const bonusItems: (PowerUpType | 'HEART')[] = ['DOUBLE_JUMP', 'SPEED_DASH', 'COIN_MAGNET', 'SHIELD', 'TIME_WARP', 'HEART'];
      state.collectibles.push({
        id: `end_${chunkId}_bonus`,
        x: chunkX + platW - 40,
        y: platY - 50,
        width: 22,
        height: 22,
        type: bonusItems[Math.floor(Math.random() * bonusItems.length)],
        collected: false,
        animOffset: 0.5,
      });
    }

    // Checkpoint gate every ~1000m with guaranteed solid floor
    if (Math.floor(chunkX / 1000) > Math.floor((chunkX - platW - gap) / 1000)) {
      state.checkpoints.push({
        id: `end_${chunkId}_cp`,
        x: chunkX + platW - 40,
        y: platY - 60,
        width: 28,
        height: 60,
        activated: false,
      });
      // Sturdy safety base directly under checkpoint
      state.platforms.push({
        id: `end_${chunkId}_cp_base`,
        x: chunkX + platW - 80,
        y: platY,
        width: 120,
        height: 36,
        type: 'SOLID',
      });
    }

    state.lastGeneratedX = chunkX + platW;
  }

  // Ensure lastGeneratedX always makes positive forward progress
  if (state.lastGeneratedX <= startX + 50) {
    state.lastGeneratedX = startX + 200;
  }
}
