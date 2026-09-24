import { LeaderboardEntry, GameMode } from './types';

const LOCAL_STORAGE_KEY = 'pixelleap_cached_leaderboard';
const LOCAL_BEST_KEY = 'pixelleap_personal_best';

export interface SqliteDbInfo {
  engine: string;
  databaseFile: string;
  fileSizeBytes: number;
  totalEntries: number;
  topScore: number;
}

// Fallback seed entries in case network is disconnected
const FALLBACK_ENTRIES: LeaderboardEntry[] = [
  { id: '1', name: 'PIXEL_KING', score: 14850, mode: 'endless', distance: 2840, coins: 86, level: 5, timestamp: new Date(Date.now() - 3600000 * 24 * 2).toISOString() },
  { id: '2', name: 'CYBER_ACE', score: 12200, mode: 'endless', distance: 2310, coins: 72, level: 4, timestamp: new Date(Date.now() - 3600000 * 24).toISOString() },
  { id: '3', name: 'RETRO_FOX', score: 9800, mode: 'campaign', distance: 1950, coins: 64, level: 5, timestamp: new Date(Date.now() - 3600000 * 18).toISOString() },
  { id: '4', name: 'NEO_JUMPER', score: 8450, mode: 'endless', distance: 1620, coins: 55, level: 3, timestamp: new Date(Date.now() - 3600000 * 12).toISOString() },
  { id: '5', name: 'CHIP_GHOST', score: 7100, mode: 'campaign', distance: 1400, coins: 48, level: 4, timestamp: new Date(Date.now() - 3600000 * 8).toISOString() },
  { id: '6', name: 'SPARK_8BIT', score: 5900, mode: 'endless', distance: 1150, coins: 39, level: 3, timestamp: new Date(Date.now() - 3600000 * 5).toISOString() },
  { id: '7', name: 'GLITCH_BOY', score: 4650, mode: 'campaign', distance: 980, coins: 31, level: 2, timestamp: new Date(Date.now() - 3600000 * 3).toISOString() },
  { id: '8', name: 'ARCADE_RUN', score: 3800, mode: 'endless', distance: 790, coins: 26, level: 2, timestamp: new Date(Date.now() - 3600000 * 1).toISOString() },
];

export async function fetchLeaderboard(mode?: GameMode): Promise<LeaderboardEntry[]> {
  try {
    const url = mode ? `/api/leaderboard?mode=${mode}` : '/api/leaderboard';
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.entries)) {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data.entries));
        return data.entries;
      }
    }
  } catch (err) {
    console.warn('Could not fetch leaderboard from SQLite server, falling back to local cache:', err);
  }

  // Fallback to local storage or defaults
  const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (saved) {
    try {
      const parsed: LeaderboardEntry[] = JSON.parse(saved);
      if (mode) {
        return parsed.filter(e => e.mode === mode);
      }
      return parsed;
    } catch {
      // ignore
    }
  }

  return mode ? FALLBACK_ENTRIES.filter(e => e.mode === mode) : FALLBACK_ENTRIES;
}

export async function fetchSqliteInfo(): Promise<SqliteDbInfo | null> {
  try {
    const res = await fetch('/api/leaderboard/info');
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.sqlite) {
        return data.sqlite;
      }
    }
  } catch (err) {
    // ignore
  }
  return null;
}

export async function submitScore(entry: {
  name: string;
  score: number;
  mode: GameMode;
  distance: number;
  coins: number;
  level: number;
}): Promise<{ success: boolean; rank?: number }> {
  // Update personal best
  updatePersonalBest(entry.score);

  try {
    const res = await fetch('/api/leaderboard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success) {
        return { success: true, rank: data.rank };
      }
    }
  } catch (err) {
    console.warn('Failed to submit score to SQLite server, saving locally:', err);
  }

  // Local fallback save
  const current = await fetchLeaderboard();
  const localEntry: LeaderboardEntry = {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    ...entry,
    timestamp: new Date().toISOString(),
  };

  current.push(localEntry);
  current.sort((a, b) => b.score - a.score);
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(current.slice(0, 100)));

  const rank = current.findIndex(e => e.id === localEntry.id) + 1;
  return { success: true, rank };
}

export function getPersonalBest(): number {
  const val = localStorage.getItem(LOCAL_BEST_KEY);
  return val ? parseInt(val, 10) || 0 : 0;
}

export function updatePersonalBest(score: number): boolean {
  const current = getPersonalBest();
  if (score > current) {
    localStorage.setItem(LOCAL_BEST_KEY, String(score));
    return true;
  }
  return false;
}
