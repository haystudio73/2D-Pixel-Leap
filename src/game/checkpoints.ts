import { GameMode } from './types';

export interface SavedCheckpoint {
  levelId: number;
  mode: GameMode;
  x: number;
  y: number;
  score: number;
  coins: number;
  lives: number;
  checkpointId?: string;
  timestamp: number;
}

const CHECKPOINT_PREFIX = 'pixelleap_checkpoint_';

export function getCheckpointKey(mode: GameMode, levelId: number): string {
  return `${CHECKPOINT_PREFIX}${mode}_${levelId}`;
}

export function saveCheckpoint(
  mode: GameMode,
  levelId: number,
  data: Omit<SavedCheckpoint, 'timestamp'>
): void {
  try {
    const key = getCheckpointKey(mode, levelId);
    const payload: SavedCheckpoint = {
      ...data,
      timestamp: Date.now(),
    };
    localStorage.setItem(key, JSON.stringify(payload));
  } catch (err) {
    console.warn('[Checkpoints] Failed to save checkpoint to localStorage:', err);
  }
}

export function getSavedCheckpoint(
  mode: GameMode,
  levelId: number
): SavedCheckpoint | null {
  try {
    const key = getCheckpointKey(mode, levelId);
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as SavedCheckpoint;
  } catch (err) {
    console.warn('[Checkpoints] Failed to read checkpoint from localStorage:', err);
    return null;
  }
}

export function clearSavedCheckpoint(mode: GameMode, levelId: number): void {
  try {
    const key = getCheckpointKey(mode, levelId);
    localStorage.removeItem(key);
  } catch (err) {
    console.warn('[Checkpoints] Failed to clear checkpoint:', err);
  }
}

export function hasSavedCheckpoint(mode: GameMode, levelId: number): boolean {
  return getSavedCheckpoint(mode, levelId) !== null;
}
