import { WeatherType, WeatherState, BiomeType } from './types';

export const WEATHER_CONFIGS: Record<WeatherType, {
  name: string;
  icon: string;
  badgeColor: string;
  description: string;
}> = {
  CLEAR: {
    name: 'CLEAR SKIES',
    icon: '✨',
    badgeColor: 'text-cyan-300 border-cyan-500/50 bg-cyan-950/60',
    description: 'Calm atmospheric pressure with gentle starlight shimmer.',
  },
  CYBER_RAIN: {
    name: 'CYBER RAIN',
    icon: '⚡',
    badgeColor: 'text-sky-300 border-sky-500/60 bg-sky-950/70',
    description: 'Neon-infused downpour with high-voltage lightning flashes.',
  },
  COSMIC_SNOW: {
    name: 'COSMIC SNOW',
    icon: '❄️',
    badgeColor: 'text-indigo-200 border-indigo-400/60 bg-indigo-950/70',
    description: 'Sub-zero crystalline flakes drifting with gravitational winds.',
  },
  EMBER_STORM: {
    name: 'EMBER STORM',
    icon: '🔥',
    badgeColor: 'text-amber-400 border-amber-500/60 bg-amber-950/70',
    description: 'Blazing thermal updrafts with rising volcanic ash and sparks.',
  },
  DATA_STREAM: {
    name: 'DATA STREAM',
    icon: '👾',
    badgeColor: 'text-emerald-400 border-emerald-500/60 bg-emerald-950/70',
    description: 'Matrix digital rain with cascading binary code fragments.',
  },
};

export function createInitialWeather(biome: BiomeType = 'CYBER_CITY', isEndless = false): WeatherState {
  let initialType: WeatherType = 'CYBER_RAIN';

  if (!isEndless) {
    if (biome === 'VOLCANIC_CORE') initialType = 'EMBER_STORM';
    else if (biome === 'CRYSTAL_CAVERN') initialType = 'COSMIC_SNOW';
    else if (biome === 'STARLIGHT_CITADEL') initialType = 'DATA_STREAM';
    else initialType = 'CYBER_RAIN';
  } else {
    // Endless can start with rain
    initialType = 'CYBER_RAIN';
  }

  const config = WEATHER_CONFIGS[initialType];

  return {
    type: initialType,
    intensity: 1.0,
    targetIntensity: 1.0,
    timer: 35, // 35 seconds per weather phase
    duration: 35,
    bannerTimer: 3.5,
    bannerText: `${config.icon} ATMOSPHERE: ${config.name}`,
    lightningTimer: Math.random() * 6 + 4,
    lightningAlpha: 0,
  };
}

export function updateWeather(
  weather: WeatherState,
  dt: number,
  biome: BiomeType,
  isEndless: boolean
): WeatherState {
  weather.timer -= dt;
  if (weather.bannerTimer > 0) {
    weather.bannerTimer -= dt;
  }

  // Handle Lightning for CYBER_RAIN
  if (weather.type === 'CYBER_RAIN') {
    weather.lightningTimer -= dt;
    if (weather.lightningTimer <= 0) {
      weather.lightningAlpha = 0.55;
      weather.lightningTimer = 6 + Math.random() * 9;
    }
  }

  // Decay lightning flash
  if (weather.lightningAlpha > 0) {
    weather.lightningAlpha = Math.max(0, weather.lightningAlpha - dt * 2.8);
  }

  // Smooth intensity transition
  if (weather.intensity < weather.targetIntensity) {
    weather.intensity = Math.min(weather.targetIntensity, weather.intensity + dt * 0.8);
  } else if (weather.intensity > weather.targetIntensity) {
    weather.intensity = Math.max(weather.targetIntensity, weather.intensity - dt * 0.8);
  }

  // When timer expires, transition to a new weather!
  if (weather.timer <= 0) {
    const nextType = getNextWeatherType(weather.type, biome, isEndless);
    const config = WEATHER_CONFIGS[nextType];

    weather.type = nextType;
    weather.timer = 32 + Math.random() * 12; // 32 to 44 seconds
    weather.duration = weather.timer;
    weather.intensity = 0.2;
    weather.targetIntensity = 1.0;
    weather.bannerTimer = 3.5;
    weather.bannerText = `${config.icon} WEATHER SHIFT: ${config.name}`;
    weather.lightningTimer = 4 + Math.random() * 5;
  }

  return weather;
}

function getNextWeatherType(current: WeatherType, biome: BiomeType, isEndless: boolean): WeatherType {
  const allTypes: WeatherType[] = ['CYBER_RAIN', 'COSMIC_SNOW', 'EMBER_STORM', 'DATA_STREAM', 'CLEAR'];

  if (isEndless) {
    const candidates = allTypes.filter(t => t !== current);
    return candidates[Math.floor(Math.random() * candidates.length)];
  }

  // Biome-specific tailored cycles
  let pool: WeatherType[] = [];
  if (biome === 'VOLCANIC_CORE') {
    pool = ['EMBER_STORM', 'CLEAR', 'EMBER_STORM', 'DATA_STREAM'];
  } else if (biome === 'CRYSTAL_CAVERN') {
    pool = ['COSMIC_SNOW', 'CLEAR', 'CYBER_RAIN', 'COSMIC_SNOW'];
  } else if (biome === 'STARLIGHT_CITADEL') {
    pool = ['DATA_STREAM', 'COSMIC_SNOW', 'CLEAR', 'CYBER_RAIN'];
  } else {
    // CYBER_CITY
    pool = ['CYBER_RAIN', 'DATA_STREAM', 'CLEAR', 'COSMIC_SNOW'];
  }

  const valid = pool.filter(t => t !== current);
  return valid.length > 0 ? valid[Math.floor(Math.random() * valid.length)] : 'CYBER_RAIN';
}
