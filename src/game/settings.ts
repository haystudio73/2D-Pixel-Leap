/**
 * Settings Management System for Pixel Leap
 * Includes hardware optimization, graphics scaling, audio preferences, and controls.
 * Persisted in localStorage.
 */

export type FpsTarget = 30 | 60 | 120 | 0; // 0 = Uncapped
export type ParticleQuality = 'low' | 'medium' | 'high' | 'ultra';
export type WeatherQuality = 'off' | 'low' | 'full';
export type ScanlineMode = 'off' | 'subtle' | 'retro';
export type ScreenShakeMode = 'off' | 'mild' | 'full';
export type ParallaxQuality = 'simple' | 'medium' | 'full';
export type ResolutionScale = 0.75 | 1.0 | 1.25;
export type AudioEngineMode = 'wav_pack' | 'chiptune_synth';
export type BgmTrackOption = 'cyber_odyssey' | 'neon_pulse' | 'cyber_funk' | 'start_menu' | 'auto';
export type TouchControlsMode = 'auto' | 'always' | 'never';

export type GpuMode = 'high-performance' | 'power-saving' | 'software';

export interface GameSettings {
  version: number;
  
  // Hardware & Graphics Optimization
  fpsTarget: FpsTarget;
  particleQuality: ParticleQuality;
  weatherQuality: WeatherQuality;
  scanlineMode: ScanlineMode;
  screenShake: ScreenShakeMode;
  parallaxQuality: ParallaxQuality;
  resolutionScale: ResolutionScale;
  lowPowerMode: boolean;
  ghostTrailsEnabled: boolean;
  showFpsCounter: boolean;
  gpuAcceleration: boolean;
  gpuMode: GpuMode;

  // Audio System
  isMuted: boolean;
  masterVolume: number; // 0.0 to 1.0
  musicVolume: number;  // 0.0 to 1.0
  sfxVolume: number;    // 0.0 to 1.0
  audioEngine: AudioEngineMode;
  selectedBgmTrack: BgmTrackOption;
  menuMusicEnabled: boolean;

  // Controls & Accessibility
  touchControlsMode: TouchControlsMode;
  jumpBuffering: boolean;
  hapticFeedback: boolean;
}

export const DEFAULT_SETTINGS: GameSettings = {
  version: 1,

  // Hardware & Graphics Optimization Defaults
  fpsTarget: 60,
  particleQuality: 'high',
  weatherQuality: 'full',
  scanlineMode: 'subtle',
  screenShake: 'full',
  parallaxQuality: 'full',
  resolutionScale: 1.0,
  lowPowerMode: false,
  ghostTrailsEnabled: true,
  showFpsCounter: false,
  gpuAcceleration: true,
  gpuMode: 'high-performance',

  // Audio Defaults
  isMuted: false,
  masterVolume: 0.8,
  musicVolume: 0.65,
  sfxVolume: 0.8,
  audioEngine: 'wav_pack',
  selectedBgmTrack: 'cyber_odyssey',
  menuMusicEnabled: true,

  // Controls & Accessibility
  touchControlsMode: 'auto',
  jumpBuffering: true,
  hapticFeedback: true,
};

const SETTINGS_STORAGE_KEY = 'pixel_leap_settings_v1';

// Active in-memory settings
let currentSettings: GameSettings = loadSettings();
const listeners = new Set<(settings: GameSettings) => void>();

/**
 * Load settings from localStorage with fallback to defaults
 */
export function loadSettings(): GameSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };

    const parsed = JSON.parse(raw);
    // Merge with defaults so new fields are always populated
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
    };
  } catch (err) {
    console.warn('[Settings] Failed to load settings from localStorage, using defaults:', err);
    return { ...DEFAULT_SETTINGS };
  }
}

/**
 * Save settings to localStorage and notify subscribers
 */
export function saveSettings(newSettings: Partial<GameSettings>): GameSettings {
  currentSettings = {
    ...currentSettings,
    ...newSettings,
  };

  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(currentSettings));
  } catch (err) {
    console.error('[Settings] Failed to save settings to localStorage:', err);
  }

  listeners.forEach((fn) => fn(currentSettings));
  return currentSettings;
}

/**
 * Reset all settings back to default values
 */
export function resetSettings(): GameSettings {
  currentSettings = { ...DEFAULT_SETTINGS };
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(currentSettings));
  } catch (err) {
    console.error('[Settings] Failed to reset settings in localStorage:', err);
  }
  listeners.forEach((fn) => fn(currentSettings));
  return currentSettings;
}

/**
 * Apply a predefined hardware optimization profile
 */
export function applyOptimizationPreset(preset: 'battery' | 'performance' | 'balanced' | 'ultra'): GameSettings {
  switch (preset) {
    case 'battery':
      return saveSettings({
        fpsTarget: 30,
        particleQuality: 'low',
        weatherQuality: 'off',
        scanlineMode: 'off',
        screenShake: 'off',
        parallaxQuality: 'simple',
        resolutionScale: 0.75,
        lowPowerMode: true,
        ghostTrailsEnabled: false,
      });

    case 'performance':
      return saveSettings({
        fpsTarget: 60,
        particleQuality: 'medium',
        weatherQuality: 'low',
        scanlineMode: 'off',
        screenShake: 'mild',
        parallaxQuality: 'medium',
        resolutionScale: 1.0,
        lowPowerMode: false,
        ghostTrailsEnabled: true,
      });

    case 'balanced':
      return saveSettings({
        fpsTarget: 60,
        particleQuality: 'high',
        weatherQuality: 'full',
        scanlineMode: 'subtle',
        screenShake: 'full',
        parallaxQuality: 'full',
        resolutionScale: 1.0,
        lowPowerMode: false,
        ghostTrailsEnabled: true,
      });

    case 'ultra':
      return saveSettings({
        fpsTarget: 120,
        particleQuality: 'ultra',
        weatherQuality: 'full',
        scanlineMode: 'retro',
        screenShake: 'full',
        parallaxQuality: 'full',
        resolutionScale: 1.25,
        lowPowerMode: false,
        ghostTrailsEnabled: true,
        showFpsCounter: true,
      });
  }
}

/**
 * Get current settings snapshot
 */
export function getSettings(): GameSettings {
  return currentSettings;
}

/**
 * Subscribe to settings updates
 */
export function subscribeSettings(callback: (settings: GameSettings) => void): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

export interface GpuInfo {
  renderer: string;
  vendor: string;
  supported: boolean;
}

/**
 * Detect GPU hardware device model and vendor for hardware acceleration
 */
export function detectGpuHardware(): GpuInfo {
  if (typeof document === 'undefined') {
    return { renderer: 'Default Hardware GPU', vendor: 'GPU Device', supported: true };
  }
  try {
    const canvas = document.createElement('canvas');
    const gl = (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;
    if (gl) {
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
        return {
          renderer: typeof renderer === 'string' && renderer.length > 0 ? renderer : 'Hardware Accelerated GPU',
          vendor: typeof vendor === 'string' && vendor.length > 0 ? vendor : 'Graphics Device',
          supported: true,
        };
      }
    }
  } catch (e) {
    console.warn('[Settings] WebGL GPU detection failed:', e);
  }
  return { renderer: 'Direct3D / Metal / Vulkan Hardware Layer', vendor: 'Standard GPU', supported: true };
}
