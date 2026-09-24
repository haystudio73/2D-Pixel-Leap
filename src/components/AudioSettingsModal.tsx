import React, { useState } from 'react';
import { sound } from '../game/audio';
import { Volume2, VolumeX, Music, X, Play, Square, SkipForward } from 'lucide-react';

interface AudioSettingsModalProps {
  onClose: () => void;
}

export const AudioSettingsModal: React.FC<AudioSettingsModalProps> = ({ onClose }) => {
  const [isMuted, setIsMuted] = useState(sound.isMuted);
  const [bgmVol, setBgmVol] = useState(sound.bgmVolume);
  const [sfxVol, setSfxVol] = useState(sound.sfxVolume);
  const [isPlaying, setIsPlaying] = useState(sound.isPlaying());
  const [currentTrack, setCurrentTrack] = useState(sound.getCurrentTrackName());

  const tracks = sound.getTrackNames();

  const handleToggleMute = () => {
    const next = !isMuted;
    sound.setMuted(next);
    setIsMuted(next);
  };

  const handleBgmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    sound.setBgmVolume(val);
    setBgmVol(val);
  };

  const handleSfxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    sound.setSfxVolume(val);
    setSfxVol(val);
    sound.playCoin(); // Sample preview
  };

  const handleTogglePlayback = () => {
    const active = sound.toggleBgm();
    setIsPlaying(active);
  };

  const handleSelectTrack = (idx: number) => {
    sound.setTrack(idx);
    setCurrentTrack(sound.getCurrentTrackName());
    if (!isPlaying) {
      sound.startBgm();
      setIsPlaying(true);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-neutral-950 border-2 border-cyan-500/80 w-full max-w-md p-6 shadow-[0_0_24px_rgba(6,182,212,0.3)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-5">
          <div className="flex items-center gap-2.5">
            <Music className="w-5 h-5 text-cyan-400" />
            <h2 className="text-sm font-pixel text-neutral-100 tracking-wide text-glow-cyan">
              CHIPTUNE AUDIO
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Master Mute */}
        <div className="flex items-center justify-between p-3 bg-neutral-900/50 border border-neutral-800 mb-4">
          <span className="text-xs font-pixel text-neutral-300">MASTER AUDIO</span>
          <button
            onClick={handleToggleMute}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-pixel transition-colors cursor-pointer ${
              isMuted
                ? 'bg-red-950 border border-red-500 text-red-300'
                : 'bg-cyan-950 border border-cyan-500 text-cyan-300'
            }`}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            {isMuted ? 'MUTED' : 'ENABLED'}
          </button>
        </div>

        {/* Sliders */}
        <div className="space-y-4 mb-6">
          <div>
            <div className="flex justify-between text-[11px] font-pixel text-neutral-400 mb-1.5">
              <span>BGM MUSIC</span>
              <span>{Math.round(bgmVol * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={bgmVol}
              onChange={handleBgmChange}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-[11px] font-pixel text-neutral-400 mb-1.5">
              <span>8-BIT SFX</span>
              <span>{Math.round(sfxVol * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={sfxVol}
              onChange={handleSfxChange}
              className="w-full accent-yellow-400 cursor-pointer"
            />
          </div>
        </div>

        {/* Track Selection */}
        <div className="mb-6">
          <div className="text-[11px] font-pixel text-neutral-400 mb-2">SOUNDTRACK CHANNELS</div>
          <div className="space-y-1.5">
            {tracks.map((track: string, idx: number) => {
              const isSelected = track === currentTrack;
              return (
                <button
                  key={track}
                  onClick={() => handleSelectTrack(idx)}
                  className={`w-full text-left px-3 py-2 text-xs font-pixel flex items-center justify-between border transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-950/80 border-cyan-400 text-cyan-200 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                      : 'bg-neutral-900/40 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <span>{track}</span>
                  {isSelected && isPlaying && (
                    <span className="text-[9px] text-cyan-400 animate-pulse">PLAYING</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Playback Button */}
        <div className="flex items-center justify-between pt-2 border-t border-neutral-800">
          <button
            onClick={handleTogglePlayback}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-pixel transition-colors cursor-pointer ${
              isPlaying
                ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200'
                : 'bg-cyan-500 hover:bg-cyan-400 text-neutral-950 font-bold shadow-[0_0_12px_rgba(6,182,212,0.5)]'
            }`}
          >
            {isPlaying ? <Square className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            {isPlaying ? 'PAUSE BGM' : 'PLAY BGM'}
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-neutral-900 border border-neutral-700 hover:border-neutral-500 text-neutral-300 text-xs font-pixel transition-colors cursor-pointer"
          >
            DONE
          </button>
        </div>
      </div>
    </div>
  );
};
