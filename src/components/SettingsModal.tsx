import React, { useState, useEffect } from 'react';
import { 
  GameSettings, 
  getSettings, 
  saveSettings, 
  resetSettings, 
  applyOptimizationPreset,
  FpsTarget,
  ParticleQuality,
  WeatherQuality,
  ScanlineMode,
  ScreenShakeMode,
  ParallaxQuality,
  ResolutionScale,
  AudioEngineMode,
  BgmTrackOption,
  TouchControlsMode
} from '../game/settings';
import { sound, SfxKey } from '../game/audio';
import { 
  X, 
  Cpu, 
  Volume2, 
  VolumeX, 
  Gamepad2, 
  RotateCcw, 
  Zap, 
  BatteryCharging, 
  Sparkles, 
  Gauge, 
  Music, 
  Check, 
  Flame, 
  Sliders, 
  Monitor, 
  Layers, 
  CloudRain, 
  Play, 
  Radio
} from 'lucide-react';

interface SettingsModalProps {
  onClose: () => void;
}

type TabType = 'hardware' | 'audio' | 'controls';

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>('hardware');
  const [settings, setSettings] = useState<GameSettings>(() => getSettings());
  const [savedNotice, setSavedNotice] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  // Sync state with settings update
  const update = (partial: Partial<GameSettings>) => {
    const updated = saveSettings(partial);
    setSettings({ ...updated });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 1200);
  };

  // Keyboard Space / Enter / Escape to save & close
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === 'INPUT') return;
      if (e.code === 'Space' || e.code === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  // Audio Handlers
  const handleToggleMute = () => {
    const next = !settings.isMuted;
    sound.setMuted(next);
    update({ isMuted: next });
  };

  const handleMasterVolChange = (val: number) => {
    sound.setMasterVolume(val);
    update({ masterVolume: val });
  };

  const handleBgmVolChange = (val: number) => {
    sound.setBgmVolume(val);
    update({ musicVolume: val });
  };

  const handleSfxVolChange = (val: number) => {
    sound.setSfxVolume(val);
    update({ sfxVolume: val });
  };

  const handleAudioEngineChange = (engine: AudioEngineMode) => {
    sound.setAudioEngine(engine);
    update({ audioEngine: engine });
    sound.buttonClick();
  };

  const handleBgmTrackChange = (track: BgmTrackOption) => {
    sound.setBgmTrack(track);
    update({ selectedBgmTrack: track });
    sound.buttonClick();
  };

  const handleApplyPreset = (preset: 'battery' | 'performance' | 'balanced' | 'ultra') => {
    const updated = applyOptimizationPreset(preset);
    setSettings({ ...updated });
    sound.buttonClick();
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 1200);
  };

  const handleResetDefaults = () => {
    const reset = resetSettings();
    sound.setMuted(reset.isMuted);
    sound.setMasterVolume(reset.masterVolume);
    sound.setBgmVolume(reset.musicVolume);
    sound.setSfxVolume(reset.sfxVolume);
    sound.setAudioEngine(reset.audioEngine);
    sound.setBgmTrack(reset.selectedBgmTrack);
    setSettings({ ...reset });
    setConfirmReset(false);
    sound.buttonClick();
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 1200);
  };

  const testSfxList: { key: SfxKey; label: string; icon: string }[] = [
    { key: 'jump', label: 'Jump Blip', icon: '⬆️' },
    { key: 'doubleJump', label: 'Double Jump', icon: '✨' },
    { key: 'dash', label: 'Sonic Dash', icon: '💨' },
    { key: 'coin', label: 'Coin Chime', icon: '🪙' },
    { key: 'powerup', label: 'Power-Up', icon: '⭐' },
    { key: 'spring', label: 'Spring Bounce', icon: '🌀' },
    { key: 'hit', label: 'Damage Hit', icon: '💥' },
    { key: 'checkpoint', label: 'Checkpoint', icon: '🚩' },
    { key: 'levelClear', label: 'Victory Fanfare', icon: '🏆' },
    { key: 'gameOver', label: 'Game Over', icon: '💀' },
  ];

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 z-50 animate-fade-in select-none">
      <div className="bg-neutral-950 border-2 border-cyan-500/80 w-full max-w-2xl max-h-[92vh] flex flex-col shadow-[0_0_35px_rgba(6,182,212,0.3)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 p-3.5 sm:p-4 bg-neutral-900/60">
          <div className="flex items-center gap-2.5">
            <Sliders className="w-5 h-5 text-cyan-400" />
            <h2 className="text-xs sm:text-sm font-pixel text-neutral-100 tracking-wider text-glow-cyan">
              SYSTEM & HARDWARE SETTINGS
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {savedNotice && (
              <span className="text-[10px] font-pixel text-emerald-400 flex items-center gap-1 bg-emerald-950/60 px-2 py-0.5 border border-emerald-500/40 animate-pulse">
                <Check className="w-3 h-3" /> SAVED
              </span>
            )}
            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-white transition-colors cursor-pointer"
              title="Close Settings"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-neutral-800 bg-neutral-900/40 text-xs font-pixel">
          <button
            onClick={() => {
              setActiveTab('hardware');
              sound.buttonClick();
            }}
            className={`flex-1 py-2.5 sm:py-3 flex items-center justify-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'hardware'
                ? 'bg-neutral-950 text-cyan-400 border-b-2 border-cyan-400'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span className="hidden sm:inline">HARDWARE & GRAPHICS</span>
            <span className="sm:hidden">HARDWARE</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('audio');
              sound.buttonClick();
            }}
            className={`flex-1 py-2.5 sm:py-3 flex items-center justify-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'audio'
                ? 'bg-neutral-950 text-yellow-400 border-b-2 border-yellow-400'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Volume2 className="w-4 h-4" />
            <span className="hidden sm:inline">AUDIO & SOUND FX</span>
            <span className="sm:hidden">AUDIO</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('controls');
              sound.buttonClick();
            }}
            className={`flex-1 py-2.5 sm:py-3 flex items-center justify-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'controls'
                ? 'bg-neutral-950 text-purple-400 border-b-2 border-purple-400'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Gamepad2 className="w-4 h-4" />
            <span className="hidden sm:inline">CONTROLS & INPUT</span>
            <span className="sm:hidden">CONTROLS</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6">
          {/* TAB 1: HARDWARE & GRAPHICS OPTIMIZATION */}
          {activeTab === 'hardware' && (
            <div className="space-y-6">
              {/* Quick Optimization Presets */}
              <div className="bg-neutral-900/60 border border-neutral-800 p-3.5">
                <div className="text-[10px] font-pixel text-neutral-400 mb-2.5 flex items-center justify-between">
                  <span>QUICK HARDWARE PRESETS</span>
                  <span className="text-[9px] text-cyan-400 font-pixel">1-CLICK OPTIMIZE</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    onClick={() => handleApplyPreset('battery')}
                    className="p-2 bg-neutral-950 hover:bg-neutral-900 border border-emerald-500/40 text-emerald-300 hover:border-emerald-400 flex flex-col items-center gap-1 text-[10px] font-pixel transition-colors cursor-pointer"
                  >
                    <BatteryCharging className="w-4 h-4 text-emerald-400" />
                    <span>BATTERY</span>
                    <span className="text-[8px] text-neutral-500">30fps / Eco</span>
                  </button>

                  <button
                    onClick={() => handleApplyPreset('performance')}
                    className="p-2 bg-neutral-950 hover:bg-neutral-900 border border-cyan-500/40 text-cyan-300 hover:border-cyan-400 flex flex-col items-center gap-1 text-[10px] font-pixel transition-colors cursor-pointer"
                  >
                    <Zap className="w-4 h-4 text-cyan-400" />
                    <span>PERFORMANCE</span>
                    <span className="text-[8px] text-neutral-500">60fps / Smooth</span>
                  </button>

                  <button
                    onClick={() => handleApplyPreset('balanced')}
                    className="p-2 bg-neutral-950 hover:bg-neutral-900 border border-yellow-500/40 text-yellow-300 hover:border-yellow-400 flex flex-col items-center gap-1 text-[10px] font-pixel transition-colors cursor-pointer"
                  >
                    <Gauge className="w-4 h-4 text-yellow-400" />
                    <span>BALANCED</span>
                    <span className="text-[8px] text-neutral-500">Default Quality</span>
                  </button>

                  <button
                    onClick={() => handleApplyPreset('ultra')}
                    className="p-2 bg-neutral-950 hover:bg-neutral-900 border border-purple-500/40 text-purple-300 hover:border-purple-400 flex flex-col items-center gap-1 text-[10px] font-pixel transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span>ULTRA 120Hz</span>
                    <span className="text-[8px] text-neutral-500">Max FX / CRT</span>
                  </button>
                </div>
              </div>

              {/* Framerate & Resolution */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Target FPS Cap */}
                <div className="bg-neutral-900/40 border border-neutral-800/80 p-3">
                  <div className="text-[11px] font-pixel text-neutral-300 mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Gauge className="w-3.5 h-3.5 text-cyan-400" /> TARGET FRAMERATE
                    </span>
                    <span className="text-cyan-400">{settings.fpsTarget === 0 ? 'UNCAPPED' : `${settings.fpsTarget} FPS`}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {([30, 60, 120, 0] as FpsTarget[]).map((fps) => (
                      <button
                        key={fps}
                        onClick={() => update({ fpsTarget: fps })}
                        className={`py-1.5 text-[10px] font-pixel border transition-colors cursor-pointer ${
                          settings.fpsTarget === fps
                            ? 'bg-cyan-950 border-cyan-400 text-cyan-200'
                            : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                        }`}
                      >
                        {fps === 0 ? 'MAX' : `${fps}`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Resolution Scale */}
                <div className="bg-neutral-900/40 border border-neutral-800/80 p-3">
                  <div className="text-[11px] font-pixel text-neutral-300 mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Monitor className="w-3.5 h-3.5 text-yellow-400" /> RENDER SCALE
                    </span>
                    <span className="text-yellow-400">{settings.resolutionScale}x</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {([0.75, 1.0, 1.25] as ResolutionScale[]).map((scale) => (
                      <button
                        key={scale}
                        onClick={() => update({ resolutionScale: scale })}
                        className={`py-1.5 text-[10px] font-pixel border transition-colors cursor-pointer ${
                          settings.resolutionScale === scale
                            ? 'bg-yellow-950 border-yellow-400 text-yellow-200'
                            : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                        }`}
                      >
                        {scale === 0.75 ? 'ECO 0.75x' : scale === 1.0 ? 'NATIVE 1x' : 'CRISP 1.25x'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Particle Quality & Dynamic Weather */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Particle Quality */}
                <div className="bg-neutral-900/40 border border-neutral-800/80 p-3">
                  <div className="text-[11px] font-pixel text-neutral-300 mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-purple-400" /> PARTICLE QUALITY
                    </span>
                    <span className="text-purple-300 uppercase">{settings.particleQuality}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {(['low', 'medium', 'high', 'ultra'] as ParticleQuality[]).map((pq) => (
                      <button
                        key={pq}
                        onClick={() => update({ particleQuality: pq })}
                        className={`py-1.5 text-[9px] font-pixel border uppercase transition-colors cursor-pointer ${
                          settings.particleQuality === pq
                            ? 'bg-purple-950 border-purple-400 text-purple-200'
                            : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                        }`}
                      >
                        {pq}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Weather Quality */}
                <div className="bg-neutral-900/40 border border-neutral-800/80 p-3">
                  <div className="text-[11px] font-pixel text-neutral-300 mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <CloudRain className="w-3.5 h-3.5 text-sky-400" /> WEATHER SYSTEM
                    </span>
                    <span className="text-sky-300 uppercase">{settings.weatherQuality}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['off', 'low', 'full'] as WeatherQuality[]).map((wq) => (
                      <button
                        key={wq}
                        onClick={() => update({ weatherQuality: wq })}
                        className={`py-1.5 text-[10px] font-pixel border uppercase transition-colors cursor-pointer ${
                          settings.weatherQuality === wq
                            ? 'bg-sky-950 border-sky-400 text-sky-200'
                            : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                        }`}
                      >
                        {wq === 'off' ? 'DISABLED' : wq === 'low' ? 'REDUCED' : 'DYNAMIC FULL'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* CRT Scanlines, Parallax, Screen Shake */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* CRT Filter */}
                <div className="bg-neutral-900/40 border border-neutral-800/80 p-3">
                  <div className="text-[10px] font-pixel text-neutral-300 mb-1.5">CRT SCANLINES</div>
                  <div className="grid grid-cols-3 gap-1">
                    {(['off', 'subtle', 'retro'] as ScanlineMode[]).map((sm) => (
                      <button
                        key={sm}
                        onClick={() => update({ scanlineMode: sm })}
                        className={`py-1 text-[9px] font-pixel border uppercase transition-colors cursor-pointer ${
                          settings.scanlineMode === sm
                            ? 'bg-cyan-950 border-cyan-400 text-cyan-200'
                            : 'bg-neutral-950/60 border-neutral-800 text-neutral-400'
                        }`}
                      >
                        {sm}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Parallax Layers */}
                <div className="bg-neutral-900/40 border border-neutral-800/80 p-3">
                  <div className="text-[10px] font-pixel text-neutral-300 mb-1.5">PARALLAX DEPTH</div>
                  <div className="grid grid-cols-3 gap-1">
                    {(['simple', 'medium', 'full'] as ParallaxQuality[]).map((pq) => (
                      <button
                        key={pq}
                        onClick={() => update({ parallaxQuality: pq })}
                        className={`py-1 text-[9px] font-pixel border uppercase transition-colors cursor-pointer ${
                          settings.parallaxQuality === pq
                            ? 'bg-amber-950 border-amber-400 text-amber-200'
                            : 'bg-neutral-950/60 border-neutral-800 text-neutral-400'
                        }`}
                      >
                        {pq}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Screen Shake */}
                <div className="bg-neutral-900/40 border border-neutral-800/80 p-3">
                  <div className="text-[10px] font-pixel text-neutral-300 mb-1.5">CAMERA SHAKE</div>
                  <div className="grid grid-cols-3 gap-1">
                    {(['off', 'mild', 'full'] as ScreenShakeMode[]).map((ss) => (
                      <button
                        key={ss}
                        onClick={() => update({ screenShake: ss })}
                        className={`py-1 text-[9px] font-pixel border uppercase transition-colors cursor-pointer ${
                          settings.screenShake === ss
                            ? 'bg-red-950 border-red-400 text-red-200'
                            : 'bg-neutral-950/60 border-neutral-800 text-neutral-400'
                        }`}
                      >
                        {ss}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Toggles (Ghost Trails, Low Power, FPS Monitor) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                <button
                  onClick={() => update({ ghostTrailsEnabled: !settings.ghostTrailsEnabled })}
                  className={`p-2.5 border flex items-center justify-between text-left transition-colors cursor-pointer ${
                    settings.ghostTrailsEnabled
                      ? 'bg-neutral-900 border-cyan-500/60 text-cyan-300'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-500'
                  }`}
                >
                  <span className="text-[10px] font-pixel">DASH GHOST TRAILS</span>
                  <span className="text-[9px] font-pixel">{settings.ghostTrailsEnabled ? 'ON' : 'OFF'}</span>
                </button>

                <button
                  onClick={() => update({ lowPowerMode: !settings.lowPowerMode })}
                  className={`p-2.5 border flex items-center justify-between text-left transition-colors cursor-pointer ${
                    settings.lowPowerMode
                      ? 'bg-neutral-900 border-emerald-500/60 text-emerald-300'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-500'
                  }`}
                >
                  <span className="text-[10px] font-pixel">LOW POWER / BATTERY</span>
                  <span className="text-[9px] font-pixel">{settings.lowPowerMode ? 'ON' : 'OFF'}</span>
                </button>

                <button
                  onClick={() => update({ showFpsCounter: !settings.showFpsCounter })}
                  className={`p-2.5 border flex items-center justify-between text-left transition-colors cursor-pointer ${
                    settings.showFpsCounter
                      ? 'bg-neutral-900 border-yellow-500/60 text-yellow-300'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-500'
                  }`}
                >
                  <span className="text-[10px] font-pixel">HUD FPS MONITOR</span>
                  <span className="text-[9px] font-pixel">{settings.showFpsCounter ? 'ON' : 'OFF'}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: AUDIO & SOUND FX */}
          {activeTab === 'audio' && (
            <div className="space-y-6">
              {/* Audio Engine Selection (Free WAV Audio Pack vs 8-bit Synth) */}
              <div className="bg-neutral-900/60 border border-neutral-800 p-3.5">
                <div className="text-[11px] font-pixel text-neutral-300 mb-2.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-cyan-400" /> AUDIO SOURCE ENGINE
                  </span>
                  <span className="text-[9px] text-cyan-400 font-pixel">STUDIO WAV / CHIPTUNE SYNTH</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    onClick={() => handleAudioEngineChange('wav_pack')}
                    className={`p-3 border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                      settings.audioEngine === 'wav_pack'
                        ? 'bg-cyan-950/80 border-cyan-400 text-cyan-100 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-pixel text-cyan-300 flex items-center gap-1.5">
                        <Music className="w-3.5 h-3.5" /> STUDIO AUDIO PACK (WAV)
                      </span>
                      {settings.audioEngine === 'wav_pack' && (
                        <span className="text-[9px] bg-cyan-500 text-black px-1.5 py-0.2 font-bold font-pixel">ACTIVE</span>
                      )}
                    </div>
                    <p className="text-[10px] text-neutral-400 leading-normal">
                      High-fidelity 44.1kHz 16-bit uncompressed audio assets (retro platformer sound effects & studio BGM loops).
                    </p>
                  </button>

                  <button
                    onClick={() => handleAudioEngineChange('chiptune_synth')}
                    className={`p-3 border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                      settings.audioEngine === 'chiptune_synth'
                        ? 'bg-purple-950/80 border-purple-400 text-purple-100 shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-pixel text-purple-300 flex items-center gap-1.5">
                        <Radio className="w-3.5 h-3.5" /> 8-BIT WEBAUDIO SYNTH
                      </span>
                      {settings.audioEngine === 'chiptune_synth' && (
                        <span className="text-[9px] bg-purple-500 text-black px-1.5 py-0.2 font-bold font-pixel">ACTIVE</span>
                      )}
                    </div>
                    <p className="text-[10px] text-neutral-400 leading-normal">
                      Real-time algorithmic square/triangle wave oscillators and 16-step retro chiptune sequencer.
                    </p>
                  </button>
                </div>
              </div>

              {/* Master Mute & Volume Sliders */}
              <div className="space-y-4 bg-neutral-900/30 border border-neutral-800/80 p-3.5">
                {/* Master Mute Toggle */}
                <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                  <div>
                    <span className="text-xs font-pixel text-neutral-200">MASTER AUDIO OUTPUT</span>
                    <p className="text-[10px] text-neutral-500">Mute all background music & sound effects</p>
                  </div>
                  <button
                    onClick={handleToggleMute}
                    className={`flex items-center gap-2 px-3 py-1.5 text-xs font-pixel transition-colors cursor-pointer ${
                      settings.isMuted
                        ? 'bg-red-950 border border-red-500 text-red-300'
                        : 'bg-cyan-950 border border-cyan-500 text-cyan-300'
                    }`}
                  >
                    {settings.isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    {settings.isMuted ? 'MUTED' : 'ENABLED'}
                  </button>
                </div>

                {/* Master Volume */}
                <div>
                  <div className="flex justify-between text-[11px] font-pixel text-neutral-400 mb-1">
                    <span>MASTER VOLUME</span>
                    <span>{Math.round(settings.masterVolume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={settings.masterVolume}
                    onChange={(e) => handleMasterVolChange(parseFloat(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </div>

                {/* Music Volume */}
                <div>
                  <div className="flex justify-between text-[11px] font-pixel text-neutral-400 mb-1">
                    <span>MUSIC (BGM)</span>
                    <span>{Math.round(settings.musicVolume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={settings.musicVolume}
                    onChange={(e) => handleBgmVolChange(parseFloat(e.target.value))}
                    className="w-full accent-sky-400 cursor-pointer"
                  />
                </div>

                {/* SFX Volume */}
                <div>
                  <div className="flex justify-between text-[11px] font-pixel text-neutral-400 mb-1">
                    <span>SOUND EFFECTS (SFX)</span>
                    <span>{Math.round(settings.sfxVolume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={settings.sfxVolume}
                    onChange={(e) => handleSfxVolChange(parseFloat(e.target.value))}
                    className="w-full accent-yellow-400 cursor-pointer"
                  />
                </div>
              </div>

              {/* Start Menu BGM Toggle */}
              <div className="flex items-center justify-between p-3.5 bg-neutral-900/40 border border-neutral-800">
                <div>
                  <span className="text-xs font-pixel text-cyan-300 flex items-center gap-1.5">
                    <Music className="w-3.5 h-3.5 text-cyan-400" /> START MENU MUSIC (TITLE THEME)
                  </span>
                  <p className="text-[10px] text-neutral-400">Play gentle, minimalist ambient chime melody on Start Menu</p>
                </div>
                <button
                  onClick={() => {
                    const next = !settings.menuMusicEnabled;
                    update({ menuMusicEnabled: next });
                    sound.setMenuMusicEnabled(next);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-pixel transition-colors cursor-pointer ${
                    settings.menuMusicEnabled
                      ? 'bg-cyan-950 border border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                      : 'bg-neutral-950 border border-neutral-800 text-neutral-500'
                  }`}
                >
                  <Music className="w-3.5 h-3.5" />
                  {settings.menuMusicEnabled ? 'ENABLED' : 'DISABLED'}
                </button>
              </div>

              {/* BGM Track Selector */}
              <div className="bg-neutral-900/30 border border-neutral-800/80 p-3.5">
                <div className="text-[11px] font-pixel text-neutral-300 mb-2">BACKGROUND MUSIC TRACK</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                  <button
                    onClick={() => handleBgmTrackChange('cyber_odyssey')}
                    className={`p-2.5 border text-left text-[11px] font-pixel flex items-center justify-between transition-colors cursor-pointer ${
                      settings.selectedBgmTrack === 'cyber_odyssey'
                        ? 'bg-cyan-950 border-cyan-400 text-cyan-200'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    <span className="truncate mr-1">BG 1: ODYSSEY (140BPM)</span>
                    <Play className="w-3.5 h-3.5 shrink-0" />
                  </button>

                  <button
                    onClick={() => handleBgmTrackChange('neon_pulse')}
                    className={`p-2.5 border text-left text-[11px] font-pixel flex items-center justify-between transition-colors cursor-pointer ${
                      settings.selectedBgmTrack === 'neon_pulse'
                        ? 'bg-yellow-950 border-yellow-400 text-yellow-200'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    <span className="truncate mr-1">BG 2: PULSE (145BPM)</span>
                    <Play className="w-3.5 h-3.5 shrink-0" />
                  </button>

                  <button
                    onClick={() => handleBgmTrackChange('cyber_funk')}
                    className={`p-2.5 border text-left text-[11px] font-pixel flex items-center justify-between transition-colors cursor-pointer ${
                      settings.selectedBgmTrack === 'cyber_funk'
                        ? 'bg-emerald-950 border-emerald-400 text-emerald-200'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    <span className="truncate mr-1">BG 3: FUNK (126BPM)</span>
                    <Play className="w-3.5 h-3.5 shrink-0" />
                  </button>

                  <button
                    onClick={() => handleBgmTrackChange('start_menu')}
                    className={`p-2.5 border text-left text-[11px] font-pixel flex items-center justify-between transition-colors cursor-pointer ${
                      settings.selectedBgmTrack === 'start_menu'
                        ? 'bg-purple-950 border-purple-400 text-purple-200'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    <span className="truncate mr-1">MENU: CALM (92BPM)</span>
                    <Play className="w-3.5 h-3.5 shrink-0" />
                  </button>
                </div>
              </div>

              {/* Interactive SFX Test Soundboard */}
              <div className="bg-neutral-900/30 border border-neutral-800/80 p-3.5">
                <div className="text-[11px] font-pixel text-neutral-300 mb-2 flex items-center justify-between">
                  <span>SOUND EFFECTS PREVIEW PAD</span>
                  <span className="text-[9px] text-yellow-400 font-pixel">CLICK TO TEST</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {testSfxList.map((item) => (
                    <button
                      key={item.key}
                      onClick={() => sound.previewSound(item.key)}
                      className="p-2 bg-neutral-950 hover:bg-neutral-900 border border-neutral-800 hover:border-yellow-400 text-neutral-300 hover:text-yellow-300 text-[10px] font-pixel flex flex-col items-center gap-1 transition-colors cursor-pointer"
                    >
                      <span className="text-sm">{item.icon}</span>
                      <span className="truncate w-full text-center">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CONTROLS & INPUT */}
          {activeTab === 'controls' && (
            <div className="space-y-6">
              {/* Virtual Touch Controls Mode */}
              <div className="bg-neutral-900/40 border border-neutral-800/80 p-3.5">
                <div className="text-[11px] font-pixel text-neutral-300 mb-2">VIRTUAL TOUCH CONTROLS (MOBILE)</div>
                <div className="grid grid-cols-3 gap-2">
                  {(['auto', 'always', 'never'] as TouchControlsMode[]).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => update({ touchControlsMode: mode })}
                      className={`p-2.5 border text-center text-xs font-pixel uppercase transition-colors cursor-pointer ${
                        settings.touchControlsMode === mode
                          ? 'bg-purple-950 border-purple-400 text-purple-200'
                          : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                      }`}
                    >
                      {mode === 'auto' ? 'AUTO-DETECT' : mode === 'always' ? 'ALWAYS ON' : 'DISABLED'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Jump Buffering */}
              <div className="bg-neutral-900/40 border border-neutral-800/80 p-3.5 flex items-center justify-between">
                <div>
                  <div className="text-xs font-pixel text-neutral-200">JUMP INPUT BUFFERING</div>
                  <p className="text-[10px] text-neutral-500">Caches jump input 120ms before landing for responsive timing</p>
                </div>
                <button
                  onClick={() => update({ jumpBuffering: !settings.jumpBuffering })}
                  className={`px-3 py-1.5 border text-xs font-pixel transition-colors cursor-pointer ${
                    settings.jumpBuffering
                      ? 'bg-cyan-950 border-cyan-400 text-cyan-300'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-500'
                  }`}
                >
                  {settings.jumpBuffering ? 'ENABLED' : 'DISABLED'}
                </button>
              </div>

              {/* Desktop Keybinds & Mouse Reference Table */}
              <div className="bg-neutral-900/40 border border-neutral-800/80 p-3.5">
                <div className="text-[11px] font-pixel text-neutral-300 mb-2">KEYBOARD & MOUSE CONTROLS REFERENCE</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2 bg-neutral-950 border border-neutral-800 flex justify-between items-center">
                    <span className="font-pixel text-[10px] text-neutral-400">MOVE LEFT / RIGHT</span>
                    <span className="font-pixel text-cyan-300">A / D or ⬅️ / ➡️</span>
                  </div>
                  <div className="p-2 bg-neutral-950 border border-neutral-800 flex justify-between items-center">
                    <span className="font-pixel text-[10px] text-neutral-400">JUMP / DOUBLE JUMP</span>
                    <span className="font-pixel text-yellow-300">LEFT CLICK / SPACE / W</span>
                  </div>
                  <div className="p-2 bg-neutral-950 border border-neutral-800 flex justify-between items-center">
                    <span className="font-pixel text-[10px] text-neutral-400">SONIC DASH</span>
                    <span className="font-pixel text-amber-300">RIGHT CLICK / SHIFT / X</span>
                  </div>
                  <div className="p-2 bg-neutral-950 border border-neutral-800 flex justify-between items-center">
                    <span className="font-pixel text-[10px] text-neutral-400">DROP THROUGH PLATFORM</span>
                    <span className="font-pixel text-neutral-200">S or ⬇️ + JUMP</span>
                  </div>
                  <div className="p-2 bg-neutral-950 border border-neutral-800 flex justify-between items-center">
                    <span className="font-pixel text-[10px] text-neutral-400">WALL SLIDE & JUMP</span>
                    <span className="font-pixel text-emerald-300">HOLD WALL + JUMP</span>
                  </div>
                  <div className="p-2 bg-neutral-950 border border-neutral-800 flex justify-between items-center">
                    <span className="font-pixel text-[10px] text-neutral-400">REPLAY / RESTART LEVEL</span>
                    <span className="font-pixel text-red-300">KEY R</span>
                  </div>
                  <div className="p-2 bg-neutral-950 border border-neutral-800 flex justify-between items-center">
                    <span className="font-pixel text-[10px] text-neutral-400">CUSTOMIZE HERO (C)</span>
                    <span className="font-pixel text-purple-300">KEY C</span>
                  </div>
                  <div className="p-2 bg-neutral-950 border border-neutral-800 flex justify-between items-center">
                    <span className="font-pixel text-[10px] text-neutral-400">SAVE & CLOSE MODALS</span>
                    <span className="font-pixel text-emerald-300">SPACE / ESC</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer & Reset Defaults */}
        <div className="p-3 sm:p-4 border-t border-neutral-800 bg-neutral-900/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {!confirmReset ? (
              <button
                onClick={() => setConfirmReset(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-400 hover:text-neutral-200 text-xs font-pixel transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>RESTORE DEFAULTS</span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleResetDefaults}
                  className="px-2.5 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-pixel font-bold transition-colors cursor-pointer"
                >
                  CONFIRM RESET
                </button>
                <button
                  onClick={() => setConfirmReset(false)}
                  className="px-2 py-1.5 text-neutral-400 hover:text-white text-xs font-pixel"
                >
                  CANCEL
                </button>
              </div>
            )}

            <span className="hidden sm:inline text-[9px] font-pixel text-neutral-600">
              LOCAL STORAGE SYNCED
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-neutral-950 text-xs font-pixel font-bold shadow-[0_0_12px_rgba(6,182,212,0.5)] transition-all cursor-pointer"
          >
            SAVE & CLOSE (SPACE)
          </button>
        </div>
      </div>
    </div>
  );
};
