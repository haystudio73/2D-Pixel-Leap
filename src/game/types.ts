// Game Engine Types & Interfaces

export type GameState = 
  | 'TITLE_MENU' 
  | 'LEVEL_SELECT' 
  | 'PLAYING' 
  | 'PAUSED' 
  | 'GAME_OVER' 
  | 'LEVEL_CLEAR' 
  | 'LEADERBOARD';

export type GameMode = 'endless' | 'campaign';

export type BiomeType = 'CYBER_CITY' | 'CRYSTAL_CAVERN' | 'VOLCANIC_CORE' | 'STARLIGHT_CITADEL';

export type WeatherType = 'CLEAR' | 'CYBER_RAIN' | 'COSMIC_SNOW' | 'EMBER_STORM' | 'DATA_STREAM';

export interface WeatherState {
  type: WeatherType;
  intensity: number; // 0 to 1
  targetIntensity: number;
  timer: number;
  duration: number;
  bannerTimer: number; // for showing "WEATHER: CYBER RAIN" banner
  bannerText: string;
  lightningTimer: number;
  lightningAlpha: number;
}

export interface WeatherParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
  length?: number;
  swayPhase?: number;
  splashTimer?: number;
}

export type PowerUpType = 
  | 'DOUBLE_JUMP' 
  | 'SPEED_DASH' 
  | 'COIN_MAGNET' 
  | 'SHIELD' 
  | 'TIME_WARP';

export type PlatformType = 
  | 'SOLID' 
  | 'ONE_WAY' 
  | 'MOVING' 
  | 'CRUMBLING' 
  | 'SPRING' 
  | 'SPIKE';

export interface PowerUpConfig {
  type: PowerUpType;
  name: string;
  duration: number; // in seconds
  color: string;
  glowColor: string;
  description: string;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Player {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  onGround: boolean;
  onWall: 'left' | 'right' | null;
  facing: 'left' | 'right';
  isJumping: boolean;
  canDoubleJump: boolean;
  hasDoubleJumped: boolean;
  coyoteTimer: number;
  jumpBufferTimer: number;
  isDashing: boolean;
  dashCooldown: number;
  dashDuration: number;
  dashDirection: number;
  lives: number;
  maxLives: number;
  score: number;
  coins: number;
  distance: number;
  invulnerableTimer: number;
  squashX: number;
  squashY: number;
  activePowerUps: Record<PowerUpType, number>; // type -> remaining seconds
  animFrame: number;
  animTimer: number;
  characterSkinId?: string;
  standingOnPlatformId?: string | null;
}

export interface Platform {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: PlatformType;
  // Moving platform properties
  startX?: number;
  startY?: number;
  targetX?: number;
  targetY?: number;
  speed?: number;
  progress?: number;
  direction?: number;
  // Crumbling platform properties
  crumbleTimer?: number;
  isCrumbling?: boolean;
  isFallen?: boolean;
  shakeOffset?: number;
  // Spring pad properties
  isCompressed?: boolean;
  compressTimer?: number;
}

export interface Collectible {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'COIN' | 'GEM' | 'HEART' | PowerUpType;
  collected: boolean;
  animOffset: number;
}

export interface Enemy {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  type: 'PATROL' | 'FLYER' | 'SPIKE_BALL';
  minX?: number;
  maxX?: number;
  minY?: number;
  maxY?: number;
  speed: number;
  facing: 'left' | 'right';
  alive: boolean;
}

export interface Checkpoint {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  activated: boolean;
}

export interface ExitPortal {
  x: number;
  y: number;
  width: number;
  height: number;
  pulseTimer: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  glow?: boolean;
  shape?: 'pixel' | 'star' | 'circle';
}

export interface FloatingText {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  alpha: number;
  life: number;
  vy: number;
}

export interface GhostTrail {
  x: number;
  y: number;
  width: number;
  height: number;
  facing: 'left' | 'right';
  alpha: number;
  color: string;
}

export interface LevelData {
  id: number;
  name: string;
  biome: BiomeType;
  description: string;
  targetDistance: number;
  platforms: Platform[];
  collectibles: Collectible[];
  enemies: Enemy[];
  checkpoints: Checkpoint[];
  portal: ExitPortal;
  playerStart: { x: number; y: number };
}

export interface Camera {
  x: number;
  y: number;
  shake: number;
  shakeDecay: number;
}

export interface InputState {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  jump: boolean;
  jumpPressed: boolean;
  dash: boolean;
  dashPressed: boolean;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  score: number;
  mode: GameMode;
  distance: number;
  coins: number;
  level: number;
  timestamp: string;
}
