import { 
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
  BiomeType, 
  PowerUpType,
  WeatherState,
  WeatherParticle
} from './types';
import { getCharacterById, CharacterConfig } from './characters';
import { getSettings } from './settings';

export class GameRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  // Starfield for background
  private stars: { x: number; y: number; size: number; alpha: number; speed: number }[] = [];

  // Weather particles system
  private weatherParticles: WeatherParticle[] = [];
  private rainSplashes: { x: number; y: number; radius: number; maxRadius: number; alpha: number }[] = [];

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false })!;
    this.initStars();
    this.initWeatherParticles();
  }

  private initStars() {
    this.stars = [];
    for (let i = 0; i < 80; i++) {
      this.stars.push({
        x: Math.random() * 2000,
        y: Math.random() * 600,
        size: Math.random() > 0.8 ? 2 : 1,
        alpha: 0.3 + Math.random() * 0.7,
        speed: 0.05 + Math.random() * 0.1,
      });
    }
  }

  private initWeatherParticles() {
    this.weatherParticles = [];
    for (let i = 0; i < 140; i++) {
      this.weatherParticles.push({
        x: Math.random() * 1400,
        y: Math.random() * 900,
        vx: 0,
        vy: 0,
        size: Math.random() > 0.7 ? 3 : 2,
        alpha: Math.random() * 0.6 + 0.3,
        color: '#ffffff',
        length: 14 + Math.random() * 10,
        swayPhase: Math.random() * Math.PI * 2,
        splashTimer: 0,
      });
    }
  }

  public render(
    player: Player,
    platforms: Platform[],
    collectibles: Collectible[],
    enemies: Enemy[],
    checkpoints: Checkpoint[],
    portal: ExitPortal | null,
    particles: Particle[],
    floatingTexts: FloatingText[],
    ghostTrails: GhostTrail[],
    camera: Camera,
    biome: BiomeType,
    isEndless: boolean,
    totalTime: number,
    weather?: WeatherState,
    dt: number = 0.016,
    stageOnly: boolean = false
  ) {
    const ctx = this.ctx;
    const width = this.canvas.width;
    const height = this.canvas.height;
    const settings = getSettings();

    // Apply Camera Shake with hardware settings multiplier
    let camX = camera.x;
    let camY = camera.y;
    let shakeMult = 1.0;
    if (settings.screenShake === 'off' || stageOnly) shakeMult = 0;
    else if (settings.screenShake === 'mild') shakeMult = 0.5;

    if (camera.shake > 0 && shakeMult > 0) {
      camX += (Math.random() - 0.5) * camera.shake * shakeMult;
      camY += (Math.random() - 0.5) * camera.shake * shakeMult;
    }

    ctx.save();

    // 1. Render Multi-layer Parallax Background
    this.renderParallaxBackground(camX, camY, width, height, biome, totalTime);

    // 2. World Space Transformation
    ctx.translate(-Math.floor(camX), -Math.floor(camY));

    // 3. Render Platforms (Stage Terrain)
    this.renderPlatforms(platforms, biome, totalTime);

    // If stageOnly is active (e.g. Initial Start Screen / Cảnh trôi stage), skip gameplay entities
    if (!stageOnly) {
      // Render Ghost Trails (behind player) if enabled and not in low power mode
      if (settings.ghostTrailsEnabled && !settings.lowPowerMode) {
        this.renderGhostTrails(ghostTrails);
      }

      // Render Checkpoints
      this.renderCheckpoints(checkpoints, totalTime);

      // Render Exit Portal
      if (portal && !isEndless) {
        this.renderPortal(portal, totalTime);
      }

      // Render Enemies
      this.renderEnemies(enemies, totalTime);

      // Render Collectibles & Glowing Power-Ups
      this.renderCollectibles(collectibles, totalTime);

      // Render Player Sprite & Custom Character Skin
      this.renderPlayer(player, totalTime);

      // Render Particle System (optimized by particle settings)
      this.renderParticles(particles);

      // Render Floating Texts
      this.renderFloatingTexts(floatingTexts);
    }

    // World-space rain splashes on platforms
    if (weather && weather.type === 'CYBER_RAIN' && weather.intensity > 0.05 && settings.weatherQuality !== 'off') {
      this.renderWorldRainSplashes(ctx);
    }

    ctx.restore();

    // Dynamic Weather System Overlays (Screen-Space Canvas Layer)
    if (weather && settings.weatherQuality !== 'off') {
      this.renderWeatherOverlays(weather, camX, camY, width, height, totalTime, dt);
    }
  }

  // --- PARALLAX BACKGROUND SYSTEM (STAGE-SPECIFIC DESIGNS) ---
  private renderParallaxBackground(
    camX: number,
    camY: number,
    width: number,
    height: number,
    biome: BiomeType,
    totalTime: number
  ) {
    if (biome === 'CRYSTAL_CAVERN') {
      this.renderCrystalCavernBackground(camX, camY, width, height, totalTime);
    } else if (biome === 'VOLCANIC_CORE') {
      this.renderVolcanicCoreBackground(camX, camY, width, height, totalTime);
    } else if (biome === 'STARLIGHT_CITADEL') {
      this.renderStarlightCitadelBackground(camX, camY, width, height, totalTime);
    } else {
      // Stage 1 / Default: CYBER_CITY
      this.renderCyberCityBackground(camX, camY, width, height, totalTime);
    }
  }

  // ==========================================
  // STAGE 1: CYBER CITY / NEON DISTRICT
  // ==========================================
  private renderCyberCityBackground(
    camX: number,
    camY: number,
    width: number,
    height: number,
    totalTime: number
  ) {
    const ctx = this.ctx;

    // 1. Sky Gradient (Midnight Synthwave Navy/Violet)
    const sky = ctx.createLinearGradient(0, 0, 0, height);
    sky.addColorStop(0, '#060613');
    sky.addColorStop(0.5, '#120c2a');
    sky.addColorStop(1, '#271247');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, width, height);

    // 2. High-Tech Cyber Moon with Digital Reticle & Orbit Ring (Scroll: 0.02x)
    const moonX = ((width * 0.82 - camX * 0.02) % (width * 1.5) + width * 1.5) % (width * 1.5) - 40;
    const moonY = 85 - camY * 0.02;

    ctx.save();
    ctx.shadowBlur = 28;
    ctx.shadowColor = '#38bdf8';
    ctx.fillStyle = '#e0f2fe';
    ctx.beginPath();
    ctx.arc(moonX, moonY, 30, 0, Math.PI * 2);
    ctx.fill();

    // Geometric Digital Orbit Ring
    ctx.shadowBlur = 10;
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(moonX, moonY, 44, 0.4, Math.PI * 1.8);
    ctx.stroke();

    // Digital pixel core scanline
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(moonX - 22, moonY - 1, 44, 2);
    ctx.fillRect(moonX - 1, moonY - 22, 2, 44);
    ctx.restore();

    // 3. Pixel Stars
    ctx.fillStyle = '#ffffff';
    this.stars.forEach((star) => {
      const sx = ((star.x - camX * star.speed) % width + width) % width;
      const sy = ((star.y - camY * 0.03) % (height * 0.65) + height * 0.65) % (height * 0.65);
      const twinkle = Math.sin(totalTime * 3 + star.x) * 0.3 + 0.7;
      ctx.globalAlpha = star.alpha * twinkle;
      ctx.fillRect(Math.floor(sx), Math.floor(sy), star.size, star.size);
    });
    ctx.globalAlpha = 1.0;

    // 4. Layer 1: Distant Megalopolis Towers & Spires (Scroll: 0.12x)
    const distScroll = camX * 0.12;
    const towerWidth = 80;
    const towerOffset = -(distScroll % (towerWidth * 8));
    ctx.fillStyle = '#0e0e24';
    for (let i = -2; i < Math.ceil(width / towerWidth) + 4; i++) {
      const tx = towerOffset + i * towerWidth;
      const tH = 150 + ((i * 47) % 90);
      const ty = height - tH - 80;
      ctx.fillRect(tx, ty, towerWidth - 8, tH + 90);

      // Blinking Red Aircraft Beacon on tower spire
      const beaconOn = Math.sin(totalTime * 4 + i * 2) > 0;
      if (beaconOn) {
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(tx + (towerWidth - 8) / 2 - 2, ty - 8, 4, 8);
        ctx.fillRect(tx + (towerWidth - 8) / 2 - 1, ty - 12, 2, 4);
        ctx.fillStyle = '#0e0e24';
      }
    }

    // 5. Layer 2: Midground Cyberpunk Buildings & Billboards (Scroll: 0.32x)
    const midScroll = camX * 0.32;
    const bWidth = 72;
    const bOffset = -(midScroll % (bWidth * 6));
    const startY = height - 120;
    const billboardTexts = ['CYBER', 'NEON', 'RUN', '2084', 'LEAP', 'STAGE 01'];

    for (let i = -2; i < Math.ceil(width / bWidth) + 4; i++) {
      const bx = bOffset + i * bWidth;
      const bHeight = 100 + ((i * 39) % 75);
      const by = startY - bHeight;

      // Building Body
      ctx.fillStyle = '#111226';
      ctx.fillRect(bx, by, bWidth - 6, bHeight + 140);

      // Roof Antenna / Spire
      if (i % 2 === 0) {
        ctx.fillStyle = '#334155';
        ctx.fillRect(bx + 10, by - 16, 3, 16);
        ctx.fillRect(bx + 8, by - 20, 7, 4);
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(bx + 10, by - 22, 3, 2);
      }

      // Neon Holographic Billboards on select buildings
      if (i % 3 === 0) {
        const text = billboardTexts[Math.abs(i) % billboardTexts.length];
        const bbY = by + 12;
        ctx.fillStyle = 'rgba(6, 182, 212, 0.18)';
        ctx.fillRect(bx + 6, bbY, bWidth - 18, 18);
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 1;
        ctx.strokeRect(bx + 6, bbY, bWidth - 18, 18);

        ctx.save();
        ctx.font = '7px monospace';
        ctx.fillStyle = '#38bdf8';
        ctx.textAlign = 'center';
        ctx.fillText(text, bx + (bWidth - 6) / 2, bbY + 12);
        ctx.restore();
      }

      // Glowing Windows
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 2; c++) {
          if ((i + r + c) % 3 !== 0) {
            const wx = bx + 12 + c * 24;
            const wy = by + 34 + r * 20;
            const isPink = (i + r) % 2 === 0;
            ctx.fillStyle = isPink ? '#ec4899' : '#38bdf8';
            const flicker = Math.sin(totalTime * 2 + i * 5 + r) > 0.85 ? 0.25 : 0.85;
            ctx.globalAlpha = flicker * 0.5;
            ctx.fillRect(wx, wy, 8, 10);
          }
        }
      }
      ctx.globalAlpha = 1.0;
    }

    // Flying Cyber Speeders (Hovercars) cruising across the sky
    const speederY1 = 135 - camY * 0.05;
    const speederX1 = ((totalTime * 140 - camX * 0.25) % (width + 300) + width + 300) % (width + 300) - 150;
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(speederX1, speederY1, 14, 4);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(speederX1 - 4, speederY1 + 1, 4, 2); // Tail lights
    ctx.fillStyle = 'rgba(56, 189, 248, 0.3)';
    ctx.fillRect(speederX1 - 20, speederY1 + 1, 16, 2); // Light streak

    const speederY2 = 180 - camY * 0.06;
    const speederX2 = ((width + 200 - (totalTime * 95 + camX * 0.2)) % (width + 300) + width + 300) % (width + 300) - 150;
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(speederX2, speederY2, 12, 3);
    ctx.fillStyle = '#ec4899';
    ctx.fillRect(speederX2 + 12, speederY2 + 1, 3, 2);

    // 6. Layer 3: Retro Synthwave Horizon Perspective Grid (Scroll: 0.6x)
    this.renderHorizonMist(camX * 0.6, height, 'CYBER_CITY');
  }

  // ==========================================
  // STAGE 2: CRYSTAL CAVERN (SUBTERRANEAN BIOLUMINESCENCE)
  // ==========================================
  private renderCrystalCavernBackground(
    camX: number,
    camY: number,
    width: number,
    height: number,
    totalTime: number
  ) {
    const ctx = this.ctx;

    // 1. Subterranean Cavern Vault Sky Gradient
    const sky = ctx.createLinearGradient(0, 0, 0, height);
    sky.addColorStop(0, '#020b14');
    sky.addColorStop(0.4, '#041824');
    sky.addColorStop(0.8, '#082838');
    sky.addColorStop(1, '#0e3a4e');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, width, height);

    // 2. Cavern Ceiling Stalactites with Glowing Crystal Tips
    const ceilScroll = camX * 0.08;
    const stalactiteSpacing = 50;
    const ceilOffset = -(ceilScroll % stalactiteSpacing);
    ctx.fillStyle = '#06131c';
    for (let x = ceilOffset - 50; x < width + 50; x += stalactiteSpacing) {
      const idx = Math.floor((x + ceilScroll) / stalactiteSpacing);
      const tipH = 40 + ((Math.sin(idx * 2.7) + 1) * 35);
      
      // Jagged rock stalactite shape
      ctx.beginPath();
      ctx.moveTo(x - 20, 0);
      ctx.lineTo(x + stalactiteSpacing * 0.5, tipH);
      ctx.lineTo(x + stalactiteSpacing + 10, 0);
      ctx.closePath();
      ctx.fill();

      // Glowing crystal tip hanging down
      const tipGlow = Math.sin(totalTime * 2.5 + idx) * 0.3 + 0.7;
      ctx.fillStyle = idx % 2 === 0 ? '#34d399' : '#06b6d4';
      ctx.globalAlpha = tipGlow;
      ctx.beginPath();
      ctx.moveTo(x + stalactiteSpacing * 0.5 - 4, tipH - 12);
      ctx.lineTo(x + stalactiteSpacing * 0.5 + 4, tipH - 12);
      ctx.lineTo(x + stalactiteSpacing * 0.5, tipH + 8);
      ctx.closePath();
      ctx.fill();
    }

    // 3. Ancient Radiant Crystal Geode Heart (Subterranean Celestial)
    const geodeX = ((width * 0.75 - camX * 0.02) % (width * 1.5) + width * 1.5) % (width * 1.5) - 40;
    const geodeY = 95 - camY * 0.02;

    ctx.save();
    ctx.shadowBlur = 32;
    ctx.shadowColor = '#06b6d4';
    // Multi-faceted crystal diamond shape
    const geodePulse = Math.sin(totalTime * 2) * 3;
    const gSize = 28 + geodePulse;

    ctx.fillStyle = '#a7f3d0';
    ctx.beginPath();
    ctx.moveTo(geodeX, geodeY - gSize);
    ctx.lineTo(geodeX + gSize * 0.8, geodeY);
    ctx.lineTo(geodeX, geodeY + gSize * 1.2);
    ctx.lineTo(geodeX - gSize * 0.8, geodeY);
    ctx.closePath();
    ctx.fill();

    // Crystal refraction facets
    ctx.fillStyle = '#059669';
    ctx.beginPath();
    ctx.moveTo(geodeX, geodeY - gSize);
    ctx.lineTo(geodeX + gSize * 0.4, geodeY);
    ctx.lineTo(geodeX, geodeY + gSize * 1.2);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#67e8f9';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(geodeX - gSize * 0.8, geodeY);
    ctx.lineTo(geodeX + gSize * 0.8, geodeY);
    ctx.stroke();
    ctx.restore();

    // 4. Drifting Bioluminescent Cave Spores / Fireflies
    for (let i = 0; i < 24; i++) {
      const spX = ((i * 97 + totalTime * 15 - camX * 0.15) % width + width) % width;
      const spY = ((i * 43 - totalTime * 12 + Math.sin(totalTime + i) * 15 - camY * 0.05) % (height * 0.8) + height * 0.8) % (height * 0.8);
      const spSize = 2 + (i % 3);
      const spPulse = Math.sin(totalTime * 3 + i * 2) * 0.4 + 0.6;
      ctx.fillStyle = i % 2 === 0 ? '#34d399' : '#38bdf8';
      ctx.globalAlpha = spPulse * 0.8;
      ctx.fillRect(Math.floor(spX), Math.floor(spY), spSize, spSize);
    }
    ctx.globalAlpha = 1.0;

    // 5. Layer 1: Far Subterranean Cavern Arches & Massive Columns (Scroll: 0.14x)
    const farScroll = camX * 0.14;
    const archWidth = 180;
    const archOffset = -(farScroll % archWidth);
    ctx.fillStyle = '#071822';
    for (let x = archOffset - 100; x < width + 100; x += archWidth) {
      const idx = Math.floor((x + farScroll) / archWidth);
      const aH = 140 + ((idx * 31) % 60);
      ctx.beginPath();
      ctx.moveTo(x, height);
      ctx.lineTo(x + 25, height - aH);
      ctx.lineTo(x + archWidth * 0.5, height - aH - 45);
      ctx.lineTo(x + archWidth - 25, height - aH);
      ctx.lineTo(x + archWidth, height);
      ctx.closePath();
      ctx.fill();
    }

    // 6. Layer 2: Midground Crystalline Spire Field (Scroll: 0.32x)
    const midScroll = camX * 0.32;
    const clusterWidth = 85;
    const clusterOffset = -(midScroll % (clusterWidth * 5));

    for (let i = -2; i < Math.ceil(width / clusterWidth) + 3; i++) {
      const cx = clusterOffset + i * clusterWidth;
      const cHeight = 110 + ((i * 41) % 80);
      const cy = height - cHeight - 40;

      // Dark Rock Base
      ctx.fillStyle = '#0a1d28';
      ctx.fillRect(cx + 8, cy + cHeight * 0.4, clusterWidth - 16, cHeight * 0.6 + 40);

      // Main Crystal Spire (Faceted Hexagonal Gem)
      const crystalGlow = Math.sin(totalTime * 2 + i * 3) * 0.2 + 0.8;
      ctx.globalAlpha = crystalGlow;

      // Left Facet (darker teal)
      ctx.fillStyle = i % 2 === 0 ? '#047857' : '#0891b2';
      ctx.beginPath();
      ctx.moveTo(cx + 18, cy + cHeight * 0.6);
      ctx.lineTo(cx + clusterWidth * 0.45, cy);
      ctx.lineTo(cx + clusterWidth * 0.45, cy + cHeight);
      ctx.lineTo(cx + 18, cy + cHeight);
      ctx.closePath();
      ctx.fill();

      // Right Facet (bright emerald/cyan highlight)
      ctx.fillStyle = i % 2 === 0 ? '#34d399' : '#67e8f9';
      ctx.beginPath();
      ctx.moveTo(cx + clusterWidth * 0.45, cy);
      ctx.lineTo(cx + clusterWidth - 18, cy + cHeight * 0.55);
      ctx.lineTo(cx + clusterWidth - 18, cy + cHeight);
      ctx.lineTo(cx + clusterWidth * 0.45, cy + cHeight);
      ctx.closePath();
      ctx.fill();

      // Crystal Center Ridge
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx + clusterWidth * 0.45, cy);
      ctx.lineTo(cx + clusterWidth * 0.45, cy + cHeight);
      ctx.stroke();

      ctx.restore();
    }

    // 7. Layer 3: Subterranean Glowing Mineral Pool & Cavern Mist (Scroll: 0.6x)
    this.renderHorizonMist(camX * 0.6, height, 'CRYSTAL_CAVERN');
  }

  // ==========================================
  // STAGE 3: VOLCANIC CORE (MAGMA FOUNDRY)
  // ==========================================
  private renderVolcanicCoreBackground(
    camX: number,
    camY: number,
    width: number,
    height: number,
    totalTime: number
  ) {
    const ctx = this.ctx;

    // 1. Fiery Apocalyptic Crimson Sky Gradient
    const sky = ctx.createLinearGradient(0, 0, 0, height);
    sky.addColorStop(0, '#1a0303');
    sky.addColorStop(0.4, '#310808');
    sky.addColorStop(0.8, '#4e1108');
    sky.addColorStop(1, '#691807');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, width, height);

    // 2. Burning Eclipsed Blood Moon with Flare Corona (Scroll: 0.02x)
    const bloodMoonX = ((width * 0.78 - camX * 0.02) % (width * 1.5) + width * 1.5) % (width * 1.5) - 40;
    const bloodMoonY = 85 - camY * 0.02;

    ctx.save();
    ctx.shadowBlur = 34;
    ctx.shadowColor = '#ef4444';

    // Outer molten corona
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.arc(bloodMoonX, bloodMoonY, 34, 0, Math.PI * 2);
    ctx.fill();

    // Dark eclipsed core with fiery edge
    ctx.fillStyle = '#260606';
    ctx.beginPath();
    ctx.arc(bloodMoonX - 3, bloodMoonY - 2, 30, 0, Math.PI * 2);
    ctx.fill();

    // Solar flare spikes
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2;
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
      const flareLen = 10 + Math.sin(totalTime * 4 + a) * 4;
      ctx.beginPath();
      ctx.moveTo(bloodMoonX + Math.cos(a) * 32, bloodMoonY + Math.sin(a) * 32);
      ctx.lineTo(bloodMoonX + Math.cos(a) * (32 + flareLen), bloodMoonY + Math.sin(a) * (32 + flareLen));
      ctx.stroke();
    }
    ctx.restore();

    // 3. Rising Fiery Volcanic Embers
    for (let i = 0; i < 28; i++) {
      const emberX = ((i * 73 + Math.sin(totalTime * 2 + i) * 30 - camX * 0.18) % width + width) % width;
      const emberY = ((height - ((totalTime * 45 + i * 53) % (height * 0.85))) - camY * 0.05);
      const emberSize = 2 + (i % 3);
      const flicker = Math.sin(totalTime * 5 + i) * 0.3 + 0.7;
      ctx.fillStyle = i % 3 === 0 ? '#fbbf24' : '#f97316';
      ctx.globalAlpha = flicker * 0.85;
      ctx.fillRect(Math.floor(emberX), Math.floor(emberY), emberSize, emberSize);
    }
    ctx.globalAlpha = 1.0;

    // 4. Layer 1: Jagged Caldera Peaks & Magma Fissures (Scroll: 0.12x)
    const mtnScroll = camX * 0.12;
    const mtnWidth = 220;
    const mtnOffset = -(mtnScroll % mtnWidth);
    ctx.fillStyle = '#1c0707';
    for (let x = mtnOffset - 100; x < width + 100; x += mtnWidth) {
      const idx = Math.floor((x + mtnScroll) / mtnWidth);
      const peakH = 130 + ((idx * 37) % 70);
      const peakY = height - peakH - 70;

      ctx.beginPath();
      ctx.moveTo(x, height);
      ctx.lineTo(x + mtnWidth * 0.45, peakY);
      ctx.lineTo(x + mtnWidth * 0.55, peakY + 8);
      ctx.lineTo(x + mtnWidth, height);
      ctx.closePath();
      ctx.fill();

      // Glowing lava fissure flowing down mountain peak
      ctx.save();
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x + mtnWidth * 0.48, peakY + 5);
      ctx.lineTo(x + mtnWidth * 0.42, peakY + peakH * 0.4);
      ctx.lineTo(x + mtnWidth * 0.52, peakY + peakH * 0.7);
      ctx.lineTo(x + mtnWidth * 0.46, height);
      ctx.stroke();
      ctx.restore();
    }

    // 5. Layer 2: Midground Basalt Columns & Magma Foundry Smokestacks (Scroll: 0.32x)
    const midScroll = camX * 0.32;
    const colWidth = 76;
    const colOffset = -(midScroll % (colWidth * 5));

    for (let i = -2; i < Math.ceil(width / colWidth) + 3; i++) {
      const cx = colOffset + i * colWidth;
      const colH = 95 + ((i * 43) % 70);
      const cy = height - colH - 60;

      // Basalt Pillar / Foundry Tower Body
      ctx.fillStyle = '#180a0a';
      ctx.fillRect(cx, cy, colWidth - 8, colH + 70);

      // Industrial Blast Chimney Exhaust
      if (i % 2 === 0) {
        ctx.fillStyle = '#261010';
        ctx.fillRect(cx + 8, cy - 14, 16, 14);
        ctx.fillStyle = '#f97316';
        ctx.fillRect(cx + 10, cy - 16, 12, 3); // Furnace glow brim
      }

      // Cascading Molten Lava Waterfall down pillar
      if ((i + 1) % 2 === 0) {
        const lavaAnim = (totalTime * 6) % 12;
        ctx.fillStyle = '#f97316';
        ctx.fillRect(cx + 22, cy + 10, 6, colH + 40);
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(cx + 24, cy + 10 + lavaAnim, 2, colH + 20);
      }

      // Molten Heat Grate with furnace interior
      ctx.fillStyle = 'rgba(239, 68, 68, 0.2)';
      ctx.fillRect(cx + 8, cy + 28, colWidth - 24, 18);
      ctx.fillStyle = '#f59e0b';
      for (let g = 0; g < 3; g++) {
        const pulse = Math.sin(totalTime * 3 + i + g) * 0.3 + 0.7;
        ctx.globalAlpha = pulse;
        ctx.fillRect(cx + 12 + g * 14, cy + 32, 8, 10);
      }
      ctx.globalAlpha = 1.0;
    }

    // 6. Layer 3: Boiling Magma Lake & Heat Haze (Scroll: 0.6x)
    this.renderHorizonMist(camX * 0.6, height, 'VOLCANIC_CORE');
  }

  // ==========================================
  // STAGE 4: STARLIGHT CITADEL (CELESTIAL REALM)
  // ==========================================
  private renderStarlightCitadelBackground(
    camX: number,
    camY: number,
    width: number,
    height: number,
    totalTime: number
  ) {
    const ctx = this.ctx;

    // 1. Cosmic Deep Space Gradient
    const sky = ctx.createLinearGradient(0, 0, 0, height);
    sky.addColorStop(0, '#050516');
    sky.addColorStop(0.4, '#12082b');
    sky.addColorStop(0.75, '#260a44');
    sky.addColorStop(1, '#3b1259');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, width, height);

    // 2. Swirling Galactic Cosmic Nebula Clouds
    ctx.save();
    for (let n = 0; n < 3; n++) {
      const nebX = ((width * (0.25 + n * 0.35) - camX * (0.01 + n * 0.005)) % (width * 1.6) + width * 1.6) % (width * 1.6) - 80;
      const nebY = 70 + n * 45 - camY * 0.01;
      const nebGrad = ctx.createRadialGradient(nebX, nebY, 10, nebX, nebY, 140);
      if (n === 0) {
        nebGrad.addColorStop(0, 'rgba(168, 85, 247, 0.22)');
        nebGrad.addColorStop(0.6, 'rgba(99, 102, 241, 0.08)');
        nebGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      } else if (n === 1) {
        nebGrad.addColorStop(0, 'rgba(236, 72, 153, 0.20)');
        nebGrad.addColorStop(0.6, 'rgba(192, 132, 252, 0.07)');
        nebGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      } else {
        nebGrad.addColorStop(0, 'rgba(56, 189, 248, 0.18)');
        nebGrad.addColorStop(0.6, 'rgba(147, 51, 234, 0.06)');
        nebGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      }
      ctx.fillStyle = nebGrad;
      ctx.beginPath();
      ctx.arc(nebX, nebY, 140, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // 3. Celestial Ringed Giant Gas Planet & Satellite Moon (Scroll: 0.015x)
    const planetX = ((width * 0.82 - camX * 0.015) % (width * 1.5) + width * 1.5) % (width * 1.5) - 50;
    const planetY = 80 - camY * 0.015;

    ctx.save();
    ctx.shadowBlur = 30;
    ctx.shadowColor = '#c084fc';

    // Planet Body
    const planetGrad = ctx.createLinearGradient(planetX - 28, planetY - 28, planetX + 28, planetY + 28);
    planetGrad.addColorStop(0, '#fef08a');
    planetGrad.addColorStop(0.5, '#c084fc');
    planetGrad.addColorStop(1, '#4338ca');
    ctx.fillStyle = planetGrad;
    ctx.beginPath();
    ctx.arc(planetX, planetY, 28, 0, Math.PI * 2);
    ctx.fill();

    // Planetary Ring Orbit System
    ctx.shadowBlur = 12;
    ctx.strokeStyle = 'rgba(253, 224, 71, 0.7)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(planetX, planetY, 52, 14, Math.PI / 7, 0, Math.PI * 2);
    ctx.stroke();

    // Orbiting Satellite Moon
    const moonAngle = totalTime * 0.5;
    const subMoonX = planetX + Math.cos(moonAngle) * 58;
    const subMoonY = planetY + Math.sin(moonAngle) * 20;
    ctx.fillStyle = '#e0e7ff';
    ctx.beginPath();
    ctx.arc(subMoonX, subMoonY, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 4. Sparkling Diamond Starlight
    ctx.fillStyle = '#ffffff';
    this.stars.forEach((star) => {
      const sx = ((star.x - camX * star.speed) % width + width) % width;
      const sy = ((star.y - camY * 0.03) % (height * 0.68) + height * 0.68) % (height * 0.68);
      const twinkle = Math.sin(totalTime * 3.5 + star.x) * 0.4 + 0.6;
      ctx.globalAlpha = star.alpha * twinkle;

      // Diamond star shape for cosmic aesthetic
      if (star.size > 1) {
        ctx.fillRect(Math.floor(sx) - 1, Math.floor(sy), 3, 1);
        ctx.fillRect(Math.floor(sx), Math.floor(sy) - 1, 1, 3);
      } else {
        ctx.fillRect(Math.floor(sx), Math.floor(sy), 1, 1);
      }
    });
    ctx.globalAlpha = 1.0;

    // 5. Layer 1: Distant Floating Celestial Isles & Orbital Arches (Scroll: 0.12x)
    const isleScroll = camX * 0.12;
    const isleSpacing = 200;
    const isleOffset = -(isleScroll % isleSpacing);
    ctx.fillStyle = '#1a1033';
    for (let x = isleOffset - 100; x < width + 100; x += isleSpacing) {
      const idx = Math.floor((x + isleScroll) / isleSpacing);
      const iY = 140 + ((idx * 41) % 60) - camY * 0.08;
      const iW = 90 + ((idx * 23) % 40);

      // Floating rock island base (triangular bottom)
      ctx.beginPath();
      ctx.moveTo(x, iY);
      ctx.lineTo(x + iW, iY);
      ctx.lineTo(x + iW * 0.5, iY + 45);
      ctx.closePath();
      ctx.fill();

      // Golden Archway on island
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x + iW * 0.35, iY - 24, iW * 0.3, 24);
    }

    // 6. Layer 2: Midground Floating Citadel Temples & Hovering Obelisks (Scroll: 0.32x)
    const midScroll = camX * 0.32;
    const templeWidth = 90;
    const templeOffset = -(midScroll % (templeWidth * 5));

    for (let i = -2; i < Math.ceil(width / templeWidth) + 3; i++) {
      const tx = templeOffset + i * templeWidth;
      const floatBob = Math.sin(totalTime * 2 + i * 1.5) * 6;
      const tHeight = 110 + ((i * 37) % 65);
      const ty = height - tHeight - 65 + floatBob;

      // Citadel Spire Body (Starlight Marble & Indigo)
      ctx.fillStyle = '#221545';
      ctx.fillRect(tx, ty, templeWidth - 10, tHeight + 70);

      // Golden Trim & Spire Peak
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(tx + 4, ty, templeWidth - 18, 3);
      ctx.beginPath();
      ctx.moveTo(tx + (templeWidth - 10) / 2, ty - 22);
      ctx.lineTo(tx + 14, ty);
      ctx.lineTo(tx + templeWidth - 24, ty);
      ctx.closePath();
      ctx.fill();

      // Hovering Ethereal Crystal Obelisk beside temple
      const obeliskX = tx + templeWidth - 4;
      const obeliskY = ty + 15 + Math.sin(totalTime * 3 + i) * 8;
      ctx.fillStyle = '#e879f9';
      ctx.beginPath();
      ctx.moveTo(obeliskX, obeliskY - 14);
      ctx.lineTo(obeliskX + 5, obeliskY);
      ctx.lineTo(obeliskX, obeliskY + 14);
      ctx.lineTo(obeliskX - 5, obeliskY);
      ctx.closePath();
      ctx.fill();

      // Sacred Starlight Windows
      ctx.fillStyle = '#c084fc';
      for (let r = 0; r < 3; r++) {
        const pulse = Math.sin(totalTime * 2.5 + i + r) * 0.3 + 0.7;
        ctx.globalAlpha = pulse * 0.75;
        ctx.fillRect(tx + 18, ty + 24 + r * 22, templeWidth - 46, 12);
      }
      ctx.globalAlpha = 1.0;
    }

    // 7. Layer 3: Celestial Cloud Sea & Shimmering Aurora Borealis (Scroll: 0.6x)
    this.renderHorizonMist(camX * 0.6, height, 'STARLIGHT_CITADEL');
  }

  // Common Horizon Mist & Ambient Waves Tailored by Stage
  private renderHorizonMist(scrollX: number, height: number, biome: BiomeType) {
    const ctx = this.ctx;
    
    if (biome === 'VOLCANIC_CORE') {
      // Boiling Magma Sea Mist & Heat Waves
      const mistGrad = ctx.createLinearGradient(0, height - 75, 0, height);
      mistGrad.addColorStop(0, 'rgba(239, 68, 68, 0)');
      mistGrad.addColorStop(0.5, 'rgba(249, 115, 22, 0.25)');
      mistGrad.addColorStop(1, 'rgba(239, 68, 68, 0.45)');
      ctx.fillStyle = mistGrad;
      ctx.fillRect(0, height - 75, this.canvas.width, 75);

      // Bubbling Magma Surface Line
      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, height - 20);
      for (let x = 0; x <= this.canvas.width; x += 20) {
        const wave = Math.sin((x + scrollX) * 0.05) * 4;
        ctx.lineTo(x, height - 20 + wave);
      }
      ctx.stroke();
    } else if (biome === 'CRYSTAL_CAVERN') {
      // Bioluminescent Subterranean Mineral Pool
      const poolGrad = ctx.createLinearGradient(0, height - 70, 0, height);
      poolGrad.addColorStop(0, 'rgba(6, 182, 212, 0)');
      poolGrad.addColorStop(0.6, 'rgba(16, 185, 129, 0.2)');
      poolGrad.addColorStop(1, 'rgba(6, 182, 212, 0.35)');
      ctx.fillStyle = poolGrad;
      ctx.fillRect(0, height - 70, this.canvas.width, 70);

      // Phosphorescent Water Ripples
      ctx.strokeStyle = 'rgba(103, 232, 249, 0.35)';
      ctx.lineWidth = 1.5;
      const rSpacing = 48;
      const rOffset = -(scrollX % rSpacing);
      for (let x = rOffset; x < this.canvas.width; x += rSpacing) {
        ctx.beginPath();
        ctx.moveTo(x, height - 16);
        ctx.lineTo(x + 24, height - 16);
        ctx.stroke();
      }
    } else if (biome === 'STARLIGHT_CITADEL') {
      // Celestial Aurora Borealis Ribbons & Sea of Clouds
      const auroraGrad = ctx.createLinearGradient(0, height - 90, 0, height);
      auroraGrad.addColorStop(0, 'rgba(168, 85, 247, 0)');
      auroraGrad.addColorStop(0.5, 'rgba(192, 132, 252, 0.22)');
      auroraGrad.addColorStop(1, 'rgba(56, 189, 248, 0.32)');
      ctx.fillStyle = auroraGrad;
      ctx.fillRect(0, height - 90, this.canvas.width, 90);

      // Aurora undulating waves
      ctx.strokeStyle = 'rgba(236, 72, 153, 0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, height - 40);
      for (let x = 0; x <= this.canvas.width; x += 15) {
        const wave = Math.sin((x + scrollX) * 0.03) * 6 + Math.cos((x - scrollX) * 0.02) * 4;
        ctx.lineTo(x, height - 40 + wave);
      }
      ctx.stroke();
    } else {
      // CYBER_CITY: Retro Synthwave Perspective Grid
      const mistColor = 'rgba(56, 189, 248, 0.12)';
      ctx.fillStyle = mistColor;
      ctx.fillRect(0, height - 70, this.canvas.width, 70);

      ctx.strokeStyle = 'rgba(168, 85, 247, 0.3)';
      ctx.lineWidth = 1;
      const gridSpacing = 40;
      const gOffset = -(scrollX % gridSpacing);
      for (let x = gOffset; x < this.canvas.width; x += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(x, height - 35);
        ctx.lineTo(x + 20, height);
        ctx.stroke();
      }
    }
  }

  // --- GHOST TRAILS (Dash Motion Blur) ---
  private renderGhostTrails(trails: GhostTrail[]) {
    const ctx = this.ctx;
    trails.forEach((trail) => {
      ctx.save();
      ctx.globalAlpha = trail.alpha * 0.5;
      ctx.fillStyle = trail.color;
      ctx.fillRect(trail.x, trail.y, trail.width, trail.height);
      ctx.restore();
    });
  }

  // --- PLATFORMS ---
  private renderPlatforms(platforms: Platform[], biome: BiomeType, totalTime: number) {
    const ctx = this.ctx;

    platforms.forEach((plat) => {
      if (plat.isFallen) return;

      const px = plat.x + (plat.shakeOffset ?? 0);
      const py = plat.y;
      const pw = plat.width;
      const ph = plat.height;

      if (plat.type === 'SPIKE') {
        this.renderSpikes(px, py, pw, ph, totalTime);
        return;
      }

      if (plat.type === 'SPRING') {
        this.renderSpringPad(px, py, pw, ph, plat.isCompressed ?? false);
        return;
      }

      // Base Platform Body
      let baseColor = '#1e293b';
      let trimColor = '#38bdf8';
      let innerGlow = '#0284c7';

      if (biome === 'CRYSTAL_CAVERN') {
        baseColor = '#132030';
        trimColor = '#34d399';
        innerGlow = '#059669';
      } else if (biome === 'VOLCANIC_CORE') {
        baseColor = '#2b1414';
        trimColor = '#f97316';
        innerGlow = '#dc2626';
      } else if (biome === 'STARLIGHT_CITADEL') {
        baseColor = '#1e1b4b';
        trimColor = '#c084fc';
        innerGlow = '#9333ea';
      }

      if (plat.type === 'ONE_WAY') {
        ctx.fillStyle = baseColor;
        ctx.fillRect(px, py, pw, ph);

        ctx.fillStyle = trimColor;
        ctx.fillRect(px, py, pw, 4);

        ctx.fillStyle = innerGlow;
        for (let x = px + 6; x < px + pw - 6; x += 16) {
          ctx.fillRect(x, py + 8, 8, 3);
        }
        return;
      }

      if (plat.type === 'CRUMBLING') {
        ctx.fillStyle = plat.isCrumbling ? '#475569' : '#334155';
        ctx.fillRect(px, py, pw, ph);

        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(px, py, pw, 3);

        ctx.fillStyle = '#0f172a';
        ctx.fillRect(px + pw * 0.3, py + 4, 3, ph - 8);
        ctx.fillRect(px + pw * 0.65, py + 7, 3, ph - 11);
        if (plat.isCrumbling) {
          ctx.fillStyle = '#ef4444';
          ctx.fillRect(px + 4, py + ph - 4, pw - 8, 2);
        }
        return;
      }

      if (plat.type === 'MOVING') {
        ctx.fillStyle = baseColor;
        ctx.fillRect(px, py, pw, ph);

        ctx.fillStyle = trimColor;
        ctx.fillRect(px, py, pw, 4);

        const thrusterPulse = Math.sin(totalTime * 12) * 2 + 6;
        ctx.fillStyle = trimColor;
        ctx.fillRect(px + 12, py + ph, 12, thrusterPulse);
        ctx.fillRect(px + pw - 24, py + ph, 12, thrusterPulse);

        ctx.fillStyle = innerGlow;
        ctx.fillRect(px + 8, py + 10, pw - 16, 4);
        return;
      }

      // Default SOLID platform
      ctx.fillStyle = baseColor;
      ctx.fillRect(px, py, pw, ph);

      ctx.fillStyle = trimColor;
      ctx.fillRect(px, py, pw, 4);

      ctx.fillStyle = innerGlow;
      for (let bx = px + 12; bx < px + pw - 12; bx += 32) {
        ctx.fillRect(bx, py + 12, 4, 4);
        if (ph > 36) {
          ctx.fillRect(bx + 16, py + 26, 4, 4);
        }
      }

      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.fillRect(px, py + ph - 4, pw, 4);
    });
  }

  private renderSpikes(x: number, y: number, w: number, h: number, totalTime: number) {
    const ctx = this.ctx;
    const spikeWidth = 14;
    const numSpikes = Math.floor(w / spikeWidth);

    for (let i = 0; i < numSpikes; i++) {
      const sx = x + i * spikeWidth;
      const pulse = Math.sin(totalTime * 6 + i) * 2;

      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.moveTo(sx, y + h);
      ctx.lineTo(sx + spikeWidth / 2, y + 2 + pulse);
      ctx.lineTo(sx + spikeWidth, y + h);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#fca5a5';
      ctx.fillRect(sx + spikeWidth / 2 - 1, y + 2 + pulse, 2, 4);
    }
  }

  private renderSpringPad(x: number, y: number, w: number, h: number, compressed: boolean) {
    const ctx = this.ctx;
    const padHeight = compressed ? 8 : 16;
    const padY = y + (h - padHeight);

    ctx.fillStyle = '#475569';
    ctx.fillRect(x, y + h - 4, w, 4);

    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(x + 8, padY + 4, w - 16, padHeight - 6);

    ctx.save();
    ctx.shadowBlur = compressed ? 4 : 12;
    ctx.shadowColor = '#f59e0b';
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(x + 2, padY, w - 4, 5);
    ctx.restore();
  }

  // --- CHECKPOINTS ---
  private renderCheckpoints(checkpoints: Checkpoint[], totalTime: number) {
    const ctx = this.ctx;

    checkpoints.forEach((cp) => {
      const isAct = cp.activated;
      const beaconColor = isAct ? '#22c55e' : '#64748b';

      ctx.fillStyle = '#334155';
      ctx.fillRect(cp.x + cp.width / 2 - 2, cp.y, 4, cp.height);

      ctx.save();
      if (isAct) {
        ctx.shadowBlur = 18;
        ctx.shadowColor = '#22c55e';
      }
      ctx.fillStyle = beaconColor;
      ctx.beginPath();
      ctx.arc(cp.x + cp.width / 2, cp.y + 8, 8, 0, Math.PI * 2);
      ctx.fill();

      const wave = Math.sin(totalTime * 4) * 3;
      ctx.fillStyle = isAct ? 'rgba(34, 197, 94, 0.7)' : 'rgba(100, 116, 139, 0.4)';
      ctx.beginPath();
      ctx.moveTo(cp.x + cp.width / 2, cp.y + 12);
      ctx.lineTo(cp.x + cp.width / 2 + 18 + wave, cp.y + 18);
      ctx.lineTo(cp.x + cp.width / 2, cp.y + 24);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    });
  }

  // --- EXIT PORTAL ---
  private renderPortal(portal: ExitPortal, totalTime: number) {
    const ctx = this.ctx;
    const cx = portal.x + portal.width / 2;
    const cy = portal.y + portal.height / 2;

    ctx.save();
    ctx.shadowBlur = 24;
    ctx.shadowColor = '#a855f7';

    const radius = 28 + Math.sin(totalTime * 5) * 3;
    const rot = totalTime * 2;

    ctx.translate(cx, cy);
    ctx.rotate(rot);

    ctx.strokeStyle = '#c084fc';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(0, 0, radius, radius * 0.6, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(0, 0, radius * 0.7, radius * 0.4, Math.PI / 3, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, 0, 10, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // --- ENEMIES ---
  private renderEnemies(enemies: Enemy[], totalTime: number) {
    const ctx = this.ctx;

    enemies.forEach((enemy) => {
      if (!enemy.alive) return;

      const ex = enemy.x;
      const ey = enemy.y;
      const ew = enemy.width;
      const eh = enemy.height;

      if (enemy.type === 'PATROL') {
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(ex + 2, ey + 4, ew - 4, eh - 8);

        ctx.fillStyle = '#991b1b';
        ctx.fillRect(ex + 4, ey, ew - 8, 6);

        ctx.save();
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#facc15';
        ctx.fillStyle = '#fef08a';
        const eyeX = enemy.facing === 'right' ? ex + ew - 8 : ex + 4;
        ctx.fillRect(eyeX, ey + 6, 4, 4);
        ctx.restore();

        ctx.fillStyle = '#1e293b';
        ctx.fillRect(ex, ey + eh - 5, ew, 5);

      } else if (enemy.type === 'FLYER') {
        const bob = Math.sin(totalTime * 8) * 3;
        ctx.fillStyle = '#7c3aed';
        ctx.fillRect(ex + 4, ey + 4 + bob, ew - 8, eh - 8);

        ctx.fillStyle = '#c4b5fd';
        const bladeW = 10 + Math.sin(totalTime * 20) * 4;
        ctx.fillRect(ex + ew / 2 - bladeW / 2, ey + bob - 2, bladeW, 3);

        ctx.save();
        ctx.shadowBlur = 6;
        ctx.shadowColor = '#ec4899';
        ctx.fillStyle = '#f472b6';
        ctx.fillRect(ex + ew / 2 - 3, ey + 8 + bob, 6, 6);
        ctx.restore();
      }
    });
  }

  // --- COLLECTIBLES & GLOWING POWER-UPS ---
  private renderCollectibles(collectibles: Collectible[], totalTime: number) {
    const ctx = this.ctx;

    collectibles.forEach((item) => {
      if (item.collected) return;

      const floatY = Math.sin(totalTime * 4 + item.animOffset * Math.PI * 2) * 4;
      const ix = item.x;
      const iy = item.y + floatY;

      if (item.type === 'COIN') {
        const scaleX = Math.abs(Math.cos(totalTime * 5 + item.animOffset * 3));
        const coinW = Math.max(4, item.width * scaleX);

        ctx.save();
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#fbbf24';
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(ix + (item.width - coinW) / 2, iy, coinW, item.height);

        ctx.fillStyle = '#fef08a';
        ctx.fillRect(ix + (item.width - coinW) / 2 + 2, iy + 2, Math.max(1, coinW - 4), item.height - 4);
        ctx.restore();
        return;
      }

      if (item.type === 'GEM') {
        ctx.save();
        ctx.shadowBlur = 16;
        ctx.shadowColor = '#38bdf8';
        ctx.fillStyle = '#0284c7';

        ctx.beginPath();
        ctx.moveTo(ix + item.width / 2, iy);
        ctx.lineTo(ix + item.width, iy + item.height * 0.4);
        ctx.lineTo(ix + item.width / 2, iy + item.height);
        ctx.lineTo(ix, iy + item.height * 0.4);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#bae6fd';
        ctx.beginPath();
        ctx.moveTo(ix + item.width / 2, iy + 2);
        ctx.lineTo(ix + item.width - 3, iy + item.height * 0.4);
        ctx.lineTo(ix + item.width / 2, iy + item.height * 0.5);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
        return;
      }

      if (item.type === 'HEART') {
        ctx.save();
        ctx.shadowBlur = 12;
        ctx.shadowColor = '#ef4444';
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.arc(ix + 5, iy + 5, 5, Math.PI, 0, false);
        ctx.arc(ix + 13, iy + 5, 5, Math.PI, 0, false);
        ctx.lineTo(ix + 9, iy + 17);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
        return;
      }

      this.renderPowerUpOrb(ix, iy, item.width, item.height, item.type as PowerUpType, totalTime);
    });
  }

  private renderPowerUpOrb(x: number, y: number, w: number, h: number, type: PowerUpType, totalTime: number) {
    const ctx = this.ctx;
    let glowColor = '#38bdf8';
    let orbColor = '#0284c7';
    let iconChar = 'W';

    if (type === 'DOUBLE_JUMP') {
      glowColor = '#38bdf8';
      orbColor = '#0ea5e9';
      iconChar = '▲';
    } else if (type === 'SPEED_DASH') {
      glowColor = '#f59e0b';
      orbColor = '#d97706';
      iconChar = '»';
    } else if (type === 'COIN_MAGNET') {
      glowColor = '#10b981';
      orbColor = '#059669';
      iconChar = 'U';
    } else if (type === 'SHIELD') {
      glowColor = '#ec4899';
      orbColor = '#db2777';
      iconChar = '◆';
    } else if (type === 'TIME_WARP') {
      glowColor = '#a855f7';
      orbColor = '#9333ea';
      iconChar = '⏳';
    }

    ctx.save();
    ctx.shadowBlur = 20;
    ctx.shadowColor = glowColor;

    ctx.fillStyle = orbColor;
    ctx.beginPath();
    ctx.arc(x + w / 2, y + h / 2, w / 2, 0, Math.PI * 2);
    ctx.fill();

    const ringPulse = Math.sin(totalTime * 6) * 2;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(x + w / 2, y + h / 2, w / 2 - 3 + ringPulse, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(iconChar, x + w / 2, y + h / 2);

    ctx.restore();
  }

  // --- PLAYER SPRITE & SKILL AURA ---
  private renderPlayer(player: Player, totalTime: number) {
    const ctx = this.ctx;

    if (player.invulnerableTimer > 0 && Math.floor(player.invulnerableTimer * 20) % 2 === 0) {
      return;
    }

    const cx = player.x + player.width / 2;
    const cy = player.y + player.height / 2;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(player.squashX, player.squashY);

    if (player.facing === 'left') {
      ctx.scale(-1, 1);
    }

    const px = -player.width / 2;
    const py = -player.height / 2;

    // 1. Skill Auras & Glowing Buffs
    if (player.activePowerUps.SHIELD > 0) {
      ctx.save();
      const shieldHue = (totalTime * 180) % 360;
      ctx.shadowBlur = 18;
      ctx.shadowColor = `hsl(${shieldHue}, 100%, 65%)`;
      ctx.strokeStyle = `hsl(${shieldHue}, 100%, 75%)`;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, 0, player.height * 0.75, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    if (player.activePowerUps.COIN_MAGNET > 0) {
      const pulseRad = 16 + (totalTime * 40) % 20;
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, pulseRad, 0, Math.PI * 2);
      ctx.stroke();
    }

    if (player.activePowerUps.SPEED_DASH > 0) {
      ctx.save();
      ctx.shadowBlur = 12;
      ctx.shadowColor = '#f59e0b';
      ctx.fillStyle = 'rgba(245, 158, 11, 0.2)';
      ctx.fillRect(px - 4, py - 4, player.width + 8, player.height + 8);
      ctx.restore();
    }

    // 2. Render Character Custom Sprite based on selected skin
    const char = getCharacterById(player.characterSkinId || 'cyber_jumper');
    const isRunning = player.onGround && Math.abs(player.vx) > 20;
    
    GameRenderer.drawCharacterPixels(
      ctx,
      char,
      px,
      py,
      isRunning,
      player.onGround,
      player.animFrame,
      totalTime,
      player.activePowerUps.DOUBLE_JUMP > 0 || player.canDoubleJump
    );

    ctx.restore();
  }

  /**
   * Static method to render pixel art character sprites.
   * Reusable for gameplay and the Character Customization screen.
   */
  public static drawCharacterPixels(
    ctx: CanvasRenderingContext2D,
    char: CharacterConfig,
    px: number,
    py: number,
    isRunning: boolean,
    onGround: boolean,
    animFrame: number,
    totalTime: number,
    hasDoubleJumpWing: boolean
  ) {
    const colors = char.colors;

    // Glitch Phantom subtle horizontal jitter
    let jitterX = 0;
    if (char.spriteStyle === 'phantom') {
      if (Math.floor(totalTime * 15) % 5 === 0) {
        jitterX = (Math.random() - 0.5) * 2;
      }
    }

    // --- CAPE / SCARF / MANTLE (Rendered behind body) ---
    const capeFlap = Math.sin(totalTime * 12) * 4;

    if (char.spriteStyle === 'shinobi') {
      // Dual billowing ninja scarf ribbons
      ctx.fillStyle = colors.cape;
      ctx.beginPath();
      ctx.moveTo(px + 4 + jitterX, py + 12);
      ctx.lineTo(px - 10 + capeFlap + jitterX, py + 18);
      ctx.lineTo(px - 14 + capeFlap * 1.3 + jitterX, py + 22);
      ctx.lineTo(px + 4 + jitterX, py + 16);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = colors.capeTrim || '#c084fc';
      ctx.fillRect(px - 12 + capeFlap * 1.3 + jitterX, py + 21, 3, 3);

    } else if (char.spriteStyle === 'valkyrie') {
      // Celestial solar winglets & indigo mantle
      ctx.fillStyle = colors.cape;
      ctx.beginPath();
      ctx.moveTo(px + 5 + jitterX, py + 12);
      ctx.lineTo(px - 8 + capeFlap + jitterX, py + 24);
      ctx.lineTo(px + 4 + jitterX, py + 18);
      ctx.closePath();
      ctx.fill();

      // Glowing solar wing feathers on back
      ctx.save();
      ctx.shadowBlur = 8;
      ctx.shadowColor = colors.visorGlow;
      ctx.fillStyle = colors.core;
      ctx.fillRect(px - 6 + jitterX, py + 10, 4, 2);
      ctx.fillRect(px - 9 + jitterX, py + 12, 6, 2);
      ctx.fillRect(px - 7 + jitterX, py + 15, 4, 2);
      ctx.restore();

    } else if (char.spriteStyle === 'monarch') {
      // Royal golden ermine cape
      ctx.fillStyle = colors.cape;
      ctx.beginPath();
      ctx.moveTo(px + 5 + jitterX, py + 12);
      ctx.lineTo(px - 9 + capeFlap + jitterX, py + 24);
      ctx.lineTo(px + 5 + jitterX, py + 18);
      ctx.closePath();
      ctx.fill();

      // White ermine spot trim
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(px - 6 + capeFlap + jitterX, py + 20, 2, 2);
      ctx.fillRect(px - 3 + capeFlap * 0.7 + jitterX, py + 16, 2, 2);

    } else if (char.spriteStyle === 'knight') {
      // Heavy heraldic paladin cloak
      ctx.fillStyle = colors.cape;
      ctx.fillRect(px - 4 + jitterX, py + 12, 6, 11);
      ctx.fillStyle = colors.capeTrim || '#34d399';
      ctx.fillRect(px - 4 + jitterX, py + 21, 6, 2);

    } else if (char.spriteStyle === 'blaze') {
      // Scorched flame cape with flickering tips
      const flameFlicker = Math.sin(totalTime * 18) * 3;
      ctx.fillStyle = colors.cape;
      ctx.beginPath();
      ctx.moveTo(px + 5 + jitterX, py + 12);
      ctx.lineTo(px - 8 + flameFlicker + jitterX, py + 22);
      ctx.lineTo(px + 5 + jitterX, py + 17);
      ctx.closePath();
      ctx.fill();

      // Orange ember tip
      ctx.fillStyle = colors.capeTrim || '#f97316';
      ctx.fillRect(px - 7 + flameFlicker + jitterX, py + 20, 3, 2);

    } else {
      // Standard aerodynamic cape
      ctx.fillStyle = colors.cape;
      ctx.beginPath();
      ctx.moveTo(px + 5 + jitterX, py + 12);
      ctx.lineTo(px - 6 + capeFlap + jitterX, py + 22);
      ctx.lineTo(px + 5 + jitterX, py + 18);
      ctx.closePath();
      ctx.fill();
    }

    // --- HEAD / HELMET ---
    ctx.fillStyle = colors.head;
    ctx.fillRect(px + 4 + jitterX, py, 16, 12);

    // Character Head Ornaments & Crown Accents
    if (char.spriteStyle === 'monarch') {
      // 3-Peak Golden Imperial Crown
      ctx.save();
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#fbbf24';
      ctx.fillStyle = '#fbbf24';
      // Base band
      ctx.fillRect(px + 3 + jitterX, py - 3, 18, 3);
      // 3 Crown Peaks
      ctx.fillRect(px + 3 + jitterX, py - 6, 3, 3);
      ctx.fillRect(px + 10 + jitterX, py - 8, 4, 5); // Center peak higher
      ctx.fillRect(px + 18 + jitterX, py - 6, 3, 3);
      // Ruby gems in crown
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(px + 4 + jitterX, py - 2, 2, 2);
      ctx.fillRect(px + 11 + jitterX, py - 2, 2, 2);
      ctx.fillRect(px + 18 + jitterX, py - 2, 2, 2);
      ctx.restore();

    } else if (char.spriteStyle === 'valkyrie') {
      // Hovering Celestial Golden Halo Ring
      ctx.save();
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#fbbf24';
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      const haloBob = Math.sin(totalTime * 4) * 1.5;
      ctx.ellipse(px + 12 + jitterX, py - 4 + haloBob, 8, 2.5, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

    } else if (char.spriteStyle === 'knight') {
      // Dual Golden Plumed Visor Horns
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(px + 2 + jitterX, py - 3, 3, 5);
      ctx.fillRect(px + 19 + jitterX, py - 3, 3, 5);
      // Top crest
      ctx.fillStyle = '#10b981';
      ctx.fillRect(px + 10 + jitterX, py - 3, 4, 3);

    } else if (char.spriteStyle === 'blaze') {
      // Flickering fiery crown embers
      ctx.save();
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#f97316';
      ctx.fillStyle = '#f97316';
      const f1 = Math.sin(totalTime * 20) * 2;
      const f2 = Math.cos(totalTime * 22) * 2;
      ctx.fillRect(px + 6 + jitterX, py - 4 + f1, 3, 4);
      ctx.fillRect(px + 11 + jitterX, py - 6 + f2, 3, 6);
      ctx.fillRect(px + 16 + jitterX, py - 4 + f1, 3, 4);
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(px + 12 + jitterX, py - 3 + f2, 2, 3);
      ctx.restore();

    } else if (char.spriteStyle === 'shinobi') {
      // Ninja headband knot on back
      ctx.fillStyle = '#f43f5e';
      ctx.fillRect(px + 2 + jitterX, py + 4, 3, 3);
    }

    // --- GLOWING VISOR / EYES ---
    ctx.save();
    ctx.shadowBlur = 8;
    ctx.shadowColor = colors.visorGlow;
    ctx.fillStyle = colors.visor;

    if (char.spriteStyle === 'shinobi') {
      // Sleek narrow ninja visor slit
      ctx.fillRect(px + 11 + jitterX, py + 4, 9, 3);
    } else if (char.spriteStyle === 'phantom') {
      // Holographic skull eye sockets
      ctx.fillRect(px + 10 + jitterX, py + 3, 4, 4);
      ctx.fillRect(px + 16 + jitterX, py + 3, 4, 4);
      // Scanline pixel
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(px + 9 + jitterX, py + 9, 10, 1);
    } else {
      // Standard cyber visor
      ctx.fillRect(px + 10 + jitterX, py + 3, 9, 5);
    }
    ctx.restore();

    // --- TORSO / ARMOR ---
    ctx.fillStyle = colors.torso;
    ctx.fillRect(px + 5 + jitterX, py + 12, 14, 10);

    // Shoulder Pauldrons (Knight & Valkyrie)
    if (char.spriteStyle === 'knight') {
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(px + 2 + jitterX, py + 11, 4, 4);
      ctx.fillRect(px + 18 + jitterX, py + 11, 4, 4);
    } else if (char.spriteStyle === 'valkyrie') {
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(px + 3 + jitterX, py + 11, 3, 3);
      ctx.fillRect(px + 18 + jitterX, py + 11, 3, 3);
    }

    // --- CHEST CORE / CREST ---
    ctx.save();
    ctx.shadowBlur = 6;
    ctx.shadowColor = colors.core;
    ctx.fillStyle = colors.core;

    if (char.spriteStyle === 'monarch') {
      // Golden 8-point star crest
      ctx.fillRect(px + 10 + jitterX, py + 14, 4, 4);
      ctx.fillRect(px + 11 + jitterX, py + 13, 2, 6);
      ctx.fillRect(px + 9 + jitterX, py + 15, 6, 2);
    } else if (char.spriteStyle === 'blaze') {
      // Pulsating molten lava heart
      const lavaPulse = Math.sin(totalTime * 8) * 1;
      ctx.fillRect(px + 9 + jitterX, py + 13 - lavaPulse * 0.5, 6, 6 + lavaPulse);
    } else {
      ctx.fillRect(px + 10 + jitterX, py + 14, 4, 4);
    }
    ctx.restore();

    // Shinobi kunai hip holster
    if (char.spriteStyle === 'shinobi') {
      ctx.fillStyle = '#71717a';
      ctx.fillRect(px + 3 + jitterX, py + 14, 2, 6);
    }

    // --- LEGS & RUNNING CYCLE ---
    ctx.fillStyle = colors.legs;
    if (!onGround) {
      // Jumping frame
      ctx.fillRect(px + 4 + jitterX, py + 22, 6, 7);
      ctx.fillRect(px + 14 + jitterX, py + 20, 6, 9);
      // Feet highlights
      ctx.fillStyle = colors.feet;
      ctx.fillRect(px + 4 + jitterX, py + 28, 6, 2);
      ctx.fillRect(px + 14 + jitterX, py + 28, 6, 2);
    } else if (isRunning) {
      // Running cycle
      const legOffset = (animFrame % 2 === 0) ? 3 : -3;
      ctx.fillRect(px + 4 + legOffset + jitterX, py + 22, 6, 10);
      ctx.fillRect(px + 14 - legOffset + jitterX, py + 22, 6, 10);
      // Feet highlights
      ctx.fillStyle = colors.feet;
      ctx.fillRect(px + 4 + legOffset + jitterX, py + 30, 6, 2);
      ctx.fillRect(px + 14 - legOffset + jitterX, py + 30, 6, 2);
    } else {
      // Idle frame
      ctx.fillRect(px + 5 + jitterX, py + 22, 6, 10);
      ctx.fillRect(px + 13 + jitterX, py + 22, 6, 10);
      // Feet highlights
      ctx.fillStyle = colors.feet;
      ctx.fillRect(px + 5 + jitterX, py + 30, 6, 2);
      ctx.fillRect(px + 13 + jitterX, py + 30, 6, 2);
    }

    // --- ACCESSORY: WING BOOTS AERIAL WINGS ---
    if (hasDoubleJumpWing) {
      ctx.save();
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#38bdf8';
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.moveTo(px + 2 + jitterX, py + 26);
      ctx.lineTo(px - 4 + jitterX, py + 22);
      ctx.lineTo(px + 2 + jitterX, py + 24);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  }

  /**
   * Dedicated static preview helper for UI Modal / Preview Card
   */
  public static renderCharacterPreview(
    ctx: CanvasRenderingContext2D,
    char: CharacterConfig,
    cx: number,
    cy: number,
    scale: number,
    animTime: number
  ) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(scale, scale);

    // Idle breathing bob
    const bob = Math.sin(animTime * 3) * 1.5;
    ctx.translate(0, bob);

    // Character Aura Glow
    ctx.save();
    ctx.shadowBlur = 16;
    ctx.shadowColor = char.colors.aura;
    ctx.fillStyle = 'rgba(0, 0, 0, 0)';
    ctx.beginPath();
    ctx.arc(0, 0, 20, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // Draw sprite centered at origin
    GameRenderer.drawCharacterPixels(
      ctx,
      char,
      -12,
      -16,
      false,
      true,
      0,
      animTime,
      false
    );

    ctx.restore();
  }

  // --- PARTICLES ---
  private renderParticles(particles: Particle[]) {
    const ctx = this.ctx;
    const settings = getSettings();
    const isLowPower = settings.lowPowerMode;
    const pq = settings.particleQuality;

    const step = pq === 'low' ? 3 : pq === 'medium' ? 2 : 1;
    const maxCount = pq === 'low' ? 40 : pq === 'medium' ? 90 : 250;
    const count = Math.min(particles.length, maxCount);

    for (let i = 0; i < count; i += step) {
      const p = particles[i];
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha * (1 - p.life / p.maxLife));

      if (p.glow && !isLowPower) {
        ctx.shadowBlur = pq === 'ultra' ? 12 : 6;
        ctx.shadowColor = p.color;
      }
      ctx.fillStyle = p.color;

      if (p.shape === 'star') {
        const r = p.size;
        ctx.fillRect(p.x - r, p.y, r * 2, 1);
        ctx.fillRect(p.x, p.y - r, 1, r * 2);
      } else {
        ctx.fillRect(p.x, p.y, p.size, p.size);
      }

      ctx.restore();
    }
  }

  // --- FLOATING TEXTS ---
  private renderFloatingTexts(floatingTexts: FloatingText[]) {
    const ctx = this.ctx;

    floatingTexts.forEach((ft) => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, ft.alpha);
      ctx.font = 'bold 12px "Press Start 2P", monospace';
      ctx.fillStyle = ft.color;
      ctx.shadowBlur = 6;
      ctx.shadowColor = '#000000';
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    });
  }

  // --- WORLD-SPACE RAIN SPLASHES ---
  private renderWorldRainSplashes(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
    ctx.lineWidth = 1;

    for (let i = this.rainSplashes.length - 1; i >= 0; i--) {
      const sp = this.rainSplashes[i];
      ctx.globalAlpha = sp.alpha;
      ctx.beginPath();
      ctx.ellipse(sp.x, sp.y, sp.radius, sp.radius * 0.35, 0, 0, Math.PI * 2);
      ctx.stroke();

      sp.radius += 0.8;
      sp.alpha -= 0.08;
      if (sp.alpha <= 0) {
        this.rainSplashes.splice(i, 1);
      }
    }
    ctx.restore();
  }

  // --- DYNAMIC WEATHER OVERLAYS (SCREEN-SPACE CANVAS SYSTEM) ---
  private renderWeatherOverlays(
    weather: WeatherState,
    camX: number,
    camY: number,
    width: number,
    height: number,
    totalTime: number,
    dt: number
  ) {
    const ctx = this.ctx;
    const intensity = Math.max(0, Math.min(1, weather.intensity));
    if (intensity <= 0.01 && weather.type === 'CLEAR') return;

    ctx.save();

    // 1. CYBER RAIN
    if (weather.type === 'CYBER_RAIN' && intensity > 0.02) {
      // Atmospheric rain mist wash
      ctx.fillStyle = `rgba(14, 165, 233, ${0.05 * intensity})`;
      ctx.fillRect(0, 0, width, height);

      // Distant lightning flash
      if (weather.lightningAlpha > 0.01) {
        ctx.fillStyle = `rgba(224, 242, 254, ${weather.lightningAlpha * 0.45 * intensity})`;
        ctx.fillRect(0, 0, width, height);
      }

      // Angled rain streaks
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.2;

      this.weatherParticles.forEach((p) => {
        // Fall down-left
        p.x -= 140 * dt;
        p.y += 750 * dt;

        if (p.y > height + 20) {
          p.y = -20;
          p.x = Math.random() * (width + 200);

          // Chance to trigger platform splash
          if (Math.random() < 0.25 && this.rainSplashes.length < 24) {
            this.rainSplashes.push({
              x: camX + (p.x % width),
              y: camY + height - 80 + Math.random() * 40,
              radius: 1,
              maxRadius: 6 + Math.random() * 4,
              alpha: 0.7,
            });
          }
        }
        if (p.x < -40) {
          p.x = width + 40;
        }

        ctx.globalAlpha = p.alpha * intensity;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - 6, p.y + (p.length ?? 16));
        ctx.stroke();
      });
    }

    // 2. COSMIC SNOW
    else if (weather.type === 'COSMIC_SNOW' && intensity > 0.02) {
      // Frosty radial edge vignette
      const vigGrad = ctx.createRadialGradient(
        width / 2,
        height / 2,
        width * 0.35,
        width / 2,
        height / 2,
        width * 0.75
      );
      vigGrad.addColorStop(0, 'rgba(224, 242, 254, 0)');
      vigGrad.addColorStop(1, `rgba(147, 197, 253, ${0.12 * intensity})`);
      ctx.fillStyle = vigGrad;
      ctx.fillRect(0, 0, width, height);

      // Gently swaying crystalline snowflakes
      ctx.fillStyle = '#ffffff';

      this.weatherParticles.forEach((p) => {
        const sway = Math.sin(totalTime * 2.5 + (p.swayPhase ?? 0)) * 28;
        p.y += (45 + (p.size * 18)) * dt;
        p.x += sway * dt;

        if (p.y > height + 10) {
          p.y = -10;
          p.x = Math.random() * width;
        }
        if (p.x < -20) p.x = width + 20;
        if (p.x > width + 20) p.x = -20;

        ctx.globalAlpha = p.alpha * intensity;
        const drawX = Math.floor(p.x);
        const drawY = Math.floor(p.y);

        if (p.size > 2) {
          // 4-Point cross snowflake
          ctx.fillRect(drawX - 1, drawY, 3, 1);
          ctx.fillRect(drawX, drawY - 1, 1, 3);
        } else {
          ctx.fillRect(drawX, drawY, p.size, p.size);
        }
      });
    }

    // 3. EMBER STORM
    else if (weather.type === 'EMBER_STORM' && intensity > 0.02) {
      // Warm fiery atmospheric wash
      ctx.fillStyle = `rgba(239, 68, 68, ${0.06 * intensity})`;
      ctx.fillRect(0, 0, width, height);

      // Rising glowing thermal sparks & embers
      this.weatherParticles.forEach((p) => {
        const turbulence = Math.sin(totalTime * 3 + (p.swayPhase ?? 0)) * 22;
        p.y -= (90 + (p.size * 25)) * dt;
        p.x += turbulence * dt;

        if (p.y < -15) {
          p.y = height + 15;
          p.x = Math.random() * width;
        }
        if (p.x < -20) p.x = width + 20;
        if (p.x > width + 20) p.x = -20;

        ctx.globalAlpha = p.alpha * intensity;
        const px = Math.floor(p.x);
        const py = Math.floor(p.y);
        ctx.fillStyle = '#f97316';
        ctx.fillRect(px - 1, py - 1, p.size + 2, p.size + 2);
        ctx.fillStyle = p.size > 2 ? '#fef08a' : '#fbbf24';
        ctx.fillRect(px, py, p.size, p.size);
      });
    }

    // 4. DATA STREAM (Matrix Digital Rain)
    else if (weather.type === 'DATA_STREAM' && intensity > 0.02) {
      // Cyber phosphor green tint
      ctx.fillStyle = `rgba(34, 197, 94, ${0.04 * intensity})`;
      ctx.fillRect(0, 0, width, height);

      this.weatherParticles.forEach((p) => {
        p.y += 420 * dt;

        if (p.y > height + 20) {
          p.y = -20;
          p.x = Math.floor(Math.random() * (width / 16)) * 16;
        }

        ctx.globalAlpha = p.alpha * intensity;
        const gx = Math.floor(p.x);
        const gy = Math.floor(p.y);
        const glyphH = 10 + (p.size * 4);
        ctx.fillStyle = '#15803d';
        ctx.fillRect(gx, gy, 2, glyphH);
        ctx.fillStyle = '#4ade80';
        ctx.fillRect(gx, gy + glyphH - 4, 2, 4);
        // Bright head phosphor
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(gx, gy + glyphH - 2, 2, 2);
      });
    }

    // 5. CLEAR (Gentle Starlight Motes)
    else if (weather.type === 'CLEAR') {
      // Subtle ambient air dust
      ctx.fillStyle = '#e0f2fe';
      for (let i = 0; i < 25; i++) {
        const p = this.weatherParticles[i];
        p.y -= 15 * dt;
        p.x += Math.sin(totalTime + i) * 6 * dt;
        if (p.y < -10) p.y = height + 10;
        ctx.globalAlpha = (p.alpha * 0.4) * intensity;
        ctx.fillRect(Math.floor(p.x % width), Math.floor(p.y), 1, 1);
      }
    }

    // 6. RETRO WEATHER SHIFT BANNER NOTIFICATION (HUD Banner Toast)
    if (weather.bannerTimer > 0) {
      this.renderWeatherBanner(weather.bannerText, weather.bannerTimer, width);
    }

    ctx.restore();
  }

  private renderWeatherBanner(text: string, timer: number, width: number) {
    const ctx = this.ctx;
    const bannerAlpha = Math.min(1, timer * 1.5);
    const bannerY = 68;

    ctx.save();
    ctx.globalAlpha = bannerAlpha;

    // Outer Glow Border
    ctx.shadowBlur = 12;
    ctx.shadowColor = '#38bdf8';

    // Banner Pill Box
    const bannerW = Math.min(380, width - 40);
    const bx = width / 2 - bannerW / 2;

    ctx.fillStyle = 'rgba(8, 14, 26, 0.88)';
    ctx.fillRect(bx, bannerY, bannerW, 26);

    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(bx, bannerY, bannerW, 26);

    // Text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 9px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, width / 2, bannerY + 13);

    ctx.restore();
  }
}
