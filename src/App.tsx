/**
 * Pixel Leap: Retro 2D Platformer
 * 2D Jump Game with Authentic Pixel Art Platformer Physics,
 * Scrolling Parallax Backgrounds, Limitless Procedural Generation,
 * Dynamic Atmospheric Weather System (Cyber Rain, Cosmic Snow, Ember Storm, Data Stream),
 * Character Customization Roster (7 Unlockable Pixel-Art Heroes),
 * Glowing Power-Ups & Skills, Studio WAV Audio Pack & Rhythmic Chiptune Synthesizer,
 * Persistent LocalStorage Hardware Settings Management, and SQLite 3 Online Leaderboard.
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { 
  GameState, 
  GameMode, 
  Player, 
  Platform, 
  Collectible, 
  Enemy, 
  Checkpoint, 
  ExitPortal, 
  Particle, 
  FloatingText, 
  GhostTrail, 
  Camera, 
  InputState, 
  BiomeType,
  WeatherState 
} from './game/types';
import { sound } from './game/audio';
import { GameRenderer } from './game/renderer';
import { 
  createInitialPlayer, 
  updatePhysics, 
  PhysicsUpdateResult 
} from './game/physics';
import { 
  CAMPAIGN_LEVELS, 
  EndlessLevelState, 
  createInitialEndlessState, 
  updateEndlessLevel 
} from './game/levels';
import { getPersonalBest, updatePersonalBest } from './game/leaderboard';
import { 
  getSelectedCharacterId, 
  setSelectedCharacterId, 
  getMaxLevelCleared, 
  updateMaxLevelCleared 
} from './game/characters';
import { createInitialWeather, updateWeather } from './game/weather';
import { 
  getSettings, 
  subscribeSettings, 
  GameSettings 
} from './game/settings';

// UI Components
import { HUD } from './components/HUD';
import { TouchControls } from './components/TouchControls';
import { TitleScreen } from './components/TitleScreen';
import { LeaderboardModal } from './components/LeaderboardModal';
import { AudioSettingsModal } from './components/AudioSettingsModal';
import { SettingsModal } from './components/SettingsModal';
import { LevelSelectModal } from './components/LevelSelectModal';
import { GameOverModal } from './components/GameOverModal';
import { LevelClearModal } from './components/LevelClearModal';
import { PauseModal } from './components/PauseModal';
import { CharacterSelectModal } from './components/CharacterSelectModal';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rendererRef = useRef<GameRenderer | null>(null);

  // Settings state synced with LocalStorage
  const [settings, setSettings] = useState<GameSettings>(() => getSettings());
  const settingsRef = useRef<GameSettings>(settings);
  settingsRef.current = settings;

  // Real-time FPS monitor
  const [fpsCount, setFpsCount] = useState<number>(60);

  // High-level App State
  const [gameState, setGameState] = useState<GameState>('TITLE_MENU');
  const [gameMode, setGameMode] = useState<GameMode>('endless');
  const [currentLevelId, setCurrentLevelId] = useState<number>(1);
  const [personalBest, setPersonalBest] = useState<number>(() => getPersonalBest());
  const personalBestRef = useRef(personalBest);
  personalBestRef.current = personalBest;

  // Character Customization & Progression State
  const [selectedSkinId, setSelectedSkinId] = useState<string>(() => getSelectedCharacterId());
  const [maxLevelCleared, setMaxLevelCleared] = useState<number>(() => getMaxLevelCleared());
  const [showCharacterSelect, setShowCharacterSelect] = useState(false);

  // Modal overlays
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showAudioSettings, setShowAudioSettings] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showLevelSelect, setShowLevelSelect] = useState(false);
  const [highlightLeaderboardId, setHighlightLeaderboardId] = useState<string | undefined>();
  const [isMuted, setIsMuted] = useState(sound.isMuted);
  const [isMenuMusicPlaying, setIsMenuMusicPlaying] = useState(sound.isMenuBgmPlaying);

  // Active React HUD state synced periodically
  const [hudPlayer, setHudPlayer] = useState<Player>(() => {
    const p = createInitialPlayer();
    p.characterSkinId = getSelectedCharacterId();
    return p;
  });
  const [hudBiome, setHudBiome] = useState<BiomeType>('CYBER_CITY');
  const [titleStageBiome, setTitleStageBiome] = useState<BiomeType>('CYBER_CITY');
  const [hudLevelName, setHudLevelName] = useState('Endless');
  const [hudWeather, setHudWeather] = useState<WeatherState>(() => createInitialWeather('CYBER_CITY', true));

  // Mutable Game Simulation State (Ref-based for 60fps performance without React re-render overhead)
  const sim = useRef<{
    player: Player;
    platforms: Platform[];
    collectibles: Collectible[];
    enemies: Enemy[];
    checkpoints: Checkpoint[];
    portal: ExitPortal | null;
    particles: Particle[];
    floatingTexts: FloatingText[];
    ghostTrails: GhostTrail[];
    camera: Camera;
    input: InputState;
    endlessState: EndlessLevelState | null;
    currentBiome: BiomeType;
    weather: WeatherState;
    lastCheckpoint: { x: number; y: number } | null;
    lastTime: number;
    totalTime: number;
    hudSyncTimer: number;
  }>({
    player: (() => {
      const p = createInitialPlayer();
      p.characterSkinId = getSelectedCharacterId();
      return p;
    })(),
    platforms: [],
    collectibles: [],
    enemies: [],
    checkpoints: [],
    portal: null,
    particles: [],
    floatingTexts: [],
    ghostTrails: [],
    camera: { x: 0, y: 0, shake: 0, shakeDecay: 18 },
    input: {
      left: false,
      right: false,
      up: false,
      down: false,
      jump: false,
      jumpPressed: false,
      dash: false,
      dashPressed: false,
    },
    endlessState: null,
    currentBiome: 'CYBER_CITY',
    weather: createInitialWeather('CYBER_CITY', true),
    lastCheckpoint: null,
    lastTime: 0,
    totalTime: 0,
    hudSyncTimer: 0,
  });

  // Subscribe to LocalStorage settings updates
  useEffect(() => {
    return subscribeSettings((newSettings) => {
      setSettings({ ...newSettings });
      setIsMuted(newSettings.isMuted);
    });
  }, []);

  // Helper to load Campaign Stage
  const loadCampaignLevel = useCallback((levelId: number) => {
    const levelData = CAMPAIGN_LEVELS.find((l) => l.id === levelId) || CAMPAIGN_LEVELS[0];
    const s = sim.current;

    s.player = createInitialPlayer(levelData.playerStart.x, levelData.playerStart.y);
    s.player.characterSkinId = selectedSkinId;

    // Deep clone level assets so mutations don't dirty static data
    s.platforms = JSON.parse(JSON.stringify(levelData.platforms));
    s.collectibles = JSON.parse(JSON.stringify(levelData.collectibles));
    s.enemies = JSON.parse(JSON.stringify(levelData.enemies));
    s.checkpoints = JSON.parse(JSON.stringify(levelData.checkpoints));
    s.portal = JSON.parse(JSON.stringify(levelData.portal));
    s.particles = [];
    s.floatingTexts = [];
    s.ghostTrails = [];
    s.camera = { x: 0, y: 0, shake: 0, shakeDecay: 18 };
    s.currentBiome = levelData.biome;
    s.weather = createInitialWeather(levelData.biome, false);
    s.lastCheckpoint = { x: levelData.playerStart.x, y: levelData.playerStart.y };
    s.endlessState = null;

    setHudBiome(levelData.biome);
    setHudLevelName(levelData.name);
    setHudWeather({ ...s.weather });
    setCurrentLevelId(levelData.id);
  }, [selectedSkinId]);

  // Helper to load Endless Mode
  const loadEndlessMode = useCallback(() => {
    const s = sim.current;
    const endless = createInitialEndlessState();

    s.player = createInitialPlayer(80, 360);
    s.player.characterSkinId = selectedSkinId;
    s.platforms = endless.platforms;
    s.collectibles = endless.collectibles;
    s.enemies = endless.enemies;
    s.checkpoints = endless.checkpoints;
    s.portal = null;
    s.particles = [];
    s.floatingTexts = [];
    s.ghostTrails = [];
    s.camera = { x: 0, y: 0, shake: 0, shakeDecay: 18 };
    s.endlessState = endless;
    s.currentBiome = 'CYBER_CITY';
    s.weather = createInitialWeather('CYBER_CITY', true);
    s.lastCheckpoint = { x: 80, y: 360 };

    setHudBiome('CYBER_CITY');
    setHudLevelName('Endless Odyssey');
    setHudWeather({ ...s.weather });
  }, [selectedSkinId]);

  // Helper to load pure drifting stage (cảnh trôi) for Title Screen
  const loadTitleStage = useCallback((biome?: BiomeType) => {
    const s = sim.current;
    const targetBiome = biome || titleStageBiome;
    const endless = createInitialEndlessState();
    endless.currentBiome = targetBiome;

    s.player = createInitialPlayer(80, 360);
    s.player.characterSkinId = selectedSkinId;
    s.platforms = endless.platforms;
    s.collectibles = [];
    s.enemies = [];
    s.checkpoints = [];
    s.portal = null;
    s.particles = [];
    s.floatingTexts = [];
    s.ghostTrails = [];
    s.camera = { x: 0, y: 190, shake: 0, shakeDecay: 18 };
    s.endlessState = endless;
    s.currentBiome = targetBiome;
    s.weather = createInitialWeather(targetBiome, true);
    if (biome) {
      setTitleStageBiome(biome);
    }
  }, [selectedSkinId, titleStageBiome]);

  // Handle Character Skin Selection
  const handleSelectSkin = useCallback((newSkinId: string) => {
    setSelectedSkinId(newSkinId);
    setSelectedCharacterId(newSkinId);
    sim.current.player.characterSkinId = newSkinId;
    setHudPlayer((prev) => ({ ...prev, characterSkinId: newSkinId }));
  }, []);

  // Initialize Canvas & Renderer on mount & on resolution scale changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const updateCanvasSize = () => {
      const container = canvas.parentElement;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const baseWidth = Math.min(1080, Math.max(640, Math.floor(rect.width)));
      const baseHeight = Math.floor(baseWidth * 0.5625); // 16:9 ratio

      // Apply resolution scale from hardware settings
      const scale = settings.resolutionScale || 1.0;
      canvas.width = Math.floor(baseWidth * scale);
      canvas.height = Math.floor(baseHeight * scale);
      rendererRef.current = new GameRenderer(canvas);
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    // Initial scenic drifting stage (cảnh trôi) on Title Screen
    loadTitleStage();

    return () => {
      window.removeEventListener('resize', updateCanvasSize);
    };
  }, [loadTitleStage, settings.resolutionScale]);

  // Keyboard Input Handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === 'INPUT') return;

      const inp = sim.current.input;

      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        inp.left = true;
      } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        inp.right = true;
      } else if (e.code === 'ArrowUp' || e.code === 'KeyW' || e.code === 'Space') {
        if (!inp.jump) {
          inp.jumpPressed = true;
        }
        inp.jump = true;
        e.preventDefault();
      } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        inp.down = true;
      } else if (e.code === 'ShiftLeft' || e.code === 'ShiftRight' || e.code === 'KeyX' || e.code === 'KeyJ') {
        if (!inp.dash) {
          inp.dashPressed = true;
        }
        inp.dash = true;
      } else if (e.code === 'KeyC') {
        // Quick toggle Character Customization Screen
        setShowCharacterSelect((prev) => !prev);
      } else if (e.code === 'KeyO') {
        // Quick toggle System & Hardware Settings
        setShowSettings((prev) => !prev);
      } else if (e.code === 'Escape' || e.code === 'KeyP') {
        if (gameState === 'PLAYING') {
          setGameState('PAUSED');
        } else if (gameState === 'PAUSED') {
          setGameState('PLAYING');
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === 'INPUT') return;

      const inp = sim.current.input;
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        inp.left = false;
      } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        inp.right = false;
      } else if (e.code === 'ArrowUp' || e.code === 'KeyW' || e.code === 'Space') {
        inp.jump = false;
        inp.jumpPressed = false;
      } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        inp.down = false;
      } else if (e.code === 'ShiftLeft' || e.code === 'ShiftRight' || e.code === 'KeyX' || e.code === 'KeyJ') {
        inp.dash = false;
        inp.dashPressed = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState]);

  // Touch Input Controls for Mobile
  const handleTouchInputDown = (key: keyof InputState) => {
    const inp = sim.current.input;
    if (key === 'jump') {
      inp.jump = true;
      inp.jumpPressed = true;
    } else if (key === 'dash') {
      inp.dash = true;
      inp.dashPressed = true;
    } else {
      (inp as unknown as Record<string, boolean>)[key] = true;
    }
  };

  const handleTouchInputUp = (key: keyof InputState) => {
    const inp = sim.current.input;
    if (key === 'jump') {
      inp.jump = false;
      inp.jumpPressed = false;
    } else if (key === 'dash') {
      inp.dash = false;
      inp.dashPressed = false;
    } else {
      (inp as unknown as Record<string, boolean>)[key] = false;
    }
  };

  // Main Game Loop with Hardware FPS Throttling & Profiling
  useEffect(() => {
    let animId: number;
    let lastFrameTime = performance.now();
    let framesThisSecond = 0;
    let fpsTimer = performance.now();

    const gameLoop = (timestamp: number) => {
      animId = requestAnimationFrame(gameLoop);

      // Hardware FPS Limiter Check
      const targetFps = settingsRef.current.fpsTarget;
      if (targetFps > 0) {
        const minFrameInterval = 1000 / targetFps;
        if (timestamp - lastFrameTime < minFrameInterval - 1.5) {
          return; // Skip execution to maintain target framerate
        }
      }

      const elapsed = timestamp - lastFrameTime;
      lastFrameTime = timestamp;

      // Real-time FPS Monitor Counter
      framesThisSecond++;
      if (timestamp - fpsTimer >= 500) {
        setFpsCount(Math.round((framesThisSecond * 1000) / (timestamp - fpsTimer)));
        framesThisSecond = 0;
        fpsTimer = timestamp;
      }

      const s = sim.current;
      if (!s.lastTime) s.lastTime = timestamp;

      const rawDt = elapsed / 1000;
      const dt = Math.min(rawDt, 0.05);
      s.lastTime = timestamp;
      s.totalTime += dt;

      const isPlaying = gameState === 'PLAYING';
      const isTitleIdle = gameState === 'TITLE_MENU';

      if (isTitleIdle) {
        // SCENIC DRIFTING STAGE (CẢNH TRÔI) FOR INITIAL START SCREEN
        // The camera glides smoothly across the stage landscape
        const driftSpeed = 85;
        s.camera.x += driftSpeed * dt;
        s.camera.y = 190 + Math.sin(s.totalTime * 0.35) * 12;
        s.camera.shake = 0;

        // Update Dynamic Atmospheric Weather System for drifting stage
        updateWeather(s.weather, dt, s.currentBiome, true);

        // Procedurally generate endless stage platforms ahead of the drifting camera
        if (s.endlessState) {
          updateEndlessLevel(s.endlessState, s.camera.x + 650);
          s.platforms = s.endlessState.platforms;
          s.currentBiome = s.endlessState.currentBiome;
        }
      } else if (isPlaying) {
        // ACTIVE GAMEPLAY LOOP
        // Update Dynamic Atmospheric Weather System
        updateWeather(s.weather, dt, s.currentBiome, !!s.endlessState);

        // Endless procedural generator progression
        if (s.endlessState) {
          updateEndlessLevel(s.endlessState, s.player.x);
          s.platforms = s.endlessState.platforms;
          s.collectibles = s.endlessState.collectibles;
          s.enemies = s.endlessState.enemies;
          s.checkpoints = s.endlessState.checkpoints;
          s.currentBiome = s.endlessState.currentBiome;
        }

        // Run platformer physics
        const physicsResult: PhysicsUpdateResult = updatePhysics(
          s.player,
          s.input,
          s.platforms,
          s.collectibles,
          s.enemies,
          s.checkpoints,
          s.portal,
          s.particles,
          s.floatingTexts,
          s.ghostTrails,
          dt,
          !!s.endlessState,
          s.camera
        );

        s.input.jumpPressed = false;
        s.input.dashPressed = false;

        // Handle Checkpoint
        if (physicsResult.reachedCheckpoint) {
          s.lastCheckpoint = { x: s.player.x, y: s.player.y };
        }

        // Handle Player Death
        if (physicsResult.playerDied && isPlaying) {
          setGameState('GAME_OVER');
          sound.stopBgm();
          if (s.player.score > personalBestRef.current) {
            updatePersonalBest(s.player.score);
            setPersonalBest(s.player.score);
          }
        }

        // Handle Level Completed (Campaign Mode)
        if (physicsResult.levelCompleted && isPlaying) {
          setGameState('LEVEL_CLEAR');
          updateMaxLevelCleared(currentLevelId);
          setMaxLevelCleared(getMaxLevelCleared());

          if (s.player.score > personalBestRef.current) {
            updatePersonalBest(s.player.score);
            setPersonalBest(s.player.score);
          }
        }

        // Update Ghost Trails
        for (let i = s.ghostTrails.length - 1; i >= 0; i--) {
          s.ghostTrails[i].alpha -= dt * 3.5;
          if (s.ghostTrails[i].alpha <= 0) {
            s.ghostTrails.splice(i, 1);
          }
        }

        // Update Particles
        for (let i = s.particles.length - 1; i >= 0; i--) {
          const p = s.particles[i];
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.life += dt;
          if (p.life >= p.maxLife) {
            s.particles.splice(i, 1);
          }
        }

        // Update Floating Texts
        for (let i = s.floatingTexts.length - 1; i >= 0; i--) {
          const ft = s.floatingTexts[i];
          ft.y += ft.vy * dt;
          ft.life += dt;
          ft.alpha = Math.max(0, 1 - ft.life / 0.85);
          if (ft.life >= 0.85) {
            s.floatingTexts.splice(i, 1);
          }
        }

        // Camera Follow with Look-ahead
        const canvas = canvasRef.current;
        if (canvas) {
          const targetCamX = s.player.x - canvas.width * 0.35;
          const targetCamY = s.player.y - canvas.height * 0.55;

          s.camera.x += (targetCamX - s.camera.x) * 8 * dt;
          s.camera.y += (targetCamY - s.camera.y) * 6 * dt;

          if (s.camera.shake > 0) {
            s.camera.shake = Math.max(0, s.camera.shake - s.camera.shakeDecay * dt);
          }
        }

        // Periodic HUD state sync (every ~80ms)
        s.hudSyncTimer += dt;
        if (s.hudSyncTimer >= 0.08 && isPlaying) {
          s.hudSyncTimer = 0;
          setHudPlayer({ ...s.player });
          setHudBiome(s.currentBiome);
          setHudWeather({ ...s.weather });
        }
      }

      // Render World, Parallax, Characters & Weather
      if (rendererRef.current && canvasRef.current) {
        rendererRef.current.render(
          s.player,
          s.platforms,
          s.collectibles,
          s.enemies,
          s.checkpoints,
          s.portal,
          s.particles,
          s.floatingTexts,
          s.ghostTrails,
          s.camera,
          s.currentBiome,
          !!s.endlessState,
          s.totalTime,
          s.weather,
          dt,
          isTitleIdle // stageOnly: true on initial/title screen (cảnh trôi stage)
        );
      }
    };

    animId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animId);
  }, [gameState, currentLevelId]);

  // Unlock and play Start Menu BGM on user gesture when on TITLE_MENU
  useEffect(() => {
    let triggered = false;
    const handleFirstGesture = () => {
      if (triggered) return;
      triggered = true;
      sound.init();
      if (gameState === 'TITLE_MENU' && sound.menuMusicEnabled && !sound.isMuted) {
        sound.startMenuBgm();
        setIsMenuMusicPlaying(true);
      }
    };

    window.addEventListener('click', handleFirstGesture, { once: true, passive: true });
    window.addEventListener('keydown', handleFirstGesture, { once: true, passive: true });
    window.addEventListener('touchstart', handleFirstGesture, { once: true, passive: true });

    return () => {
      window.removeEventListener('click', handleFirstGesture);
      window.removeEventListener('keydown', handleFirstGesture);
      window.removeEventListener('touchstart', handleFirstGesture);
    };
  }, [gameState]);

  // Toggle Start Menu BGM
  const handleToggleMenuMusic = () => {
    sound.init();
    const next = !isMenuMusicPlaying;
    sound.setMenuMusicEnabled(next);
    setIsMenuMusicPlaying(next);
  };

  // Start Endless Mode
  const handleStartEndless = () => {
    sound.init();
    sound.stopMenuBgm();
    setIsMenuMusicPlaying(false);
    setGameMode('endless');
    loadEndlessMode();
    setGameState('PLAYING');
    sound.startBgm();
  };

  // Start Campaign Mode
  const handleStartCampaignLevel = (lvlId: number) => {
    sound.init();
    sound.stopMenuBgm();
    setIsMenuMusicPlaying(false);
    setGameMode('campaign');
    loadCampaignLevel(lvlId);
    setShowLevelSelect(false);
    setGameState('PLAYING');
    sound.startBgm();
  };

  // Restart Current Stage
  const handleRestart = () => {
    sound.init();
    sound.stopMenuBgm();
    setIsMenuMusicPlaying(false);
    if (gameMode === 'endless') {
      loadEndlessMode();
    } else {
      loadCampaignLevel(currentLevelId);
    }
    setGameState('PLAYING');
    sound.startBgm();
  };

  // Next Campaign Level
  const handleNextLevel = () => {
    const nextId = currentLevelId + 1;
    if (CAMPAIGN_LEVELS.some((l) => l.id === nextId)) {
      loadCampaignLevel(nextId);
      setGameState('PLAYING');
    } else {
      setShowLeaderboard(true);
      loadTitleStage();
      setGameState('TITLE_MENU');
      sound.stopBgm();
      if (sound.menuMusicEnabled && !sound.isMuted) {
        sound.startMenuBgm();
        setIsMenuMusicPlaying(true);
      }
    }
  };

  // Toggle Sound Mute
  const handleToggleMute = () => {
    const next = !isMuted;
    sound.setMuted(next);
    setIsMuted(next);
  };

  // Touch controls visibility check based on hardware settings
  const shouldShowTouch = 
    settings.touchControlsMode === 'always' || 
    (settings.touchControlsMode === 'auto' && (typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0)));

  return (
    <div className="relative w-screen h-screen bg-black overflow-hidden flex items-center justify-center select-none font-sans">
      {/* Game Canvas Container */}
      <div className="relative w-full h-full max-w-[1920px] max-h-[1080px] flex items-center justify-center">
        <canvas
          ref={canvasRef}
          className="w-full h-full object-contain pixelated cursor-default shadow-2xl bg-neutral-950"
        />

        {/* CRT Scanline & Retro Phosphor Overlay (Hardware Settings Controlled) */}
        {settings.scanlineMode === 'retro' && (
          <div className="absolute inset-0 crt-scanlines pointer-events-none z-10" />
        )}
        {settings.scanlineMode === 'subtle' && (
          <div className="absolute inset-0 crt-scanlines-subtle pointer-events-none z-10" />
        )}

        {/* HUD (Active during PLAYING or PAUSED) */}
        {gameState === 'PLAYING' && (
          <>
            <HUD
              player={hudPlayer}
              biome={hudBiome}
              levelName={hudLevelName}
              isEndless={gameMode === 'endless'}
              personalBest={personalBest}
              isMuted={isMuted}
              weather={hudWeather}
              characterSkinId={selectedSkinId}
              fps={fpsCount}
              showFpsCounter={settings.showFpsCounter}
              onToggleMute={handleToggleMute}
              onPause={() => setGameState('PAUSED')}
              onOpenAudioSettings={() => setShowSettings(true)}
              onOpenSettings={() => setShowSettings(true)}
              onOpenCharacterSelect={() => setShowCharacterSelect(true)}
            />
            {/* Mobile Touch Virtual Gamepad */}
            {shouldShowTouch && (
              <TouchControls
                onInputDown={handleTouchInputDown}
                onInputUp={handleTouchInputUp}
              />
            )}
          </>
        )}

        {/* Title Screen */}
        {gameState === 'TITLE_MENU' && (
          <TitleScreen
            onStartEndless={handleStartEndless}
            onOpenLevelSelect={() => setShowLevelSelect(true)}
            onOpenLeaderboard={() => setShowLeaderboard(true)}
            onOpenAudioSettings={() => setShowSettings(true)}
            onOpenSettings={() => setShowSettings(true)}
            onOpenCharacterSelect={() => setShowCharacterSelect(true)}
            personalBest={personalBest}
            activeBiome={titleStageBiome}
            onSelectBiome={(biome) => loadTitleStage(biome)}
            isMenuMusicPlaying={isMenuMusicPlaying}
            onToggleMenuMusic={handleToggleMenuMusic}
          />
        )}

        {/* Pause Modal */}
        {gameState === 'PAUSED' && (
          <PauseModal
            onResume={() => setGameState('PLAYING')}
            onRestart={handleRestart}
            onOpenAudioSettings={() => setShowSettings(true)}
            onOpenSettings={() => setShowSettings(true)}
            onOpenLeaderboard={() => setShowLeaderboard(true)}
            onOpenCharacterSelect={() => setShowCharacterSelect(true)}
            onBackToMenu={() => {
              loadTitleStage();
              setGameState('TITLE_MENU');
              sound.stopBgm();
              if (sound.menuMusicEnabled && !sound.isMuted) {
                sound.startMenuBgm();
                setIsMenuMusicPlaying(true);
              }
            }}
          />
        )}

        {/* Game Over Modal */}
        {gameState === 'GAME_OVER' && (
          <GameOverModal
            player={sim.current.player}
            mode={gameMode}
            levelId={currentLevelId}
            onRestart={handleRestart}
            onOpenLeaderboard={(id) => {
              setHighlightLeaderboardId(id);
              setShowLeaderboard(true);
            }}
            onOpenCharacterSelect={() => setShowCharacterSelect(true)}
            onBackToMenu={() => {
              loadTitleStage();
              setGameState('TITLE_MENU');
              sound.stopBgm();
              if (sound.menuMusicEnabled && !sound.isMuted) {
                sound.startMenuBgm();
                setIsMenuMusicPlaying(true);
              }
            }}
          />
        )}

        {/* Level Clear Modal */}
        {gameState === 'LEVEL_CLEAR' && (
          <LevelClearModal
            player={sim.current.player}
            levelId={currentLevelId}
            onNextLevel={handleNextLevel}
            onRestartLevel={handleRestart}
            onOpenLeaderboard={() => setShowLeaderboard(true)}
            onOpenCharacterSelect={() => setShowCharacterSelect(true)}
            hasNextLevel={CAMPAIGN_LEVELS.some((l) => l.id === currentLevelId + 1)}
          />
        )}

        {/* Character Customization Modal */}
        <CharacterSelectModal
          isOpen={showCharacterSelect}
          onClose={() => setShowCharacterSelect(false)}
          selectedSkinId={selectedSkinId}
          onSelectSkin={handleSelectSkin}
          highScore={personalBest}
          maxLevelCleared={maxLevelCleared}
        />

        {/* Level Select Modal */}
        {showLevelSelect && (
          <LevelSelectModal
            onClose={() => setShowLevelSelect(false)}
            onSelectLevel={handleStartCampaignLevel}
            activeBiome={titleStageBiome}
            onPreviewBiome={(biome) => loadTitleStage(biome)}
          />
        )}

        {/* High Scores Online Leaderboard Modal (SQLite Powered) */}
        {showLeaderboard && (
          <LeaderboardModal
            onClose={() => {
              setShowLeaderboard(false);
              setHighlightLeaderboardId(undefined);
            }}
            highlightId={highlightLeaderboardId}
          />
        )}

        {/* Audio & Soundtrack Quick Settings Modal */}
        {showAudioSettings && (
          <AudioSettingsModal
            onClose={() => {
              setShowAudioSettings(false);
              setIsMuted(sound.isMuted);
            }}
          />
        )}

        {/* Comprehensive Hardware & Systems Settings Modal */}
        {showSettings && (
          <SettingsModal
            onClose={() => {
              setShowSettings(false);
              setIsMuted(sound.isMuted);
            }}
          />
        )}
      </div>
    </div>
  );
}
