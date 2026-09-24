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
  InputState, 
  Rect,
  Camera 
} from './types';
import { sound } from './audio';

export const GRAVITY = 1800; // px/s^2
export const MAX_FALL_SPEED = 900;
export const MOVE_SPEED = 320;
export const ACCELERATION = 2200;
export const FRICTION = 2400;
export const AIR_ACCELERATION = 1400;
export const JUMP_FORCE = -650;
export const DOUBLE_JUMP_FORCE = -580;
export const SPRING_FORCE = -980;
export const WALL_SLIDE_SPEED = 140;
export const WALL_JUMP_X_FORCE = 420;
export const WALL_JUMP_Y_FORCE = -620;
export const DASH_SPEED = 780;
export const DASH_TIME = 0.16; // 160ms dash
export const DASH_COOLDOWN = 0.65;
export const COYOTE_TIME = 0.12; // 120ms
export const JUMP_BUFFER_TIME = 0.14; // 140ms

export function checkAABB(r1: Rect, r2: Rect): boolean {
  return (
    r1.x < r2.x + r2.width &&
    r1.x + r1.width > r2.x &&
    r1.y < r2.y + r2.height &&
    r1.y + r1.height > r2.y
  );
}

export function createInitialPlayer(x = 100, y = 300): Player {
  return {
    x,
    y,
    vx: 0,
    vy: 0,
    width: 24,
    height: 32,
    onGround: false,
    onWall: null,
    facing: 'right',
    isJumping: false,
    canDoubleJump: true,
    hasDoubleJumped: false,
    coyoteTimer: 0,
    jumpBufferTimer: 0,
    isDashing: false,
    dashCooldown: 0,
    dashDuration: 0,
    dashDirection: 1,
    lives: 3,
    maxLives: 3,
    score: 0,
    coins: 0,
    distance: 0,
    invulnerableTimer: 0,
    squashX: 1,
    squashY: 1,
    activePowerUps: {
      DOUBLE_JUMP: 0,
      SPEED_DASH: 0,
      COIN_MAGNET: 0,
      SHIELD: 0,
      TIME_WARP: 0,
    },
    animFrame: 0,
    animTimer: 0,
  };
}

export interface PhysicsUpdateResult {
  playerDied: boolean;
  levelCompleted: boolean;
  reachedCheckpoint: boolean;
}

/**
 * Modulate dynamic screen shake and recovery decay on camera
 */
export function triggerDynamicScreenShake(
  camera: Camera | undefined,
  intensity: number,
  decay = 18
) {
  if (!camera) return;
  // Apply shake with priority to higher impact
  camera.shake = Math.max(camera.shake, intensity);
  // Modulate shake decay: heavier impacts have lingering rumble, crisp hits recover quickly
  camera.shakeDecay = decay;
}

export function updatePhysics(
  player: Player,
  input: InputState,
  platforms: Platform[],
  collectibles: Collectible[],
  enemies: Enemy[],
  checkpoints: Checkpoint[],
  portal: ExitPortal | null,
  particles: Particle[],
  floatingTexts: FloatingText[],
  ghostTrails: GhostTrail[],
  dt: number,
  isEndless: boolean,
  camera?: Camera
): PhysicsUpdateResult {
  const result: PhysicsUpdateResult = {
    playerDied: false,
    levelCompleted: false,
    reachedCheckpoint: false,
  };

  // Time warp factor
  const timeFactor = player.activePowerUps.TIME_WARP > 0 ? 0.55 : 1.0;

  // Power-up timers countdown
  (Object.keys(player.activePowerUps) as (keyof typeof player.activePowerUps)[]).forEach((key) => {
    if (player.activePowerUps[key] > 0) {
      player.activePowerUps[key] = Math.max(0, player.activePowerUps[key] - dt);
    }
  });

  // Invulnerability timer
  if (player.invulnerableTimer > 0) {
    player.invulnerableTimer = Math.max(0, player.invulnerableTimer - dt);
  }

  // Dash timers
  if (player.dashCooldown > 0) {
    player.dashCooldown = Math.max(0, player.dashCooldown - dt);
  }

  // Squash & Stretch restoration
  player.squashX += (1 - player.squashX) * 12 * dt;
  player.squashY += (1 - player.squashY) * 12 * dt;

  // Jump buffer input
  if (input.jumpPressed) {
    player.jumpBufferTimer = JUMP_BUFFER_TIME;
  } else if (player.jumpBufferTimer > 0) {
    player.jumpBufferTimer -= dt;
  }

  // Coyote timer
  if (player.onGround) {
    player.coyoteTimer = COYOTE_TIME;
    player.hasDoubleJumped = false;
  } else if (player.coyoteTimer > 0) {
    player.coyoteTimer -= dt;
  }

  // Speed multiplier from Speed Dash power-up
  const speedBoost = player.activePowerUps.SPEED_DASH > 0 ? 1.35 : 1.0;
  const currentMoveSpeed = MOVE_SPEED * speedBoost;

  // --- DASH LOGIC ---
  if (input.dashPressed && player.dashCooldown <= 0 && !player.isDashing) {
    player.isDashing = true;
    player.dashDuration = DASH_TIME;
    player.dashCooldown = player.activePowerUps.SPEED_DASH > 0 ? DASH_COOLDOWN * 0.6 : DASH_COOLDOWN;
    player.dashDirection = player.facing === 'right' ? 1 : -1;
    player.vy = 0; // Freeze vertical during dash
    player.vx = player.dashDirection * DASH_SPEED * (player.activePowerUps.SPEED_DASH > 0 ? 1.25 : 1.0);
    player.squashX = 1.6;
    player.squashY = 0.6;
    sound.playDash();

    // Dash puff particles
    for (let i = 0; i < 8; i++) {
      particles.push({
        x: player.x + (player.facing === 'right' ? 0 : player.width),
        y: player.y + player.height / 2 + (Math.random() - 0.5) * 16,
        vx: -player.dashDirection * (150 + Math.random() * 200),
        vy: (Math.random() - 0.5) * 80,
        size: 3 + Math.random() * 4,
        color: player.activePowerUps.SPEED_DASH > 0 ? '#f59e0b' : '#38bdf8',
        alpha: 0.8,
        life: 0,
        maxLife: 0.25,
        glow: true,
      });
    }
  }

  if (player.isDashing) {
    player.dashDuration -= dt;
    player.vx = player.dashDirection * DASH_SPEED * (player.activePowerUps.SPEED_DASH > 0 ? 1.25 : 1.0);
    player.vy = 0;

    // Leave ghost trails
    if (Math.random() > 0.3) {
      ghostTrails.push({
        x: player.x,
        y: player.y,
        width: player.width,
        height: player.height,
        facing: player.facing,
        alpha: 0.6,
        color: player.activePowerUps.SPEED_DASH > 0 ? '#f59e0b' : '#38bdf8',
      });
    }

    if (player.dashDuration <= 0) {
      player.isDashing = false;
    }
  } else {
    // --- HORIZONTAL MOVEMENT ---
    const targetVx = (input.right ? 1 : 0) - (input.left ? 1 : 0);
    if (targetVx !== 0) {
      player.facing = targetVx > 0 ? 'right' : 'left';
      const accel = player.onGround ? ACCELERATION : AIR_ACCELERATION;
      player.vx += targetVx * accel * dt;
      if (Math.abs(player.vx) > currentMoveSpeed) {
        player.vx = Math.sign(player.vx) * currentMoveSpeed;
      }
    } else {
      // Friction
      const f = player.onGround ? FRICTION : FRICTION * 0.4;
      if (Math.abs(player.vx) <= f * dt) {
        player.vx = 0;
      } else {
        player.vx -= Math.sign(player.vx) * f * dt;
      }
    }

    // --- VERTICAL MOVEMENT & GRAVITY ---
    if (!player.onGround) {
      // Check wall slide
      if (player.onWall && player.vy > 0) {
        player.vy = Math.min(player.vy + GRAVITY * dt, WALL_SLIDE_SPEED);
        // Wall slide friction sparks
        if (Math.random() < 0.3) {
          particles.push({
            x: player.onWall === 'left' ? player.x : player.x + player.width,
            y: player.y + player.height * 0.8,
            vx: (player.onWall === 'left' ? 1 : -1) * (30 + Math.random() * 50),
            vy: -40 - Math.random() * 50,
            size: 2,
            color: '#facc15',
            alpha: 1,
            life: 0,
            maxLife: 0.2,
            glow: true,
          });
        }
      } else {
        player.vy += GRAVITY * dt;
        if (player.vy > MAX_FALL_SPEED) {
          player.vy = MAX_FALL_SPEED;
        }
      }
    }

    // --- JUMP LOGIC (Variable height & Coyote & Wall Jump) ---
    if (player.jumpBufferTimer > 0) {
      if (player.coyoteTimer > 0) {
        // Normal ground jump
        player.vy = JUMP_FORCE;
        player.onGround = false;
        player.coyoteTimer = 0;
        player.jumpBufferTimer = 0;
        player.isJumping = true;
        player.squashX = 0.75;
        player.squashY = 1.35;
        sound.playJump();

        // Jump dust
        spawnGroundDust(player, particles);
      } else if (player.onWall) {
        // Wall jump!
        const pushDir = player.onWall === 'left' ? 1 : -1;
        player.vx = pushDir * WALL_JUMP_X_FORCE;
        player.vy = WALL_JUMP_Y_FORCE;
        player.facing = pushDir > 0 ? 'right' : 'left';
        player.onWall = null;
        player.jumpBufferTimer = 0;
        player.isJumping = true;
        player.squashX = 0.8;
        player.squashY = 1.3;
        sound.playJump();
      } else if (
        (player.canDoubleJump || player.activePowerUps.DOUBLE_JUMP > 0) &&
        !player.hasDoubleJumped
      ) {
        // Double jump!
        player.vy = DOUBLE_JUMP_FORCE;
        player.jumpBufferTimer = 0;
        player.isJumping = true;
        player.squashX = 0.7;
        player.squashY = 1.4;
        player.hasDoubleJumped = true;
        sound.playDoubleJump();

        // Double jump ring particles
        for (let i = 0; i < 10; i++) {
          const angle = (i / 10) * Math.PI * 2;
          particles.push({
            x: player.x + player.width / 2,
            y: player.y + player.height,
            vx: Math.cos(angle) * 120,
            vy: Math.sin(angle) * 60 + 40,
            size: 3,
            color: '#38bdf8',
            alpha: 1,
            life: 0,
            maxLife: 0.35,
            glow: true,
          });
        }
      }
    }

    // Variable jump: release jump to cut short
    if (!input.jump && player.vy < -200 && player.isJumping) {
      player.vy *= 0.55;
      player.isJumping = false;
    }
  }

  // --- UPDATE MOVING & CRUMBLING PLATFORMS ---
  let carriedVx = 0;
  let carriedVy = 0;

  platforms.forEach((plat) => {
    if (plat.type === 'MOVING') {
      plat.progress = (plat.progress ?? 0) + (plat.speed ?? 1.5) * dt * (plat.direction ?? 1) * timeFactor;
      if (plat.progress >= 1) {
        plat.progress = 1;
        plat.direction = -1;
      } else if (plat.progress <= 0) {
        plat.progress = 0;
        plat.direction = 1;
      }
      const prevX = plat.x;
      const prevY = plat.y;
      plat.x = (plat.startX ?? plat.x) + ((plat.targetX ?? plat.x) - (plat.startX ?? plat.x)) * plat.progress;
      plat.y = (plat.startY ?? plat.y) + ((plat.targetY ?? plat.y) - (plat.startY ?? plat.y)) * plat.progress;

      // If player is standing on this platform, carry them
      if (
        player.onGround &&
        player.x + player.width > plat.x &&
        player.x < plat.x + plat.width &&
        Math.abs(player.y + player.height - plat.y) < 4
      ) {
        carriedVx = (plat.x - prevX) / dt;
        carriedVy = (plat.y - prevY) / dt;
      }
    } else if (plat.type === 'CRUMBLING') {
      if (plat.isCrumbling && !plat.isFallen) {
        plat.crumbleTimer = (plat.crumbleTimer ?? 0.6) - dt * timeFactor;
        plat.shakeOffset = (Math.random() - 0.5) * 5;
        if (plat.crumbleTimer <= 0) {
          plat.isFallen = true;
          plat.isCrumbling = false;
          // Spawn crumbling rubble particles
          for (let i = 0; i < 8; i++) {
            particles.push({
              x: plat.x + Math.random() * plat.width,
              y: plat.y + Math.random() * plat.height,
              vx: (Math.random() - 0.5) * 120,
              vy: 60 + Math.random() * 150,
              size: 4 + Math.random() * 4,
              color: '#94a3b8',
              alpha: 1,
              life: 0,
              maxLife: 0.8,
            });
          }
        }
      }
    } else if (plat.type === 'SPRING') {
      if (plat.isCompressed) {
        plat.compressTimer = (plat.compressTimer ?? 0.2) - dt;
        if (plat.compressTimer <= 0) {
          plat.isCompressed = false;
        }
      }
    }
  });

  // --- RESOLVE PLATFORM COLLISIONS (X & Y Axis Separation) ---
  player.x += (player.vx + carriedVx) * dt;

  // X-Collision
  player.onWall = null;
  const playerRectX: Rect = {
    x: player.x,
    y: player.y + 4, // Slight buffer
    width: player.width,
    height: player.height - 8,
  };

  platforms.forEach((plat) => {
    if (plat.isFallen) return;
    if (plat.type === 'ONE_WAY') return; // Pass through sides of one-way platforms
    if (plat.type === 'SPIKE') return; // Spikes tested separately

    const platRect: Rect = { x: plat.x, y: plat.y, width: plat.width, height: plat.height };
    if (checkAABB(playerRectX, platRect)) {
      if (player.isDashing) {
        // High-speed dash impact collision with a solid obstacle
        triggerDynamicScreenShake(camera, 10.5, 24);
        player.isDashing = false;
        spawnSparkles(player.vx > 0 ? plat.x : plat.x + plat.width, player.y + player.height / 2, '#38bdf8', particles, 8);
      }

      if (player.vx > 0) {
        player.x = plat.x - player.width;
        player.vx = 0;
        player.onWall = 'right';
      } else if (player.vx < 0) {
        player.x = plat.x + plat.width;
        player.vx = 0;
        player.onWall = 'left';
      }
    }
  });

  // Y-Movement
  const preLandVy = player.vy;
  player.y += (player.vy + carriedVy) * dt;
  const wasOnGround = player.onGround;
  player.onGround = false;

  const playerRectY: Rect = {
    x: player.x + 2,
    y: player.y,
    width: player.width - 4,
    height: player.height,
  };

  platforms.forEach((plat) => {
    if (plat.isFallen) return;

    const platRect: Rect = { x: plat.x, y: plat.y, width: plat.width, height: plat.height };

    if (plat.type === 'SPIKE') {
      // Spike damage hitbox
      const spikeHitbox: Rect = {
        x: plat.x + 4,
        y: plat.y + 6,
        width: plat.width - 8,
        height: plat.height - 6,
      };
      if (checkAABB(playerRectY, spikeHitbox)) {
        handlePlayerDamage(player, floatingTexts, particles, result, camera);
      }
      return;
    }

    if (plat.type === 'SPRING') {
      if (checkAABB(playerRectY, platRect) && player.vy > 0 && player.y + player.height - player.vy * dt <= plat.y + 12) {
        player.y = plat.y - player.height;
        player.vy = SPRING_FORCE;
        player.onGround = false;
        player.hasDoubleJumped = false;
        plat.isCompressed = true;
        plat.compressTimer = 0.22;
        sound.playSpring();

        // Spring bounce kinetic shockwave
        triggerDynamicScreenShake(camera, 7.5, 22);

        // Star particles
        for (let i = 0; i < 8; i++) {
          particles.push({
            x: plat.x + plat.width / 2 + (Math.random() - 0.5) * plat.width,
            y: plat.y,
            vx: (Math.random() - 0.5) * 160,
            vy: -150 - Math.random() * 200,
            size: 4,
            color: '#fbbf24',
            alpha: 1,
            life: 0,
            maxLife: 0.45,
            glow: true,
          });
        }
      }
      return;
    }

    if (plat.type === 'ONE_WAY') {
      // Can only land on top if moving downwards and previously above
      const prevBottom = player.y + player.height - (player.vy + carriedVy) * dt;
      if (
        player.vy >= 0 &&
        prevBottom <= plat.y + 8 &&
        checkAABB(playerRectY, platRect)
      ) {
        // Ignore landing if holding down
        if (!input.down) {
          player.y = plat.y - player.height;
          player.vy = 0;
          player.onGround = true;
          player.isJumping = false;

          // Landing impact on one-way platform
          if (!wasOnGround) {
            if (preLandVy >= 700) {
              player.squashX = 1.55;
              player.squashY = 0.58;
              spawnGroundDust(player, particles, 10);
              const heavyShake = Math.min(15, (preLandVy / 900) * 14);
              triggerDynamicScreenShake(camera, heavyShake, 14);
            } else if (preLandVy >= 440) {
              player.squashX = 1.32;
              player.squashY = 0.72;
              spawnGroundDust(player, particles, 6);
              const landingShake = ((preLandVy - 400) / 350) * 7.0;
              triggerDynamicScreenShake(camera, landingShake, 20);
            } else {
              player.squashX = 1.15;
              player.squashY = 0.88;
              spawnGroundDust(player, particles, 3);
            }
          }
        }
      }
      return;
    }

    // Regular SOLID, MOVING, CRUMBLING platforms
    if (checkAABB(playerRectY, platRect)) {
      if (player.vy > 0) {
        // Landing on platform
        player.y = plat.y - player.height;
        player.vy = 0;
        player.onGround = true;
        player.isJumping = false;

        // Trigger crumbling
        if (plat.type === 'CRUMBLING' && !plat.isCrumbling) {
          plat.isCrumbling = true;
          plat.crumbleTimer = 0.6;
        }

        // Landing impact squash, dust, and dynamic camera shake
        if (!wasOnGround) {
          if (preLandVy >= 700) {
            // Heavy jump/fall landing: intense screen punch with punchy decay
            player.squashX = 1.6;
            player.squashY = 0.55;
            spawnGroundDust(player, particles, 12);
            const heavyShake = Math.min(16, (preLandVy / 900) * 15);
            triggerDynamicScreenShake(camera, heavyShake, 14);
          } else if (preLandVy >= 440) {
            // Moderate landing jump: proportional shake with quick recovery
            player.squashX = 1.35;
            player.squashY = 0.7;
            spawnGroundDust(player, particles, 6);
            const landingShake = ((preLandVy - 400) / 350) * 7.5;
            triggerDynamicScreenShake(camera, landingShake, 20);
          } else {
            // Soft landing
            player.squashX = 1.15;
            player.squashY = 0.88;
            spawnGroundDust(player, particles, 3);
          }
        }
      } else if (player.vy < 0) {
        // Hitting ceiling
        player.y = plat.y + plat.height;
        player.vy = 0;
        // Mild bump shake when hitting ceiling at high velocity
        if (Math.abs(preLandVy) > 400) {
          triggerDynamicScreenShake(camera, 4.5, 22);
        }
      }
    }
  });

  // --- BOTTOM PIT CHECK ---
  if (player.y > 1000) {
    handlePlayerDamage(player, floatingTexts, particles, result, camera, true);
  }

  // --- DISTANCE & SCORE UPDATE ---
  const currentDist = Math.max(player.distance, Math.floor(player.x / 10));
  if (currentDist > player.distance) {
    const delta = currentDist - player.distance;
    player.distance = currentDist;
    player.score += delta * (player.activePowerUps.SHIELD > 0 ? 2 : 1);
  }

  // --- COLLECTIBLES INTERACTION ---
  const magnetRange = player.activePowerUps.COIN_MAGNET > 0 ? 280 : 0;
  const playerCenter = {
    x: player.x + player.width / 2,
    y: player.y + player.height / 2,
  };

  collectibles.forEach((item) => {
    if (item.collected) return;

    // Magnet pulling logic
    if (magnetRange > 0) {
      const dx = playerCenter.x - (item.x + item.width / 2);
      const dy = playerCenter.y - (item.y + item.height / 2);
      const dist = Math.hypot(dx, dy);
      if (dist < magnetRange && dist > 1) {
        const pullSpeed = 480 * (1 - dist / magnetRange);
        item.x += (dx / dist) * pullSpeed * dt;
        item.y += (dy / dist) * pullSpeed * dt;
      }
    }

    const itemRect: Rect = { x: item.x, y: item.y, width: item.width, height: item.height };
    if (checkAABB(player, itemRect)) {
      item.collected = true;

      if (item.type === 'COIN') {
        player.coins += 1;
        player.score += 100;
        sound.playCoin();
        floatingTexts.push({
          id: Math.random().toString(),
          text: '+100',
          x: item.x,
          y: item.y,
          color: '#fbbf24',
          alpha: 1,
          life: 0,
          vy: -60,
        });
        spawnSparkles(item.x, item.y, '#fbbf24', particles);
      } else if (item.type === 'GEM') {
        player.coins += 5;
        player.score += 500;
        sound.playGem();
        floatingTexts.push({
          id: Math.random().toString(),
          text: '+500 GEM!',
          x: item.x,
          y: item.y,
          color: '#38bdf8',
          alpha: 1,
          life: 0,
          vy: -70,
        });
        spawnSparkles(item.x, item.y, '#38bdf8', particles, 12);
      } else if (item.type === 'HEART') {
        if (player.lives < player.maxLives) {
          player.lives += 1;
        }
        player.score += 250;
        sound.playPowerUp();
        floatingTexts.push({
          id: Math.random().toString(),
          text: '+1 LIFE!',
          x: item.x,
          y: item.y,
          color: '#ef4444',
          alpha: 1,
          life: 0,
          vy: -60,
        });
        spawnSparkles(item.x, item.y, '#ef4444', particles);
      } else {
        // Power-up item collected!
        const pType = item.type as keyof typeof player.activePowerUps;
        player.activePowerUps[pType] = 12; // 12 seconds duration
        player.score += 300;
        sound.playPowerUp();
        floatingTexts.push({
          id: Math.random().toString(),
          text: `${pType.replace('_', ' ')}!`,
          x: item.x - 20,
          y: item.y - 10,
          color: '#a855f7',
          alpha: 1,
          life: 0,
          vy: -80,
        });
        spawnSparkles(item.x, item.y, '#a855f7', particles, 16);
      }
    }
  });

  // --- ENEMIES UPDATE & COLLISION ---
  enemies.forEach((enemy) => {
    if (!enemy.alive) return;

    // Movement
    if (enemy.type === 'PATROL') {
      enemy.x += enemy.vx * dt * timeFactor;
      if (enemy.minX && enemy.x <= enemy.minX) {
        enemy.x = enemy.minX;
        enemy.vx = Math.abs(enemy.vx);
        enemy.facing = 'right';
      } else if (enemy.maxX && enemy.x + enemy.width >= enemy.maxX) {
        enemy.x = enemy.maxX - enemy.width;
        enemy.vx = -Math.abs(enemy.vx);
        enemy.facing = 'left';
      }
    } else if (enemy.type === 'FLYER') {
      enemy.y += enemy.vy * dt * timeFactor;
      if (enemy.minY && enemy.y <= enemy.minY) {
        enemy.y = enemy.minY;
        enemy.vy = Math.abs(enemy.vy);
      } else if (enemy.maxY && enemy.y + enemy.height >= enemy.maxY) {
        enemy.y = enemy.maxY - enemy.height;
        enemy.vy = -Math.abs(enemy.vy);
      }
    }

    const enemyRect: Rect = { x: enemy.x, y: enemy.y, width: enemy.width, height: enemy.height };

    // Check collision with player
    if (checkAABB(player, enemyRect)) {
      // Dashing defeats enemies instantly
      if (player.isDashing) {
        enemy.alive = false;
        player.score += 400;
        sound.playSpring();
        // Dynamic impact shake from dash smash
        triggerDynamicScreenShake(camera, 9.5, 18);
        floatingTexts.push({
          id: Math.random().toString(),
          text: '+400 DASH SMASH!',
          x: enemy.x,
          y: enemy.y,
          color: '#f97316',
          alpha: 1,
          life: 0,
          vy: -80,
        });
        spawnSparkles(enemy.x, enemy.y, '#f97316', particles, 16);
        return;
      }

      // Check if jumping on top of enemy (stomp)
      const prevBottom = player.y + player.height - player.vy * dt;
      if (player.vy > 0 && prevBottom <= enemy.y + 14) {
        // Stomp kill!
        enemy.alive = false;
        player.vy = -550; // High bounce
        player.hasDoubleJumped = false;
        player.score += 300;
        sound.playSpring();
        // Dynamic downward stomp camera punch
        triggerDynamicScreenShake(camera, 8.5, 20);
        floatingTexts.push({
          id: Math.random().toString(),
          text: '+300 STOMP!',
          x: enemy.x,
          y: enemy.y,
          color: '#10b981',
          alpha: 1,
          life: 0,
          vy: -70,
        });
        spawnSparkles(enemy.x, enemy.y, '#10b981', particles, 14);
      } else {
        // Take damage from enemy
        handlePlayerDamage(player, floatingTexts, particles, result, camera);
      }
    }
  });

  // --- CHECKPOINTS ---
  checkpoints.forEach((cp) => {
    if (!cp.activated && checkAABB(player, cp)) {
      cp.activated = true;
      result.reachedCheckpoint = true;
      player.score += 500;
      sound.playCheckpoint();
      triggerDynamicScreenShake(camera, 5.0, 24);
      floatingTexts.push({
        id: Math.random().toString(),
        text: 'CHECKPOINT!',
        x: cp.x - 20,
        y: cp.y - 15,
        color: '#22c55e',
        alpha: 1,
        life: 0,
        vy: -70,
      });
      spawnSparkles(cp.x, cp.y, '#22c55e', particles, 16);
    }
  });

  // --- EXIT PORTAL (Campaign Mode) ---
  if (!isEndless && portal) {
    portal.pulseTimer += dt * 3;
    if (checkAABB(player, portal)) {
      result.levelCompleted = true;
      sound.playLevelClear();
      triggerDynamicScreenShake(camera, 8.0, 16);
    }
  }

  // Animation cycle
  player.animTimer += dt;
  if (player.animTimer >= 0.1) {
    player.animTimer = 0;
    player.animFrame = (player.animFrame + 1) % 4;
  }

  return result;
}

function handlePlayerDamage(
  player: Player,
  floatingTexts: FloatingText[],
  particles: Particle[],
  result: PhysicsUpdateResult,
  camera?: Camera,
  instantPit = false
) {
  if (player.invulnerableTimer > 0 && !instantPit) return;

  // Check if Shield is active
  if (player.activePowerUps.SHIELD > 0 && !instantPit) {
    player.activePowerUps.SHIELD = 0;
    player.invulnerableTimer = 1.2;
    sound.playHurt();
    // Shield shattering kinetic shock
    triggerDynamicScreenShake(camera, 12.0, 15);
    floatingTexts.push({
      id: Math.random().toString(),
      text: 'SHIELD BROKEN!',
      x: player.x - 20,
      y: player.y - 10,
      color: '#ec4899',
      alpha: 1,
      life: 0,
      vy: -60,
    });
    spawnSparkles(player.x, player.y, '#ec4899', particles, 18);
    return;
  }

  // Lose a life
  player.lives -= 1;
  player.invulnerableTimer = 2.0; // 2 seconds invulnerability
  sound.playHurt();

  // Heavy screen shake on collision/damage with lower decay for impact trauma
  triggerDynamicScreenShake(camera, instantPit ? 18.0 : 16.0, instantPit ? 8 : 10);

  // Screen shake & damage effect
  floatingTexts.push({
    id: Math.random().toString(),
    text: '-1 LIFE!',
    x: player.x,
    y: player.y - 15,
    color: '#ef4444',
    alpha: 1,
    life: 0,
    vy: -60,
  });
  spawnSparkles(player.x, player.y, '#ef4444', particles, 12);

  if (player.lives <= 0 || instantPit) {
    result.playerDied = true;
    sound.playGameOver();
  }
}

function spawnGroundDust(player: Player, particles: Particle[], count = 6) {
  for (let i = 0; i < count; i++) {
    particles.push({
      x: player.x + player.width / 2 + (Math.random() - 0.5) * player.width,
      y: player.y + player.height,
      vx: (Math.random() - 0.5) * (count > 6 ? 120 : 80),
      vy: -20 - Math.random() * (count > 6 ? 60 : 40),
      size: 2 + Math.random() * (count > 6 ? 4 : 3),
      color: '#cbd5e1',
      alpha: 0.8,
      life: 0,
      maxLife: count > 6 ? 0.35 : 0.25,
    });
  }
}

function spawnSparkles(x: number, y: number, color: string, particles: Particle[], count = 8) {
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 + Math.random() * 0.4;
    const speed = 70 + Math.random() * 120;
    particles.push({
      x: x + 10,
      y: y + 10,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: 3 + Math.random() * 3,
      color,
      alpha: 1,
      life: 0,
      maxLife: 0.45,
      glow: true,
      shape: 'star',
    });
  }
}
