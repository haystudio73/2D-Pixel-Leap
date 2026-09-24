import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { 
  initSqliteLeaderboard, 
  getLeaderboardEntries, 
  insertLeaderboardEntry, 
  getSqliteStats 
} from './server/sqliteLeaderboard';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  // Initialize SQLite database
  await initSqliteLeaderboard();

  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json());

  // API: Get Leaderboard from SQLite DB
  app.get('/api/leaderboard', (req: Request, res: Response) => {
    try {
      const mode = req.query.mode as string | undefined;
      const entries = getLeaderboardEntries(mode, 50);

      res.json({
        success: true,
        database: 'SQLite 3',
        entries,
      });
    } catch (err) {
      console.error('[SQLite] Error querying leaderboard:', err);
      res.status(500).json({ success: false, error: 'Failed to fetch leaderboard from SQLite' });
    }
  });

  // API: Post High Score into SQLite DB
  app.post('/api/leaderboard', (req: Request, res: Response) => {
    try {
      const { name, score, mode, distance, coins, level } = req.body;
      
      if (!name || typeof score !== 'number') {
        res.status(400).json({ success: false, error: 'Invalid name or score' });
        return;
      }

      const cleanName = String(name).trim().slice(0, 14).toUpperCase() || 'ANONYMOUS';
      const cleanScore = Math.max(0, Math.floor(Number(score)));
      const cleanDistance = Math.max(0, Math.floor(Number(distance) || 0));
      const cleanCoins = Math.max(0, Math.floor(Number(coins) || 0));
      const cleanLevel = Math.max(1, Math.floor(Number(level) || 1));
      const cleanMode = (mode === 'campaign') ? 'campaign' : 'endless';

      const result = insertLeaderboardEntry({
        name: cleanName,
        score: cleanScore,
        mode: cleanMode,
        distance: cleanDistance,
        coins: cleanCoins,
        level: cleanLevel,
      });

      const topScores = getLeaderboardEntries(cleanMode, 20);

      res.json({
        success: true,
        database: 'SQLite 3',
        entry: result.entry,
        rank: result.rank,
        totalEntries: result.totalEntries,
        topScores,
      });
    } catch (err) {
      console.error('[SQLite] Error inserting into leaderboard:', err);
      res.status(500).json({ success: false, error: 'Failed to save score to SQLite' });
    }
  });

  // API: Get SQLite Database Information & Health
  app.get(['/api/leaderboard/info', '/api/sqlite-info'], (_req: Request, res: Response) => {
    const stats = getSqliteStats();
    res.json({
      success: true,
      sqlite: stats,
    });
  });

  // Serve static files or Vite middlewares
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, () => {
    console.log(`[Pixel Leap] Server running on port ${PORT} with SQLite Leaderboard Database`);
  });
}

startServer();
