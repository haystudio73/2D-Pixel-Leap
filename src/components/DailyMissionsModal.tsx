import React, { useState, useEffect } from 'react';
import { 
  X, 
  Coins, 
  Zap, 
  Flame, 
  Compass, 
  Skull, 
  Shield, 
  Trophy, 
  Flag, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Award,
  ChevronRight
} from 'lucide-react';
import { 
  DailyMission, 
  DailyMissionsState, 
  getDailyMissions, 
  claimMissionReward, 
  claimAllBonusReward, 
  getWalletBalance, 
  getTimeUntilDailyReset 
} from '../game/missions';
import { sound } from '../game/audio';

interface DailyMissionsModalProps {
  onClose: () => void;
  onBalanceChange?: (newBalance: number) => void;
}

export const DailyMissionsModal: React.FC<DailyMissionsModalProps> = ({ 
  onClose,
  onBalanceChange 
}) => {
  const [missionsState, setMissionsState] = useState<DailyMissionsState>(() => getDailyMissions());
  const [walletBalance, setWalletBalance] = useState<number>(() => getWalletBalance());
  const [timeRemaining, setTimeRemaining] = useState<string>(() => getTimeUntilDailyReset().formatted);
  const [claimingId, setClaimingId] = useState<string | null>(null);

  // Live countdown timer until daily reset
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(getTimeUntilDailyReset().formatted);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Keyboard shortcut listener to close modal
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === 'INPUT') return;
      if (e.code === 'Escape' || e.code === 'KeyM') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const handleClaim = (missionId: string) => {
    sound.init();
    sound.playClaimReward();
    setClaimingId(missionId);

    setTimeout(() => {
      const res = claimMissionReward(missionId);
      if (res.success) {
        setMissionsState({ ...res.state });
        setWalletBalance(res.newBalance);
        onBalanceChange?.(res.newBalance);
      }
      setClaimingId(null);
    }, 200);
  };

  const handleClaimAllBonus = () => {
    sound.init();
    sound.playClaimReward();
    const res = claimAllBonusReward();
    if (res.success) {
      setMissionsState({ ...res.state });
      setWalletBalance(res.newBalance);
      onBalanceChange?.(res.newBalance);
    }
  };

  const completedCount = missionsState.missions.filter((m) => m.completed).length;
  const allCompleted = completedCount === missionsState.missions.length;

  const renderIcon = (type: DailyMission['iconType']) => {
    switch (type) {
      case 'coin':
        return <Coins className="w-5 h-5 text-amber-400" />;
      case 'jump':
        return <Zap className="w-5 h-5 text-cyan-400" />;
      case 'dash':
        return <Flame className="w-5 h-5 text-orange-400" />;
      case 'distance':
        return <Compass className="w-5 h-5 text-emerald-400" />;
      case 'enemy':
        return <Skull className="w-5 h-5 text-rose-400" />;
      case 'powerup':
        return <Shield className="w-5 h-5 text-purple-400" />;
      case 'boss':
        return <Trophy className="w-5 h-5 text-yellow-400" />;
      case 'flag':
        return <Flag className="w-5 h-5 text-sky-400" />;
      default:
        return <Sparkles className="w-5 h-5 text-amber-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-2xl bg-neutral-950 border-2 border-amber-500/80 shadow-[0_0_40px_rgba(245,158,11,0.25)] flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-neutral-900/90 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-amber-500/20 border border-amber-500/50 rounded-sm">
              <Award className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-pixel text-amber-300 tracking-wide text-glow-amber">
                DAILY MISSIONS & BOUNTIES
              </h2>
              <p className="text-[10px] text-neutral-400 font-pixel">
                Complete daily sector operations to earn Cyber Credits
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.init();
              sound.buttonClick();
              onClose();
            }}
            className="p-1.5 bg-neutral-900 border border-neutral-700 hover:border-amber-400 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            title="Close (ESC or M)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Status Sub-bar: Reset Countdown & Currency Balance */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-2.5 bg-neutral-900/40 border-b border-neutral-800/80 text-xs font-pixel">
          <div className="flex items-center gap-2 text-neutral-400">
            <Clock className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span className="text-[10px]">RESETS IN:</span>
            <span className="text-cyan-300 font-bold tracking-wider text-[10px]">
              {timeRemaining}
            </span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1 bg-amber-950/40 border border-amber-500/40 rounded-sm shadow-[0_0_12px_rgba(245,158,11,0.2)]">
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[10px] text-amber-200">WALLET:</span>
            <span className="text-xs text-yellow-300 font-bold font-pixel tracking-wide text-glow-amber">
              {walletBalance.toLocaleString()} CREDITS
            </span>
          </div>
        </div>

        {/* Mission Cards List */}
        <div className="p-4 sm:p-5 space-y-3 overflow-y-auto flex-1">
          {missionsState.missions.map((mission, index) => {
            const pct = Math.min(100, Math.floor((mission.current / mission.target) * 100));
            const isClaimable = mission.completed && !mission.claimed;

            return (
              <div
                key={mission.id}
                className={`p-3.5 sm:p-4 border transition-all ${
                  mission.claimed
                    ? 'bg-neutral-900/40 border-neutral-800/80 opacity-80'
                    : isClaimable
                    ? 'bg-amber-950/20 border-amber-500/70 shadow-[0_0_20px_rgba(245,158,11,0.15)] ring-1 ring-amber-500/40'
                    : 'bg-neutral-900/60 border-neutral-800 hover:border-neutral-700'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-neutral-950 border border-neutral-800 flex items-center justify-center shrink-0">
                      {renderIcon(mission.iconType)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-pixel text-neutral-500">
                          MISSION #{index + 1}
                        </span>
                        {mission.claimed && (
                          <span className="text-[9px] font-pixel text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-1.5 py-0.2">
                            CLAIMED
                          </span>
                        )}
                        {isClaimable && (
                          <span className="text-[9px] font-pixel text-amber-300 bg-amber-950/80 border border-amber-500/60 px-1.5 py-0.2 animate-pulse">
                            READY!
                          </span>
                        )}
                      </div>
                      <h3 className="text-xs sm:text-sm font-pixel text-neutral-100 mt-0.5">
                        {mission.title}
                      </h3>
                      <p className="text-[10px] font-pixel text-neutral-400 mt-0.5">
                        {mission.description}
                      </p>
                    </div>
                  </div>

                  {/* Reward Pill */}
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-neutral-950 border border-amber-500/30 text-amber-300 font-pixel text-[10px] shrink-0">
                    <Coins className="w-3 h-3 text-amber-400" />
                    <span>+{mission.rewardCredits}</span>
                  </div>
                </div>

                {/* Progress Bar & Claim Button Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-neutral-800/60">
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-[9px] font-pixel text-neutral-400 mb-1">
                      <span>PROGRESS</span>
                      <span className={mission.completed ? 'text-emerald-400 font-bold' : 'text-neutral-300'}>
                        {mission.current} / {mission.target} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-neutral-950 border border-neutral-800 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          mission.claimed
                            ? 'bg-neutral-600'
                            : mission.completed
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_10px_rgba(16,185,129,0.5)]'
                            : 'bg-gradient-to-r from-amber-500 to-yellow-400'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="shrink-0 sm:w-44">
                    {mission.claimed ? (
                      <div className="w-full py-2 bg-neutral-900 border border-neutral-800 text-neutral-500 font-pixel text-[10px] flex items-center justify-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-neutral-600" />
                        <span>COMPLETED</span>
                      </div>
                    ) : isClaimable ? (
                      <button
                        onClick={() => handleClaim(mission.id)}
                        disabled={claimingId === mission.id}
                        className="w-full py-2 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-neutral-950 font-pixel font-bold text-[10px] flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(245,158,11,0.5)] transition-all cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
                      >
                        <Coins className="w-3.5 h-3.5 fill-current" />
                        <span>CLAIM +{mission.rewardCredits} 🪙</span>
                      </button>
                    ) : (
                      <div className="w-full py-2 bg-neutral-950 border border-neutral-800 text-neutral-500 font-pixel text-[10px] flex items-center justify-center gap-1">
                        <span>IN PROGRESS</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Daily 3/3 Mastery Bonus Tier Card */}
          <div className="mt-4 p-3.5 bg-gradient-to-r from-purple-950/40 via-neutral-900/60 to-amber-950/40 border border-purple-500/40 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-purple-950 border border-purple-500/60 text-purple-300 shrink-0">
                <Trophy className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-pixel text-purple-300">
                    DAILY 3/3 MASTERY BONUS
                  </h4>
                  <span className="text-[9px] font-pixel text-neutral-400">
                    [{completedCount}/3 COMPLETED]
                  </span>
                </div>
                <p className="text-[10px] font-pixel text-neutral-400 mt-0.5">
                  Complete all 3 missions of the day to unlock extra Cyber Credits!
                </p>
              </div>
            </div>

            <div className="shrink-0 w-full sm:w-auto">
              {missionsState.allBonusClaimed ? (
                <div className="px-4 py-2 bg-neutral-900 border border-neutral-800 text-neutral-500 font-pixel text-[10px] flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-neutral-600" />
                  <span>BONUS CLAIMED</span>
                </div>
              ) : allCompleted ? (
                <button
                  onClick={handleClaimAllBonus}
                  className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-purple-500 via-pink-500 to-amber-400 hover:opacity-95 text-white font-pixel font-bold text-[10px] flex items-center justify-center gap-1.5 shadow-[0_0_20px_rgba(168,85,247,0.5)] transition-all cursor-pointer animate-pulse"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>CLAIM ALL BONUS (+{missionsState.allBonusReward} 🪙)</span>
                </button>
              ) : (
                <div className="px-3.5 py-2 bg-neutral-950/80 border border-neutral-800 text-neutral-500 font-pixel text-[10px] text-center">
                  <span>LOCKED ({completedCount}/3)</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Bar */}
        <div className="px-5 py-3 bg-neutral-950 border-t border-neutral-800 flex items-center justify-between text-[10px] font-pixel text-neutral-400">
          <span className="hidden sm:inline">
            Press <span className="text-neutral-200">M</span> or <span className="text-neutral-200">ESC</span> to close
          </span>
          <button
            onClick={() => {
              sound.init();
              sound.buttonClick();
              onClose();
            }}
            className="w-full sm:w-auto ml-auto px-4 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 hover:text-white font-pixel text-[10px] transition-colors cursor-pointer"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
