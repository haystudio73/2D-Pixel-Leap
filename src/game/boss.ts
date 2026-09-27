import { MiniBoss, BossType, BossProjectile, Player, Platform, Particle, FloatingText, Collectible, BiomeType, PowerUpType } from './types';
import { sound } from './audio';

export function createMiniBoss(biome: BiomeType, playerX: number, playerY: number): MiniBoss {
  const bossArchetypes: { type: BossType; name: string; title: string; hp: number; glow: string; core: string }[] = [
    {
      type: 'CYBER_DREADNOUGHT',
      name: 'NEXUS DREADNOUGHT',
      title: 'CYBER ASSAULT MECHA',
      hp: 6,
      glow: '#06b6d4',
      core: '#ec4899',
    },
    {
      type: 'CRYSTAL_GOLEM',
      name: 'PRISM BEHEMOTH',
      title: 'SUBTERRANEAN TITAN',
      hp: 7,
      glow: '#34d399',
      core: '#38bdf8',
    },
    {
      type: 'MAGMA_WYRM',
      name: 'MAGMA PYRO-DRAKE',
      title: 'VOLCANIC OVERLORD',
      hp: 8,
      glow: '#f97316',
      core: '#fbbf24',
    },
    {
      type: 'ASTRAL_SENTINEL',
      name: 'ASTRAL CHRONOS',
      title: 'CELESTIAL SENTINEL',
      hp: 8,
      glow: '#c084fc',
      core: '#f43f5e',
    },
  ];

  // Match biome or pick tailored boss
  let choice = bossArchetypes[0];
  if (biome === 'CRYSTAL_CAVERN') choice = bossArchetypes[1];
  else if (biome === 'VOLCANIC_CORE') choice = bossArchetypes[2];
  else if (biome === 'STARLIGHT_CITADEL') choice = bossArchetypes[3];
  else {
    // Or random for variety in Endless
    choice = bossArchetypes[Math.floor(Math.random() * bossArchetypes.length)];
  }

  return {
    id: `miniboss_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    type: choice.type,
    name: choice.name,
    title: choice.title,
    x: playerX + 550,
    y: playerY - 220,
    vx: -180,
    vy: 0,
    width: 68,
    height: 68,
    hp: choice.hp,
    maxHp: choice.hp,
    state: 'ENTERING',
    stateTimer: 2.2,
    attackTimer: 1.8,
    attackCooldown: 2.4,
    chargeTargetX: playerX,
    chargeTargetY: playerY,
    invulnerableTimer: 0,
    projectiles: [],
    alive: true,
    facing: 'left',
    glowColor: choice.glow,
    coreColor: choice.core,
  };
}

export interface BossUpdateResult {
  playerHit: boolean;
  bossDefeated: boolean;
  scoreGained: number;
  drops: Collectible[];
}

export function updateMiniBoss(
  boss: MiniBoss,
  player: Player,
  particles: Particle[],
  floatingTexts: FloatingText[],
  dt: number,
  totalTime: number
): BossUpdateResult {
  const result: BossUpdateResult = {
    playerHit: false,
    bossDefeated: false,
    scoreGained: 0,
    drops: [],
  };

  if (!boss.alive) {
    if (boss.state === 'DEFEATED') {
      boss.defeatTimer = (boss.defeatTimer ?? 0) + dt;
      if (boss.defeatTimer > 2.5) {
        boss.stateTimer = 0;
      }
    }
    return result;
  }

  // Invulnerability timer decay
  if (boss.invulnerableTimer > 0) {
    boss.invulnerableTimer = Math.max(0, boss.invulnerableTimer - dt);
  }

  boss.stateTimer -= dt;
  boss.facing = boss.x > player.x ? 'left' : 'right';

  // State Machine AI
  switch (boss.state) {
    case 'ENTERING': {
      const targetX = player.x + 240;
      const targetY = player.y - 70;
      boss.x += (targetX - boss.x) * 3.5 * dt;
      boss.y += (targetY - boss.y) * 3.5 * dt;

      if (boss.stateTimer <= 0 || Math.abs(boss.x - targetX) < 30) {
        boss.state = 'HOVERING';
        boss.stateTimer = 3.2;
        boss.attackTimer = 1.2;
      }
      break;
    }

    case 'HOVERING': {
      // Smooth hovering offset relative to player
      const hoverTargetX = player.x + (boss.facing === 'left' ? 220 : -220);
      const hoverTargetY = player.y - 65 + Math.sin(totalTime * 3.5) * 45;

      boss.x += (hoverTargetX - boss.x) * 2.8 * dt;
      boss.y += (hoverTargetY - boss.y) * 2.8 * dt;

      boss.attackTimer -= dt;
      if (boss.attackTimer <= 0) {
        // Decide next attack (Fire Projectiles or Charge Rush)
        if (Math.random() < 0.6) {
          boss.state = 'ATTACKING';
          boss.stateTimer = 1.4;
          // Spawn Targeted Plasma Projectiles
          fireBossProjectiles(boss, player);
        } else {
          boss.state = 'CHARGING';
          boss.stateTimer = 1.8;
          boss.chargeTargetX = player.x + (player.vx * 0.4);
          boss.chargeTargetY = player.y;
        }
      }
      break;
    }

    case 'ATTACKING': {
      // Gentle recoil during attack
      boss.x += (boss.facing === 'left' ? 40 : -40) * dt;
      boss.y += Math.sin(totalTime * 5) * 20 * dt;

      if (boss.stateTimer <= 0) {
        boss.state = 'HOVERING';
        boss.stateTimer = 2.8;
        boss.attackTimer = 2.0;
      }
      break;
    }

    case 'CHARGING': {
      if (boss.stateTimer > 1.2) {
        // Telegraphing phase: glowing charge up
        const t = (boss.stateTimer - 1.2) / 0.6;
        for (let i = 0; i < 2; i++) {
          particles.push({
            x: boss.x + boss.width / 2 + (Math.random() - 0.5) * boss.width,
            y: boss.y + boss.height / 2 + (Math.random() - 0.5) * boss.height,
            vx: (Math.random() - 0.5) * 80,
            vy: (Math.random() - 0.5) * 80,
            size: 3,
            color: boss.glowColor,
            alpha: 0.8,
            life: 0,
            maxLife: 0.35,
          });
        }
      } else {
        // Rush towards player target
        const dx = boss.chargeTargetX - boss.x;
        const dy = boss.chargeTargetY - boss.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const speed = 480;

        boss.x += (dx / dist) * speed * dt;
        boss.y += (dy / dist) * speed * dt;

        // Spawn speed trails
        particles.push({
          x: boss.x + boss.width / 2,
          y: boss.y + boss.height / 2,
          vx: -(dx / dist) * 100,
          vy: -(dy / dist) * 100,
          size: 4,
          color: boss.coreColor,
          alpha: 0.7,
          life: 0,
          maxLife: 0.3,
        });

        if (boss.stateTimer <= 0 || dist < 40) {
          // Enter vulnerable recovery state
          boss.state = 'VULNERABLE';
          boss.stateTimer = 1.6;
        }
      }
      break;
    }

    case 'VULNERABLE': {
      // Boss is stunned and drifting slightly
      boss.y += Math.sin(totalTime * 2) * 10 * dt;
      if (boss.stateTimer <= 0) {
        boss.state = 'HOVERING';
        boss.stateTimer = 3.0;
        boss.attackTimer = 1.5;
      }
      break;
    }
  }

  // Update Boss Projectiles
  for (let i = boss.projectiles.length - 1; i >= 0; i--) {
    const proj = boss.projectiles[i];
    proj.x += proj.vx * dt;
    proj.y += proj.vy * dt;
    proj.life += dt;

    // Add trailing particle
    if (Math.random() < 0.4) {
      particles.push({
        x: proj.x,
        y: proj.y,
        vx: -proj.vx * 0.1,
        vy: -proj.vy * 0.1,
        size: 2,
        color: proj.glowColor,
        alpha: 0.6,
        life: 0,
        maxLife: 0.25,
      });
    }

    // Check collision with player
    const pCenterX = player.x + player.width / 2;
    const pCenterY = player.y + player.height / 2;
    const pDist = Math.hypot(pCenterX - proj.x, pCenterY - proj.y);

    if (pDist < proj.radius + player.width * 0.4) {
      // Hit player
      result.playerHit = true;
      boss.projectiles.splice(i, 1);

      // Hit effect
      for (let p = 0; p < 8; p++) {
        particles.push({
          x: proj.x,
          y: proj.y,
          vx: (Math.random() - 0.5) * 200,
          vy: (Math.random() - 0.5) * 200,
          size: 3,
          color: proj.color,
          alpha: 1,
          life: 0,
          maxLife: 0.4,
        });
      }
      continue;
    }

    // Expire projectile
    if (proj.life >= proj.maxLife) {
      boss.projectiles.splice(i, 1);
    }
  }

  // Check Player vs Boss Hitbox Collision
  const bossRect = { x: boss.x + 8, y: boss.y + 8, width: boss.width - 16, height: boss.height - 16 };
  const playerRect = { x: player.x, y: player.y, width: player.width, height: player.height };

  const isIntersecting =
    playerRect.x < bossRect.x + bossRect.width &&
    playerRect.x + playerRect.width > bossRect.x &&
    playerRect.y < bossRect.y + bossRect.height &&
    playerRect.y + playerRect.height > bossRect.y;

  if (isIntersecting && boss.invulnerableTimer <= 0) {
    const isStomping = player.vy > 0 && player.y + player.height <= boss.y + 36;
    const isDashSmashing = player.isDashing || player.activePowerUps.SPEED_DASH > 0 || player.activePowerUps.SHIELD > 0;

    if (isStomping || isDashSmashing || boss.state === 'VULNERABLE') {
      // Player damages the boss!
      const damage = isDashSmashing ? 2 : 1;
      boss.hp = Math.max(0, boss.hp - damage);
      boss.invulnerableTimer = 0.65;
      sound.playBossHit();

      // Bounce player up
      player.vy = -540;
      player.onGround = false;
      player.hasDoubleJumped = false;
      player.canDoubleJump = true;

      // Damage visual effects
      const text = damage > 1 ? `CRITICAL DASH! -${damage} HP` : `STOMP HIT! -1 HP`;
      floatingTexts.push({
        id: `boss_hit_${Date.now()}`,
        text,
        x: boss.x + boss.width / 2,
        y: boss.y - 12,
        color: '#facc15',
        alpha: 1,
        life: 0,
        vy: -70,
      });

      for (let p = 0; p < 16; p++) {
        particles.push({
          x: boss.x + boss.width / 2,
          y: boss.y + boss.height / 2,
          vx: (Math.random() - 0.5) * 320,
          vy: (Math.random() - 0.5) * 320,
          size: 4,
          color: p % 2 === 0 ? boss.coreColor : '#ffffff',
          alpha: 1,
          life: 0,
          maxLife: 0.5,
        });
      }

      // Check Boss Defeat
      if (boss.hp <= 0) {
        boss.alive = false;
        boss.state = 'DEFEATED';
        result.bossDefeated = true;
        result.scoreGained = 3000;
        sound.playBossDefeat();

        floatingTexts.push({
          id: `boss_defeated_${Date.now()}`,
          text: `👑 TITAN DEFEATED! +3000 PTS`,
          x: boss.x + boss.width / 2,
          y: boss.y - 30,
          color: '#34d399',
          alpha: 1,
          life: 0,
          vy: -55,
        });

        // Spawn shower of reward Gems & Power-Ups
        const powerupDrops: PowerUpType[] = ['SHIELD', 'COIN_MAGNET', 'DOUBLE_JUMP', 'SPEED_DASH', 'TIME_WARP'];
        const chosenPowerup = powerupDrops[Math.floor(Math.random() * powerupDrops.length)];

        // Legendary Power-Up Drop
        result.drops.push({
          id: `boss_drop_pwr_${Date.now()}`,
          x: boss.x + boss.width / 2 - 12,
          y: boss.y + 10,
          width: 24,
          height: 24,
          type: chosenPowerup,
          collected: false,
          animOffset: 0,
        });

        // 6 High-Value Gems
        for (let g = 0; g < 6; g++) {
          result.drops.push({
            id: `boss_drop_gem_${Date.now()}_${g}`,
            x: boss.x - 40 + g * 25,
            y: boss.y + (g % 2 === 0 ? -15 : 20),
            width: 18,
            height: 18,
            type: 'GEM',
            collected: false,
            animOffset: g * 0.15,
          });
        }
      }
    } else {
      // Player takes damage from Boss body
      result.playerHit = true;
    }
  }

  return result;
}

function fireBossProjectiles(boss: MiniBoss, player: Player) {
  sound.playBossShoot();
  const count = boss.type === 'MAGMA_WYRM' ? 3 : 2;
  const startX = boss.facing === 'left' ? boss.x : boss.x + boss.width;
  const startY = boss.y + boss.height * 0.45;

  for (let i = 0; i < count; i++) {
    const angleSpread = (i - (count - 1) / 2) * 0.22;
    const dx = player.x - startX;
    const dy = player.y - startY;
    const baseAngle = Math.atan2(dy, dx);
    const finalAngle = baseAngle + angleSpread;
    const speed = 260 + Math.random() * 50;

    boss.projectiles.push({
      id: `proj_${Date.now()}_${i}`,
      x: startX,
      y: startY,
      vx: Math.cos(finalAngle) * speed,
      vy: Math.sin(finalAngle) * speed,
      radius: 7,
      color: boss.coreColor,
      glowColor: boss.glowColor,
      life: 0,
      maxLife: 3.5,
    });
  }
}
