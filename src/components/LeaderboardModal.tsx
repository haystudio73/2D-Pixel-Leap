import React, { useState, useEffect } from 'react';
import { LeaderboardEntry, GameMode } from '../game/types';
import { fetchLeaderboard, fetchSqliteInfo, SqliteDbInfo } from '../game/leaderboard';
import { Trophy, RefreshCw, X, Award, Flame, Database, HardDrive, CheckCircle2 } from 'lucide-react';

interface LeaderboardModalProps {
  onClose: () => void;
  highlightId?: string;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ onClose, highlightId }) => {
  const [filter, setFilter] = useState<'all' | GameMode>('all');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [sqliteStats, setSqliteStats] = useState<SqliteDbInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [data, stats] = await Promise.all([
        fetchLeaderboard(filter === 'all' ? undefined : filter),
        fetchSqliteInfo(),
      ]);
      setEntries(data);
      setSqliteStats(stats);
    } catch (e) {
      console.warn('Failed to load leaderboard data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filter]);

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 z-50 animate-fade-in select-none">
      <div className="bg-neutral-950 border-2 border-cyan-500/80 w-full max-w-2xl max-h-[90vh] flex flex-col shadow-[0_0_30px_rgba(6,182,212,0.25)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 p-3.5 sm:p-4 bg-neutral-900/50">
          <div className="flex items-center gap-2.5">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <h2 className="text-xs sm:text-base font-pixel text-neutral-100 tracking-wide text-glow-amber">
              ARCADE HIGH SCORES
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              disabled={loading}
              className="p-1.5 text-neutral-400 hover:text-cyan-400 transition-colors cursor-pointer"
              title="Refresh Leaderboard from SQLite"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-red-400 transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* SQLite Database Status Strip */}
        <div className="bg-neutral-900/70 border-b border-neutral-800 px-3.5 py-1.5 flex items-center justify-between text-[10px] font-pixel text-neutral-400">
          <div className="flex items-center gap-2">
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-emerald-400">SQLITE 3 DATABASE POWERED</span>
            <span className="hidden sm:inline text-neutral-600">|</span>
            <span className="hidden sm:inline text-neutral-400">TABLE: leaderboard</span>
          </div>

          <div className="flex items-center gap-3 text-neutral-400">
            {sqliteStats && (
              <>
                <span className="hidden md:inline">FILE: {sqliteStats.databaseFile}</span>
                <span className="text-yellow-400">ENTRIES: {sqliteStats.totalEntries}</span>
              </>
            )}
            <span className="flex items-center gap-1 text-emerald-400">
              <CheckCircle2 className="w-3 h-3" /> ONLINE
            </span>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 p-2.5 border-b border-neutral-800/80 bg-neutral-900/20">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 text-xs font-pixel transition-colors cursor-pointer ${
              filter === 'all'
                ? 'bg-cyan-500 text-neutral-950 shadow-[0_0_10px_rgba(6,182,212,0.5)]'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            ALL MODES
          </button>
          <button
            onClick={() => setFilter('endless')}
            className={`px-3 py-1.5 text-xs font-pixel transition-colors cursor-pointer ${
              filter === 'endless'
                ? 'bg-cyan-500 text-neutral-950 shadow-[0_0_10px_rgba(6,182,212,0.5)]'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            ENDLESS
          </button>
          <button
            onClick={() => setFilter('campaign')}
            className={`px-3 py-1.5 text-xs font-pixel transition-colors cursor-pointer ${
              filter === 'campaign'
                ? 'bg-cyan-500 text-neutral-950 shadow-[0_0_10px_rgba(6,182,212,0.5)]'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            CAMPAIGN
          </button>
        </div>

        {/* Entries Table */}
        <div className="overflow-y-auto flex-1 p-3 divide-y divide-neutral-900">
          {loading ? (
            <div className="py-16 text-center text-xs font-pixel text-neutral-500 animate-pulse">
              QUERYING SQLITE DATABASE...
            </div>
          ) : entries.length === 0 ? (
            <div className="py-16 text-center text-xs font-pixel text-neutral-500">
              NO SCORES YET IN SQLITE DATABASE. BE THE FIRST!
            </div>
          ) : (
            <div className="space-y-1">
              {entries.map((entry, idx) => {
                const rank = idx + 1;
                const isTop3 = rank <= 3;
                const isHighlighted = highlightId === entry.id;

                let rankBadgeColor = 'text-neutral-400';
                if (rank === 1) rankBadgeColor = 'text-yellow-400 text-glow-amber';
                else if (rank === 2) rankBadgeColor = 'text-slate-300';
                else if (rank === 3) rankBadgeColor = 'text-amber-600';

                return (
                  <div
                    key={entry.id || idx}
                    className={`flex items-center justify-between p-2.5 transition-colors ${
                      isHighlighted
                        ? 'bg-cyan-950/60 border border-cyan-400'
                        : isTop3
                        ? 'bg-neutral-900/40 hover:bg-neutral-900/80'
                        : 'hover:bg-neutral-900/30'
                    }`}
                  >
                    {/* Rank & Name */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-8 text-center text-xs font-pixel font-bold ${rankBadgeColor}`}>
                        {rank === 1 ? '1ST' : rank === 2 ? '2ND' : rank === 3 ? '3RD' : `#${rank}`}
                      </div>

                      <div className="truncate">
                        <div className="flex items-center gap-2">
                          <span className="text-xs sm:text-sm font-pixel text-neutral-100 tracking-wider">
                            {entry.name}
                          </span>
                          {rank === 1 && <Flame className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />}
                        </div>
                        <div className="text-[10px] text-neutral-500 font-pixel">
                          <span>{entry.mode === 'endless' ? 'ENDLESS' : `STAGE ${entry.level}`}</span>
                          <span className="mx-1.5">·</span>
                          <span>{entry.distance}m</span>
                          <span className="mx-1.5">·</span>
                          <span>🪙 {entry.coins}</span>
                        </div>
                      </div>
                    </div>

                    {/* Score */}
                    <div className="text-right pl-2">
                      <div className="text-sm sm:text-base font-pixel text-yellow-400 tracking-widest text-glow-amber">
                        {entry.score.toLocaleString()}
                      </div>
                      <div className="text-[9px] text-neutral-600 font-pixel">
                        {new Date(entry.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-neutral-800 bg-neutral-900/50 flex items-center justify-between">
          <span className="text-[10px] font-pixel text-neutral-500">
            TRANSACTIONAL SQLITE STORAGE
          </span>
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
