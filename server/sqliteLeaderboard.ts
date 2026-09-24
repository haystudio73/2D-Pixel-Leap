import initSqlJs, { Database } from 'sql.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface LeaderboardEntry {
  id: string;
  name: string;
  score: number;
  mode: 'endless' | 'campaign';
  distance: number;
  coins: number;
  level: number;
  timestamp: string;
}

const DATA_DIR = path.resolve(__dirname, '..', 'data');
const DB_FILE = path.resolve(DATA_DIR, 'leaderboard.sqlite');

let db: Database | null = null;

const DEFAULT_LEADERBOARD: LeaderboardEntry[] = [
  { id: '1', name: 'PIXEL_KING', score: 14850, mode: 'endless', distance: 2840, coins: 86, level: 5, timestamp: new Date(Date.now() - 3600000 * 24 * 2).toISOString() },
  { id: '2', name: 'CYBER_ACE', score: 12200, mode: 'endless', distance: 2310, coins: 72, level: 4, timestamp: new Date(Date.now() - 3600000 * 24).toISOString() },
  { id: '3', name: 'RETRO_FOX', score: 9800, mode: 'campaign', distance: 1950, coins: 64, level: 5, timestamp: new Date(Date.now() - 3600000 * 18).toISOString() },
  { id: '4', name: 'NEO_JUMPER', score: 8450, mode: 'endless', distance: 1620, coins: 55, level: 3, timestamp: new Date(Date.now() - 3600000 * 12).toISOString() },
  { id: '5', name: 'CHIP_GHOST', score: 7100, mode: 'campaign', distance: 1400, coins: 48, level: 4, timestamp: new Date(Date.now() - 3600000 * 8).toISOString() },
  { id: '6', name: 'SPARK_8BIT', score: 5900, mode: 'endless', distance: 1150, coins: 39, level: 3, timestamp: new Date(Date.now() - 3600000 * 5).toISOString() },
  { id: '7', name: 'GLITCH_BOY', score: 4650, mode: 'campaign', distance: 980, coins: 31, level: 2, timestamp: new Date(Date.now() - 3600000 * 3).toISOString() },
  { id: '8', name: 'ARCADE_RUN', score: 3800, mode: 'endless', distance: 790, coins: 26, level: 2, timestamp: new Date(Date.now() - 3600000 * 1).toISOString() },
];

/**
 * Initialize SQLite Database connection, tables, indexes, and initial seeds
 */
export async function initSqliteLeaderboard(): Promise<Database> {
  if (db) return db;

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const SQL = await initSqlJs();

  if (fs.existsSync(DB_FILE)) {
    try {
      const fileBuffer = fs.readFileSync(DB_FILE);
      db = new SQL.Database(fileBuffer);
    } catch (err) {
      console.warn('[SQLite] Failed to load existing SQLite file, creating fresh DB:', err);
      db = new SQL.Database();
    }
  } else {
    db = new SQL.Database();
  }

  // Run SQLite schema migration
  db.run(`
    CREATE TABLE IF NOT EXISTS leaderboard (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      score INTEGER NOT NULL,
      mode TEXT NOT NULL,
      distance INTEGER NOT NULL,
      coins INTEGER NOT NULL,
      level INTEGER NOT NULL,
      timestamp TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_leaderboard_score ON leaderboard(score DESC);
    CREATE INDEX IF NOT EXISTS idx_leaderboard_mode ON leaderboard(mode, score DESC);
  `);

  // Check if empty -> Seed with arcade records
  const countStmt = db.prepare('SELECT COUNT(*) as count FROM leaderboard');
  countStmt.step();
  const row = countStmt.getAsObject() as { count: number };
  countStmt.free();

  if (row.count === 0) {
    console.log('[SQLite] Seeding initial leaderboard records into SQLite database...');
    const insertStmt = db.prepare(`
      INSERT INTO leaderboard (id, name, score, mode, distance, coins, level, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const item of DEFAULT_LEADERBOARD) {
      insertStmt.run([
        item.id,
        item.name,
        item.score,
        item.mode,
        item.distance,
        item.coins,
        item.level,
        item.timestamp,
      ]);
    }
    insertStmt.free();
    persistSqlite();
  }

  console.log('[SQLite] Leaderboard SQLite database initialized at:', DB_FILE);
  return db;
}

/**
 * Save in-memory SQLite database state to disk as binary .sqlite file
 */
export function persistSqlite() {
  if (!db) return;
  try {
    const binary = db.export();
    fs.writeFileSync(DB_FILE, Buffer.from(binary));
  } catch (err) {
    console.error('[SQLite] Failed to persist SQLite database to disk:', err);
  }
}

/**
 * Fetch top leaderboard entries using SQLite query
 */
export function getLeaderboardEntries(mode?: string, limit: number = 50): LeaderboardEntry[] {
  if (!db) return [];

  let query = 'SELECT id, name, score, mode, distance, coins, level, timestamp FROM leaderboard';
  const params: (string | number)[] = [];

  if (mode && (mode === 'endless' || mode === 'campaign')) {
    query += ' WHERE mode = ?';
    params.push(mode);
  }

  query += ' ORDER BY score DESC, timestamp DESC LIMIT ?';
  params.push(limit);

  const stmt = db.prepare(query);
  stmt.bind(params);

  const entries: LeaderboardEntry[] = [];
  while (stmt.step()) {
    const r = stmt.getAsObject();
    entries.push({
      id: String(r.id),
      name: String(r.name),
      score: Number(r.score),
      mode: (r.mode === 'campaign' ? 'campaign' : 'endless'),
      distance: Number(r.distance),
      coins: Number(r.coins),
      level: Number(r.level),
      timestamp: String(r.timestamp),
    });
  }
  stmt.free();
  return entries;
}

/**
 * Insert a new score entry into SQLite database and return entry with calculated rank
 */
export function insertLeaderboardEntry(entry: Omit<LeaderboardEntry, 'id' | 'timestamp'>): {
  entry: LeaderboardEntry;
  rank: number;
  totalEntries: number;
} {
  if (!db) {
    throw new Error('SQLite database not initialized');
  }

  const id = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  const timestamp = new Date().toISOString();

  const newRecord: LeaderboardEntry = {
    id,
    name: entry.name,
    score: entry.score,
    mode: entry.mode,
    distance: entry.distance,
    coins: entry.coins,
    level: entry.level,
    timestamp,
  };

  db.run(
    `INSERT INTO leaderboard (id, name, score, mode, distance, coins, level, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      newRecord.id,
      newRecord.name,
      newRecord.score,
      newRecord.mode,
      newRecord.distance,
      newRecord.coins,
      newRecord.level,
      newRecord.timestamp,
    ]
  );

  // Compute player's rank across entire leaderboard
  const rankStmt = db.prepare(`
    SELECT COUNT(*) as betterCount 
    FROM leaderboard 
    WHERE score > ? OR (score = ? AND timestamp < ?)
  `);
  rankStmt.bind([newRecord.score, newRecord.score, newRecord.timestamp]);
  rankStmt.step();
  const rankRow = rankStmt.getAsObject() as { betterCount: number };
  rankStmt.free();
  const rank = (rankRow.betterCount || 0) + 1;

  // Compute total entries count
  const totalStmt = db.prepare('SELECT COUNT(*) as total FROM leaderboard');
  totalStmt.step();
  const totalRow = totalStmt.getAsObject() as { total: number };
  totalStmt.free();

  // Prune lowest entries if database exceeds 250 records
  if (totalRow.total > 250) {
    db.run(`
      DELETE FROM leaderboard 
      WHERE id NOT IN (
        SELECT id FROM leaderboard ORDER BY score DESC LIMIT 200
      )
    `);
  }

  // Persist SQLite file
  persistSqlite();

  return {
    entry: newRecord,
    rank,
    totalEntries: totalRow.total,
  };
}

/**
 * Get SQLite Database metadata & status
 */
export function getSqliteStats() {
  if (!db) return null;

  const countStmt = db.prepare('SELECT COUNT(*) as total, MAX(score) as topScore FROM leaderboard');
  countStmt.step();
  const stats = countStmt.getAsObject() as { total: number; topScore: number };
  countStmt.free();

  let fileSize = 0;
  try {
    if (fs.existsSync(DB_FILE)) {
      fileSize = fs.statSync(DB_FILE).size;
    }
  } catch (e) {}

  return {
    engine: 'SQLite 3 (via sql.js WebAssembly)',
    databaseFile: 'data/leaderboard.sqlite',
    fileSizeBytes: fileSize,
    totalEntries: stats.total || 0,
    topScore: stats.topScore || 0,
  };
}
