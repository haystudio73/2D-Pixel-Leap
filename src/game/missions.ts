// Daily Missions & In-Game Currency Wallet System

export type MissionType = 
  | 'COLLECT_COINS'
  | 'PERFORM_JUMPS'
  | 'PERFORM_DASHES'
  | 'TRAVEL_DISTANCE'
  | 'DEFEAT_ENEMIES'
  | 'COLLECT_POWERUPS'
  | 'DEFEAT_MINI_BOSS'
  | 'CLEAR_STAGE';

export interface DailyMission {
  id: string;
  type: MissionType;
  title: string;
  description: string;
  target: number;
  current: number;
  rewardCredits: number;
  claimed: boolean;
  completed: boolean;
  iconType: 'coin' | 'jump' | 'dash' | 'distance' | 'enemy' | 'powerup' | 'boss' | 'flag';
}

export interface DailyMissionsState {
  dateKey: string;
  missions: DailyMission[];
  allBonusClaimed: boolean;
  allBonusReward: number;
}

export type MissionProgressEventType = 
  | 'COIN_COLLECTED'
  | 'JUMP_PERFORMED'
  | 'DASH_PERFORMED'
  | 'DISTANCE_TRAVELED'
  | 'ENEMY_DEFEATED'
  | 'POWERUP_COLLECTED'
  | 'MINI_BOSS_DEFEATED'
  | 'STAGE_CLEARED';

export interface MissionProgressEvent {
  type: MissionProgressEventType;
  count?: number;
}

const MISSIONS_STORAGE_KEY = 'pixelleap_daily_missions_data';
const WALLET_STORAGE_KEY = 'pixelleap_wallet_cyber_credits';

// --- IN-GAME CURRENCY & WALLET ---

export function getWalletBalance(): number {
  const saved = localStorage.getItem(WALLET_STORAGE_KEY);
  if (saved !== null) {
    const parsed = parseInt(saved, 10);
    if (!isNaN(parsed) && parsed >= 0) return parsed;
  }
  // Initial starting bonus balance for first-time players
  const initial = 150;
  localStorage.setItem(WALLET_STORAGE_KEY, String(initial));
  return initial;
}

export function setWalletBalance(amount: number): void {
  const val = Math.max(0, Math.floor(amount));
  localStorage.setItem(WALLET_STORAGE_KEY, String(val));
}

export function addWalletCredits(amount: number): number {
  if (amount <= 0) return getWalletBalance();
  const current = getWalletBalance();
  const updated = current + Math.floor(amount);
  setWalletBalance(updated);
  return updated;
}

export function spendWalletCredits(amount: number): boolean {
  const current = getWalletBalance();
  if (current >= amount) {
    setWalletBalance(current - amount);
    return true;
  }
  return false;
}

// --- DATE HELPER ---

export function getTodayDateKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getTimeUntilDailyReset(): { hours: number; minutes: number; seconds: number; formatted: string } {
  const now = new Date();
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
  const diffMs = Math.max(0, tomorrow.getTime() - now.getTime());
  
  const totalSeconds = Math.floor(diffMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  const formatted = `${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
  return { hours, minutes, seconds, formatted };
}

// --- MISSION TEMPLATES POOL ---

interface MissionTemplate {
  type: MissionType;
  title: string;
  descriptionTemplate: (target: number) => string;
  targets: number[];
  baseReward: number;
  iconType: DailyMission['iconType'];
}

// Category 1: Coin Gathering
const CATEGORY_COINS: MissionTemplate[] = [
  {
    type: 'COLLECT_COINS',
    title: 'Coin Collector',
    descriptionTemplate: (t) => `Collect ${t} golden coins across sectors`,
    targets: [40, 50, 60, 75],
    baseReward: 180,
    iconType: 'coin',
  },
  {
    type: 'COLLECT_COINS',
    title: 'Treasury Raider',
    descriptionTemplate: (t) => `Harvest ${t} coins or gems from the neon ruins`,
    targets: [35, 45, 65],
    baseReward: 160,
    iconType: 'coin',
  },
];

// Category 2: Agility & Movement
const CATEGORY_AGILITY: MissionTemplate[] = [
  {
    type: 'PERFORM_JUMPS',
    title: 'High Altitude Acrobat',
    descriptionTemplate: (t) => `Perform ${t} jumps or double jumps`,
    targets: [60, 80, 100, 120],
    baseReward: 200,
    iconType: 'jump',
  },
  {
    type: 'PERFORM_DASHES',
    title: 'Sonic Velocity',
    descriptionTemplate: (t) => `Execute ${t} high-speed sonic dashes`,
    targets: [20, 25, 30, 40],
    baseReward: 220,
    iconType: 'dash',
  },
];

// Category 3: Combat, Endurance & Sector Mastery
const CATEGORY_CHALLENGE: MissionTemplate[] = [
  {
    type: 'TRAVEL_DISTANCE',
    title: 'Endless Marathon',
    descriptionTemplate: (t) => `Run a total distance of ${t.toLocaleString()}m`,
    targets: [800, 1000, 1200, 1500],
    baseReward: 250,
    iconType: 'distance',
  },
  {
    type: 'DEFEAT_ENEMIES',
    title: 'Drone Destroyer',
    descriptionTemplate: (t) => `Eliminate ${t} patrolling bots via stomp or dash`,
    targets: [8, 10, 12, 15],
    baseReward: 260,
    iconType: 'enemy',
  },
  {
    type: 'COLLECT_POWERUPS',
    title: 'Cyber Energized',
    descriptionTemplate: (t) => `Acquire ${t} glowing power-ups (Shield, Magnet, Dash, Jump)`,
    targets: [4, 5, 6],
    baseReward: 240,
    iconType: 'powerup',
  },
  {
    type: 'DEFEAT_MINI_BOSS',
    title: 'Titan Slayer',
    descriptionTemplate: (t) => `Defeat ${t} Titan Mini-Boss in Endless Mode`,
    targets: [1],
    baseReward: 350,
    iconType: 'boss',
  },
  {
    type: 'CLEAR_STAGE',
    title: 'Sector Liberator',
    descriptionTemplate: (t) => `Clear ${t} Campaign Sector or Exit Portal`,
    targets: [1, 2],
    baseReward: 280,
    iconType: 'flag',
  },
];

// Simple pseudorandom number generator using date string seed
function createSeededRandom(seedStr: string) {
  let h = 0x811c9dc5;
  for (let i = 0; i < seedStr.length; i++) {
    h ^= seedStr.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  let s = h >>> 0;
  return function next() {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export function generateDailyMissions(dateKey: string): DailyMissionsState {
  const rand = createSeededRandom(dateKey);

  // Pick 1 from each category for guaranteed balanced challenge types
  const pickTemplate = (pool: MissionTemplate[]) => {
    const idx = Math.floor(rand() * pool.length);
    const tmpl = pool[idx];
    const targetIdx = Math.floor(rand() * tmpl.targets.length);
    const target = tmpl.targets[targetIdx];
    return {
      template: tmpl,
      target,
    };
  };

  const choice1 = pickTemplate(CATEGORY_COINS);
  const choice2 = pickTemplate(CATEGORY_AGILITY);
  const choice3 = pickTemplate(CATEGORY_CHALLENGE);

  const missions: DailyMission[] = [
    {
      id: `${dateKey}_m1`,
      type: choice1.template.type,
      title: choice1.template.title,
      description: choice1.template.descriptionTemplate(choice1.target),
      target: choice1.target,
      current: 0,
      rewardCredits: choice1.template.baseReward,
      claimed: false,
      completed: false,
      iconType: choice1.template.iconType,
    },
    {
      id: `${dateKey}_m2`,
      type: choice2.template.type,
      title: choice2.template.title,
      description: choice2.template.descriptionTemplate(choice2.target),
      target: choice2.target,
      current: 0,
      rewardCredits: choice2.template.baseReward,
      claimed: false,
      completed: false,
      iconType: choice2.template.iconType,
    },
    {
      id: `${dateKey}_m3`,
      type: choice3.template.type,
      title: choice3.template.title,
      description: choice3.template.descriptionTemplate(choice3.target),
      target: choice3.target,
      current: 0,
      rewardCredits: choice3.template.baseReward,
      claimed: false,
      completed: false,
      iconType: choice3.template.iconType,
    },
  ];

  return {
    dateKey,
    missions,
    allBonusClaimed: false,
    allBonusReward: 300,
  };
}

// --- STATE MANAGEMENT ---

export function getDailyMissions(): DailyMissionsState {
  const todayKey = getTodayDateKey();
  const raw = localStorage.getItem(MISSIONS_STORAGE_KEY);

  if (raw) {
    try {
      const parsed: DailyMissionsState = JSON.parse(raw);
      if (parsed && parsed.dateKey === todayKey && Array.isArray(parsed.missions) && parsed.missions.length === 3) {
        return parsed;
      }
    } catch {
      // JSON parse error, generate fresh
    }
  }

  // Generate for today
  const fresh = generateDailyMissions(todayKey);
  saveDailyMissions(fresh);
  return fresh;
}

export function saveDailyMissions(state: DailyMissionsState): void {
  try {
    localStorage.setItem(MISSIONS_STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.warn('Failed to save daily missions to localStorage:', err);
  }
}

/**
 * Record gameplay progress towards daily missions.
 * Returns any missions that just crossed their target threshold for real-time celebration.
 */
export function recordMissionProgress(event: MissionProgressEvent): { newlyCompleted: DailyMission[]; state: DailyMissionsState } {
  const state = getDailyMissions();
  const count = event.count ?? 1;
  const newlyCompleted: DailyMission[] = [];
  let updated = false;

  state.missions.forEach((m) => {
    if (m.completed) return;

    let progressDelta = 0;

    switch (event.type) {
      case 'COIN_COLLECTED':
        if (m.type === 'COLLECT_COINS') progressDelta = count;
        break;
      case 'JUMP_PERFORMED':
        if (m.type === 'PERFORM_JUMPS') progressDelta = count;
        break;
      case 'DASH_PERFORMED':
        if (m.type === 'PERFORM_DASHES') progressDelta = count;
        break;
      case 'DISTANCE_TRAVELED':
        if (m.type === 'TRAVEL_DISTANCE') progressDelta = count;
        break;
      case 'ENEMY_DEFEATED':
        if (m.type === 'DEFEAT_ENEMIES') progressDelta = count;
        break;
      case 'POWERUP_COLLECTED':
        if (m.type === 'COLLECT_POWERUPS') progressDelta = count;
        break;
      case 'MINI_BOSS_DEFEATED':
        if (m.type === 'DEFEAT_MINI_BOSS') progressDelta = count;
        break;
      case 'STAGE_CLEARED':
        if (m.type === 'CLEAR_STAGE') progressDelta = count;
        break;
    }

    if (progressDelta > 0) {
      m.current = Math.min(m.target, m.current + progressDelta);
      updated = true;

      if (m.current >= m.target && !m.completed) {
        m.completed = true;
        newlyCompleted.push({ ...m });
      }
    }
  });

  if (updated) {
    saveDailyMissions(state);
  }

  return { newlyCompleted, state };
}

/**
 * Claim the currency reward for a completed mission.
 */
export function claimMissionReward(missionId: string): { success: boolean; reward: number; newBalance: number; state: DailyMissionsState } {
  const state = getDailyMissions();
  const target = state.missions.find((m) => m.id === missionId);

  if (!target || !target.completed || target.claimed) {
    return { success: false, reward: 0, newBalance: getWalletBalance(), state };
  }

  target.claimed = true;
  const newBalance = addWalletCredits(target.rewardCredits);
  saveDailyMissions(state);

  return {
    success: true,
    reward: target.rewardCredits,
    newBalance,
    state,
  };
}

/**
 * Claim the All 3 Missions Completed Daily Bonus.
 */
export function claimAllBonusReward(): { success: boolean; reward: number; newBalance: number; state: DailyMissionsState } {
  const state = getDailyMissions();
  const allCompleted = state.missions.every((m) => m.completed);

  if (!allCompleted || state.allBonusClaimed) {
    return { success: false, reward: 0, newBalance: getWalletBalance(), state };
  }

  state.allBonusClaimed = true;
  const newBalance = addWalletCredits(state.allBonusReward);
  saveDailyMissions(state);

  return {
    success: true,
    reward: state.allBonusReward,
    newBalance,
    state,
  };
}

/**
 * Get count of missions ready to claim.
 */
export function getClaimableMissionsCount(state?: DailyMissionsState): number {
  const s = state || getDailyMissions();
  const unclaimedMissions = s.missions.filter((m) => m.completed && !m.claimed).length;
  const allCompleted = s.missions.every((m) => m.completed);
  const bonusClaimable = allCompleted && !s.allBonusClaimed ? 1 : 0;
  return unclaimedMissions + bonusClaimable;
}
