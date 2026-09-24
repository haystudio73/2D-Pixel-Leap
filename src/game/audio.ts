// Web Audio API Procedural Chiptune Synthesizer + Free Royalty-Free WAV/MP3 Audio Pack Player
import { getSettings, saveSettings, BgmTrackOption, AudioEngineMode } from './settings';

export type SfxKey = 
  | 'jump'
  | 'doubleJump'
  | 'spring'
  | 'dash'
  | 'coin'
  | 'powerup'
  | 'hit'
  | 'shieldBlock'
  | 'checkpoint'
  | 'levelClear'
  | 'gameOver'
  | 'click';

class SoundEngine {
  private ctx: AudioContext | null = null;
  private bgmGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private masterGain: GainNode | null = null;

  public bgmVolume = 0.65;
  public sfxVolume = 0.8;
  public masterVolume = 0.8;
  public isMuted = false;
  public audioEngine: AudioEngineMode = 'wav_pack';
  public selectedBgmTrack: BgmTrackOption = 'cyber_odyssey';
  public menuMusicEnabled = true;

  // BGM Sequencer state (for chiptune mode)
  private isBgmPlaying = false;
  public isMenuBgmPlaying = false;
  private currentTrackIndex = 0;
  private currentStep = 0;
  private stepIntervalId: number | null = null;
  private bpm = 140;

  // WAV Audio Pack Buffers Cache (for short SFX)
  private audioBuffers: Map<string, AudioBuffer> = new Map();
  private preloadPromise: Promise<void> | null = null;
  private noiseBuffer: AudioBuffer | null = null;

  // Dedicated HTML5 Streaming Audio Elements for BGM (Zero Main-Thread Latency, Zero Freeze)
  private menuAudio: HTMLAudioElement | null = null;
  private bgmAudio: HTMLAudioElement | null = null;

  constructor() {
    const s = getSettings();
    this.isMuted = s.isMuted;
    this.masterVolume = s.masterVolume;
    this.bgmVolume = s.musicVolume;
    this.sfxVolume = s.sfxVolume;
    this.audioEngine = s.audioEngine;
    this.selectedBgmTrack = s.selectedBgmTrack;
    this.menuMusicEnabled = s.menuMusicEnabled ?? true;
  }

  public init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.isMuted ? 0 : this.masterVolume;
      this.masterGain.connect(this.ctx.destination);

      this.bgmGain = this.ctx.createGain();
      this.bgmGain.gain.value = this.bgmVolume;
      this.bgmGain.connect(this.masterGain);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = this.sfxVolume;
      this.sfxGain.connect(this.masterGain);

      // Pre-generate reusable noise buffer for synth drums (eliminates per-step allocations)
      const noiseLen = Math.floor(this.ctx.sampleRate * 0.08);
      this.noiseBuffer = this.ctx.createBuffer(1, noiseLen, this.ctx.sampleRate);
      const data = this.noiseBuffer.getChannelData(0);
      for (let i = 0; i < noiseLen; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      // Preload lightweight SFX files in background (only short ~10KB-40KB sound effects)
      this.preloadAudioBuffers();
    } catch (e) {
      console.warn('Web Audio API not supported or blocked:', e);
    }
  }

  private ensureContext(): boolean {
    if (!this.ctx) {
      this.init();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return !!this.ctx;
  }

  /**
   * Safely load and decode an individual small audio file into memory buffer
   */
  public async loadSingleBuffer(key: string, url: string): Promise<AudioBuffer | null> {
    if (this.audioBuffers.has(key)) {
      return this.audioBuffers.get(key)!;
    }
    if (!this.ctx) return null;
    try {
      const resp = await fetch(url);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const arrayBuf = await resp.arrayBuffer();
      if (!this.ctx) return null;
      const audioBuf = await this.ctx.decodeAudioData(arrayBuf);
      this.audioBuffers.set(key, audioBuf);
      return audioBuf;
    } catch (err) {
      console.warn(`[Audio] SFX buffer load skipped for ${key}:`, err);
      return null;
    }
  }

  /**
   * Preload ONLY short sound effects (under 50KB each) into memory buffers.
   * Large BGM files are streamed directly via HTMLAudioElement without blocking!
   */
  public async preloadAudioBuffers(): Promise<void> {
    if (!this.ctx) return;
    if (this.preloadPromise) {
      return this.preloadPromise;
    }

    this.preloadPromise = (async () => {
      const sfxFiles: Record<string, string> = {
        click: '/audio/click.wav',
        jump: '/audio/jump.wav',
        coin: '/audio/coin.wav',
        dash: '/audio/dash.wav',
        powerup: '/audio/powerup.wav',
        hit: '/audio/hit.wav',
        bounce: '/audio/bounce.wav',
        gameover: '/audio/gameover.wav',
        victory: '/audio/victory.wav',
      };

      await Promise.allSettled(
        Object.entries(sfxFiles).map(([k, u]) => this.loadSingleBuffer(k, u))
      );
    })().finally(() => {
      this.preloadPromise = null;
    });

    return this.preloadPromise;
  }

  /**
   * Play a cached audio buffer with gain and playbackRate modulation
   */
  private playBuffer(key: string, rate: number = 1.0, gainMult: number = 1.0): boolean {
    if (!this.ensureContext() || this.isMuted || !this.ctx || !this.sfxGain) return false;
    const buf = this.audioBuffers.get(key);
    if (!buf) return false;

    try {
      const source = this.ctx.createBufferSource();
      source.buffer = buf;
      source.playbackRate.value = rate;

      const individualGain = this.ctx.createGain();
      individualGain.gain.value = gainMult;

      source.connect(individualGain);
      individualGain.connect(this.sfxGain);

      source.start();
      return true;
    } catch (e) {
      return false;
    }
  }

  // --- Volume and Mode Setters ---

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    saveSettings({ isMuted: muted });
    const effectiveMusicVol = muted ? 0 : this.masterVolume * this.bgmVolume;
    if (this.menuAudio) this.menuAudio.volume = effectiveMusicVol;
    if (this.bgmAudio) this.bgmAudio.volume = effectiveMusicVol;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : this.masterVolume, this.ctx.currentTime);
    }
  }

  public setMasterVolume(val: number) {
    this.masterVolume = Math.max(0, Math.min(1, val));
    saveSettings({ masterVolume: this.masterVolume });
    const effectiveMusicVol = this.isMuted ? 0 : this.masterVolume * this.bgmVolume;
    if (this.menuAudio) this.menuAudio.volume = effectiveMusicVol;
    if (this.bgmAudio) this.bgmAudio.volume = effectiveMusicVol;
    if (this.masterGain && this.ctx && !this.isMuted) {
      this.masterGain.gain.setValueAtTime(this.masterVolume, this.ctx.currentTime);
    }
  }

  public setBgmVolume(val: number) {
    this.bgmVolume = Math.max(0, Math.min(1, val));
    saveSettings({ musicVolume: this.bgmVolume });
    const effectiveMusicVol = this.isMuted ? 0 : this.masterVolume * this.bgmVolume;
    if (this.menuAudio) this.menuAudio.volume = effectiveMusicVol;
    if (this.bgmAudio) this.bgmAudio.volume = effectiveMusicVol;
    if (this.bgmGain && this.ctx) {
      this.bgmGain.gain.setValueAtTime(this.bgmVolume, this.ctx.currentTime);
    }
  }

  public setSfxVolume(val: number) {
    this.sfxVolume = Math.max(0, Math.min(1, val));
    saveSettings({ sfxVolume: this.sfxVolume });
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
    }
  }

  public setAudioEngine(engine: AudioEngineMode) {
    this.audioEngine = engine;
    saveSettings({ audioEngine: engine });
    if (this.isBgmPlaying) {
      // Restart BGM in new engine mode
      this.stopBgm();
      this.startBgm();
    }
  }

  public setBgmTrack(track: BgmTrackOption) {
    this.selectedBgmTrack = track;
    saveSettings({ selectedBgmTrack: track });
    if (this.isBgmPlaying) {
      this.stopBgm();
      this.startBgm();
    }
  }

  public setMenuMusicEnabled(enabled: boolean) {
    this.menuMusicEnabled = enabled;
    saveSettings({ menuMusicEnabled: enabled });
    if (!enabled) {
      this.stopMenuBgm();
    } else if (!this.isBgmPlaying) {
      this.startMenuBgm();
    }
  }

  // --- SOUND EFFECTS (With WAV Audio Pack + Procedural Fallback) ---

  public playJump() {
    if (this.audioEngine === 'wav_pack' && this.playBuffer('jump', 0.95 + Math.random() * 0.1)) {
      return;
    }
    // Procedural Fallback
    if (!this.ensureContext() || this.isMuted) return;
    const t = this.ctx!.currentTime;
    const osc = this.ctx!.createOscillator();
    const gain = this.ctx!.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.exponentialRampToValueAtTime(440, t + 0.12);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.linearRampToValueAtTime(0.01, t + 0.12);

    osc.connect(gain);
    gain.connect(this.sfxGain!);
    osc.start(t);
    osc.stop(t + 0.12);
  }

  public playDoubleJump() {
    if (this.audioEngine === 'wav_pack' && this.playBuffer('jump', 1.3, 0.9)) {
      return;
    }
    if (!this.ensureContext() || this.isMuted) return;
    const t = this.ctx!.currentTime;
    const osc = this.ctx!.createOscillator();
    const gain = this.ctx!.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(780, t + 0.15);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.linearRampToValueAtTime(0.01, t + 0.15);

    osc.connect(gain);
    gain.connect(this.sfxGain!);
    osc.start(t);
    osc.stop(t + 0.15);
  }

  public playSpring() {
    if (this.audioEngine === 'wav_pack' && this.playBuffer('bounce', 1.0)) {
      return;
    }
    if (!this.ensureContext() || this.isMuted) return;
    const t = this.ctx!.currentTime;
    const osc = this.ctx!.createOscillator();
    const gain = this.ctx!.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, t);
    osc.frequency.linearRampToValueAtTime(600, t + 0.08);
    osc.frequency.linearRampToValueAtTime(300, t + 0.16);
    osc.frequency.linearRampToValueAtTime(800, t + 0.28);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.linearRampToValueAtTime(0.01, t + 0.28);

    osc.connect(gain);
    gain.connect(this.sfxGain!);
    osc.start(t);
    osc.stop(t + 0.28);
  }

  public playDash() {
    if (this.audioEngine === 'wav_pack' && this.playBuffer('dash', 1.0)) {
      return;
    }
    if (!this.ensureContext() || this.isMuted) return;
    const t = this.ctx!.currentTime;
    const bufferSize = this.ctx!.sampleRate * 0.15;
    const buffer = this.ctx!.createBuffer(1, bufferSize, this.ctx!.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx!.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx!.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, t);
    filter.frequency.linearRampToValueAtTime(2400, t + 0.15);
    filter.Q.value = 3.0;

    const gain = this.ctx!.createGain();
    gain.gain.setValueAtTime(0.45, t);
    gain.gain.linearRampToValueAtTime(0.01, t + 0.15);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain!);
    noise.start(t);
  }

  public playCoin() {
    if (this.audioEngine === 'wav_pack' && this.playBuffer('coin', 0.98 + Math.random() * 0.05)) {
      return;
    }
    if (!this.ensureContext() || this.isMuted) return;
    const t = this.ctx!.currentTime;
    const osc1 = this.ctx!.createOscillator();
    const osc2 = this.ctx!.createOscillator();
    const gain = this.ctx!.createGain();

    osc1.type = 'square';
    osc2.type = 'sine';
    osc1.frequency.setValueAtTime(987.77, t); // B5
    osc1.frequency.setValueAtTime(1318.51, t + 0.08); // E6
    osc2.frequency.setValueAtTime(987.77, t);
    osc2.frequency.setValueAtTime(1318.51, t + 0.08);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.setValueAtTime(0.35, t + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.sfxGain!);

    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + 0.35);
    osc2.stop(t + 0.35);
  }

  public playPowerUp() {
    if (this.audioEngine === 'wav_pack' && this.playBuffer('powerup', 1.0)) {
      return;
    }
    if (!this.ensureContext() || this.isMuted) return;
    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
    const t = this.ctx!.currentTime;

    notes.forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, t + i * 0.06);

      gain.gain.setValueAtTime(0.25, t + i * 0.06);
      gain.gain.linearRampToValueAtTime(0.01, t + i * 0.06 + 0.15);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(t + i * 0.06);
      osc.stop(t + i * 0.06 + 0.15);
    });
  }

  public playHit() {
    if (this.audioEngine === 'wav_pack' && this.playBuffer('hit', 1.0)) {
      return;
    }
    if (!this.ensureContext() || this.isMuted) return;
    const t = this.ctx!.currentTime;
    const osc = this.ctx!.createOscillator();
    const gain = this.ctx!.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.2);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.linearRampToValueAtTime(0.01, t + 0.2);

    osc.connect(gain);
    gain.connect(this.sfxGain!);
    osc.start(t);
    osc.stop(t + 0.2);
  }

  public playShieldBlock() {
    if (this.audioEngine === 'wav_pack' && this.playBuffer('bounce', 1.4, 0.8)) {
      return;
    }
    if (!this.ensureContext() || this.isMuted) return;
    const t = this.ctx!.currentTime;
    const osc = this.ctx!.createOscillator();
    const gain = this.ctx!.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(200, t + 0.25);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.linearRampToValueAtTime(0.01, t + 0.25);

    osc.connect(gain);
    gain.connect(this.sfxGain!);
    osc.start(t);
    osc.stop(t + 0.25);
  }

  public playCheckpoint() {
    if (this.audioEngine === 'wav_pack' && this.playBuffer('powerup', 1.15)) {
      return;
    }
    if (!this.ensureContext() || this.isMuted) return;
    const notes = [440, 554.37, 659.25, 880];
    const t = this.ctx!.currentTime;

    notes.forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + i * 0.08);

      gain.gain.setValueAtTime(0.3, t + i * 0.08);
      gain.gain.linearRampToValueAtTime(0.01, t + i * 0.08 + 0.2);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(t + i * 0.08);
      osc.stop(t + i * 0.08 + 0.2);
    });
  }

  public playLevelClear() {
    if (this.audioEngine === 'wav_pack' && this.playBuffer('victory', 1.0)) {
      return;
    }
    if (!this.ensureContext() || this.isMuted) return;
    const notes = [523.25, 659.25, 783.99, 1046.50, 1046.50];
    const t = this.ctx!.currentTime;

    notes.forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, t + i * 0.12);

      const dur = i === notes.length - 1 ? 0.6 : 0.18;
      gain.gain.setValueAtTime(0.35, t + i * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.01, t + i * 0.12 + dur);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(t + i * 0.12);
      osc.stop(t + i * 0.12 + dur);
    });
  }

  public playGameOver() {
    if (this.audioEngine === 'wav_pack' && this.playBuffer('gameover', 1.0)) {
      return;
    }
    if (!this.ensureContext() || this.isMuted) return;
    const notes = [349.23, 329.63, 293.66, 261.63];
    const t = this.ctx!.currentTime;

    notes.forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, t + i * 0.22);

      gain.gain.setValueAtTime(0.3, t + i * 0.22);
      gain.gain.linearRampToValueAtTime(0.01, t + i * 0.22 + 0.35);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(t + i * 0.22);
      osc.stop(t + i * 0.22 + 0.35);
    });
  }

  public buttonClick() {
    if (this.audioEngine === 'wav_pack' && this.playBuffer('click', 1.0, 0.6)) {
      return;
    }
    if (!this.ensureContext() || this.isMuted) return;
    const t = this.ctx!.currentTime;
    const osc = this.ctx!.createOscillator();
    const gain = this.ctx!.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(520, t);
    osc.frequency.exponentialRampToValueAtTime(740, t + 0.04);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.linearRampToValueAtTime(0.01, t + 0.04);

    osc.connect(gain);
    gain.connect(this.sfxGain!);
    osc.start(t);
    osc.stop(t + 0.04);
  }

  public powerupCollect() {
    this.playPowerUp();
  }

  /**
   * Preview a sound effect by key (used by Settings UI)
   */
  public previewSound(key: SfxKey) {
    this.ensureContext();
    switch (key) {
      case 'jump': this.playJump(); break;
      case 'doubleJump': this.playDoubleJump(); break;
      case 'spring': this.playSpring(); break;
      case 'dash': this.playDash(); break;
      case 'coin': this.playCoin(); break;
      case 'powerup': this.playPowerUp(); break;
      case 'hit': this.playHit(); break;
      case 'shieldBlock': this.playShieldBlock(); break;
      case 'checkpoint': this.playCheckpoint(); break;
      case 'levelClear': this.playLevelClear(); break;
      case 'gameOver': this.playGameOver(); break;
      case 'click': this.buttonClick(); break;
    }
  }

  // --- BACKGROUND MUSIC ENGINE (HTML5 Streaming Audio Elements) ---

  public startMenuBgm() {
    if (this.isMenuBgmPlaying || this.isMuted || !this.menuMusicEnabled) return;
    this.isMenuBgmPlaying = true;
    this.playMenuWavBgm();
  }

  public stopMenuBgm() {
    this.isMenuBgmPlaying = false;
    if (this.menuAudio) {
      try {
        this.menuAudio.pause();
        this.menuAudio.currentTime = 0;
      } catch (e) {}
    }
    if (this.stepIntervalId !== null && !this.isBgmPlaying) {
      clearInterval(this.stepIntervalId);
      this.stepIntervalId = null;
    }
  }

  private playMenuWavBgm() {
    if (!this.isMenuBgmPlaying || this.isMuted || !this.menuMusicEnabled) return;

    try {
      if (!this.menuAudio) {
        this.menuAudio = new Audio('/audio/bg_start_menu.mp3');
        this.menuAudio.loop = true;
      }
      this.menuAudio.volume = this.isMuted ? 0 : this.masterVolume * this.bgmVolume;
      const playPromise = this.menuAudio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          // Normal browser autoplay restriction before first interaction
          console.warn('[Audio] Menu BGM waiting for user gesture:', err);
        });
      }
    } catch (e) {
      console.warn('[Audio] Failed to play Menu BGM:', e);
    }
  }

  public startBgm() {
    if (this.isBgmPlaying || this.isMuted) return;

    // When starting gameplay BGM, always stop menu BGM
    this.stopMenuBgm();

    this.isBgmPlaying = true;

    if (this.audioEngine === 'chiptune_synth') {
      this.ensureContext();
      this.startSynthBgm();
    } else {
      this.playWavBgm();
    }
  }

  private playWavBgm() {
    if (!this.isBgmPlaying || this.isMuted) return;

    let trackUrl = '/audio/bg_cyber_odyssey.wav';
    if (this.selectedBgmTrack === 'neon_pulse') {
      trackUrl = '/audio/bg_neon_pulse.wav';
    } else if (this.selectedBgmTrack === 'cyber_funk') {
      trackUrl = '/audio/bg_cyber_funk.wav';
    } else if (this.selectedBgmTrack === 'start_menu') {
      trackUrl = '/audio/bg_start_menu.mp3';
    }

    try {
      if (this.bgmAudio) {
        try {
          this.bgmAudio.pause();
        } catch (e) {}
      }
      this.bgmAudio = new Audio(trackUrl);
      this.bgmAudio.loop = true;
      this.bgmAudio.volume = this.isMuted ? 0 : this.masterVolume * this.bgmVolume;
      const playPromise = this.bgmAudio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('[Audio] Gameplay BGM waiting for user gesture:', err);
        });
      }
    } catch (e) {
      console.warn('[Audio] Failed to start BGM:', e);
    }
  }

  public stopBgm() {
    this.isBgmPlaying = false;
    if (this.bgmAudio) {
      try {
        this.bgmAudio.pause();
        this.bgmAudio.currentTime = 0;
      } catch (e) {}
    }
    if (this.stepIntervalId !== null) {
      clearInterval(this.stepIntervalId);
      this.stepIntervalId = null;
    }
  }

  // --- PROCEDURAL 8-BIT CHIPTUNE SYNTH SEQUENCER ---

  private tracks = [
    {
      name: 'BG Music 1: Cyber Odyssey (140 BPM - Chiptune)',
      bpm: 140,
      bassNotes: [110, 110, 130.81, 146.83, 110, 110, 98, 110], // A2 -> C3 -> D3 -> G2
      leadMelody: [
        440, 0, 523.25, 0, 659.25, 587.33, 523.25, 0,
        440, 659.25, 880, 0, 783.99, 659.25, 587.33, 523.25
      ],
    },
    {
      name: 'BG Music 2: Neon Pulse (145 BPM - Synth)',
      bpm: 148,
      bassNotes: [146.83, 146.83, 164.81, 174.61, 130.81, 130.81, 146.83, 164.81], // D3 -> E3 -> F3 -> C3
      leadMelody: [
        587.33, 659.25, 698.46, 0, 880, 0, 783.99, 659.25,
        587.33, 0, 523.25, 587.33, 659.25, 0, 523.25, 440
      ],
    },
    {
      name: 'BG Music 3: Midnight Funk (126 BPM - Retro Groove)',
      bpm: 126,
      bassNotes: [123.47, 123.47, 146.83, 174.61, 98.00, 98.00, 164.81, 185.00], // B2 -> D3 -> F#3 -> G2
      leadMelody: [
        493.88, 587.33, 739.99, 880, 739.99, 587.33, 493.88, 0,
        587.33, 739.99, 987.77, 0, 880, 739.99, 587.33, 493.88
      ],
    },
    {
      name: 'Start Menu: Calm Horizon (92 BPM - Mellow Ambient)',
      bpm: 92,
      isAmbient: true,
      bassNotes: [130.81, 130.81, 123.47, 123.47, 110.00, 110.00, 98.00, 98.00], // C3 -> B2 -> A2 -> G2
      leadMelody: [
        523.25, 0, 493.88, 0, 440.00, 0, 392.00, 0,
        440.00, 0, 523.25, 0, 392.00, 0, 329.63, 0
      ],
    },
    {
      name: 'Volcanic Core',
      bpm: 154,
      bassNotes: [82.41, 82.41, 87.31, 98.00, 82.41, 82.41, 73.42, 82.41], // E2 -> F2 -> G2 -> D2
      leadMelody: [
        329.63, 0, 392.00, 440, 523.25, 0, 493.88, 392.00,
        329.63, 440, 587.33, 0, 523.25, 493.88, 392.00, 349.23
      ],
    },
  ];

  public nextTrack() {
    this.currentTrackIndex = (this.currentTrackIndex + 1) % this.tracks.length;
    if (this.isBgmPlaying && this.audioEngine === 'chiptune_synth') {
      this.stopBgm();
      this.startBgm();
    }
  }

  public getCurrentTrackName(): string {
    if (this.audioEngine === 'wav_pack') {
      if (this.selectedBgmTrack === 'neon_pulse') return 'BG Music 2: Neon Pulse (145 BPM - Synth)';
      if (this.selectedBgmTrack === 'cyber_funk') return 'BG Music 3: Midnight Funk (126 BPM - Retro Groove)';
      if (this.selectedBgmTrack === 'start_menu') return 'Start Menu: Calm Horizon (92 BPM - Mellow Ambient)';
      return 'BG Music 1: Cyber Odyssey (140 BPM - Chiptune)';
    }
    return this.tracks[this.currentTrackIndex].name;
  }

  private startSynthBgm(overrideTrackIndex?: number) {
    if (this.stepIntervalId !== null) {
      clearInterval(this.stepIntervalId);
      this.stepIntervalId = null;
    }
    const idx = overrideTrackIndex !== undefined ? overrideTrackIndex : this.currentTrackIndex;
    const track = this.tracks[idx] || this.tracks[0];
    this.bpm = track.bpm;
    const stepDurationMs = (60 / this.bpm / 4) * 1000;

    this.currentStep = 0;
    this.stepIntervalId = window.setInterval(() => {
      this.tickSequencer(idx);
    }, stepDurationMs);
  }

  private tickSequencer(activeTrackIndex: number = this.currentTrackIndex) {
    if (!this.ctx || !this.bgmGain || this.isMuted) return;
    const track = this.tracks[activeTrackIndex] || this.tracks[0];
    const step = this.currentStep % 16;
    const t = this.ctx.currentTime;

    const isAmbient = (track as any).isAmbient || activeTrackIndex === 3;

    // 1. Kick Drum (every 4 steps - disabled for simple ambient music)
    if (step % 4 === 0 && !isAmbient) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.frequency.setValueAtTime(140, t);
      osc.frequency.exponentialRampToValueAtTime(38, t + 0.08);

      gain.gain.setValueAtTime(0.55, t);
      gain.gain.linearRampToValueAtTime(0.001, t + 0.08);

      osc.connect(gain);
      gain.connect(this.bgmGain);
      osc.start(t);
      osc.stop(t + 0.08);
    }

    // 2. Snare / Noise Clap (beats 2 & 4 - disabled for simple ambient music)
    if ((step === 4 || step === 12) && this.noiseBuffer && !isAmbient) {
      const noise = this.ctx.createBufferSource();
      noise.buffer = this.noiseBuffer;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.3, t);
      gain.gain.linearRampToValueAtTime(0.001, t + 0.06);

      noise.connect(gain);
      gain.connect(this.bgmGain);
      noise.start(t);
      noise.stop(t + 0.06);
    }

    // 3. Hi-Hat (8th note cadence - disabled for simple ambient music)
    if (step % 2 === 1 && this.noiseBuffer && !isAmbient) {
      const noise = this.ctx.createBufferSource();
      noise.buffer = this.noiseBuffer;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.12, t);
      gain.gain.linearRampToValueAtTime(0.001, t + 0.02);

      noise.connect(gain);
      gain.connect(this.bgmGain);
      noise.start(t);
      noise.stop(t + 0.02);
    }

    // 4. Bass Line (Warm Triangle/Sine for ambient, Sawtooth for high-energy chiptune)
    const bassIdx = Math.floor(step / 2) % track.bassNotes.length;
    const bassFreq = track.bassNotes[bassIdx];
    if (step % 2 === 0) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = isAmbient ? 'triangle' : 'sawtooth';
      osc.frequency.setValueAtTime(bassFreq, t);

      const bassVol = isAmbient ? 0.20 : 0.25;
      gain.gain.setValueAtTime(bassVol, t);
      gain.gain.linearRampToValueAtTime(0.01, t + (isAmbient ? 0.28 : 0.1));

      osc.connect(gain);
      gain.connect(this.bgmGain);
      osc.start(t);
      osc.stop(t + (isAmbient ? 0.28 : 0.1));
    }

    // 5. Lead Melody (Soft pure Sine / Music Box chime for ambient, Square for 8-bit)
    const leadFreq = track.leadMelody[step];
    if (leadFreq > 0) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = isAmbient ? 'sine' : 'square';
      osc.frequency.setValueAtTime(leadFreq, t);

      const leadVol = isAmbient ? 0.14 : 0.18;
      gain.gain.setValueAtTime(leadVol, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + (isAmbient ? 0.35 : 0.08));

      osc.connect(gain);
      gain.connect(this.bgmGain);
      osc.start(t);
      osc.stop(t + (isAmbient ? 0.35 : 0.08));
    }

    this.currentStep++;
  }

  // --- COMPATIBILITY & HELPER METHODS ---

  public playGem() {
    this.playCoin();
  }

  public playHurt() {
    this.playHit();
  }

  public isPlaying(): boolean {
    return this.isBgmPlaying;
  }

  public toggleBgm(): boolean {
    if (this.isBgmPlaying) {
      this.stopBgm();
      return false;
    } else {
      this.startBgm();
      return true;
    }
  }

  public getTrackNames(): string[] {
    return [
      'BG Music 1: Cyber Odyssey (140 BPM - Chiptune)',
      'BG Music 2: Neon Pulse (145 BPM - Synth)',
      'BG Music 3: Midnight Funk (126 BPM - Retro Groove)',
      'Start Menu: Calm Horizon (92 BPM - Mellow Ambient)',
    ];
  }

  public setTrack(idx: number) {
    const trackMap: BgmTrackOption[] = ['cyber_odyssey', 'neon_pulse', 'cyber_funk', 'start_menu'];
    const track = trackMap[idx] || 'cyber_odyssey';
    this.setBgmTrack(track);
  }
}

export const sound = new SoundEngine();
