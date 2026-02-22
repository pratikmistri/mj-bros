import { GAME, PLAYER, ENEMIES, COLLECTIBLES, COLORS } from '../config/constants.js';
import { Player } from '../entities/Player.js';
import { Zombie } from '../entities/Zombie.js';
import { Ghost } from '../entities/Ghost.js';
import { Werewolf } from '../entities/Werewolf.js';
import { LevelBuilder } from '../systems/LevelBuilder.js';
import { HUD } from '../systems/HUD.js';

export class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  create() {
    // Audio
    this.sfx = this.game.soundManager;
    this.sfx.resume();
    this.sfx.startMusic();

    // M key for mute
    this.input.keyboard.addKey('M').on('down', () => {
      const muted = this.sfx.toggleMute();
      if (this.hud) this.hud.updateMuteState(muted);
    });

    // World bounds
    this.physics.world.setBounds(0, 0, GAME.WORLD_WIDTH, GAME.WORLD_HEIGHT);

    // Build level
    this.levelBuilder = new LevelBuilder(this);
    this.levelBuilder.build();

    // Create player
    this.player = new Player(this, PLAYER.RESPAWN_X, 400);

    // Platform collisions
    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.player, this.bricks, this.handleBrickCollision, null, this);

    // Camera
    this.cameras.main.setBounds(0, 0, GAME.WORLD_WIDTH, GAME.WORLD_HEIGHT);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);


    // Create collectibles
    this.levelBuilder.createCollectibles();
    this.setupCollectibleOverlaps();

    // Create enemies
    this.createEnemies();

    // Create boss
    this.bossActive = false;
    this.werewolf = null;

    // Victory zone
    const vz = this.levelBuilder.getVictoryZone();
    this.victoryZone = this.add.zone(vz.x, vz.y, vz.width, vz.height);
    this.physics.add.existing(this.victoryZone, true);

    // HUD
    this.hud = new HUD(this);

    // Boss defeated event
    this.events.on('bossDefeated', this.onBossDefeated, this);

    // Hat throw
    this.activeHat = null;
    this.events.on('playerThrow', this.createHatProjectile, this);
  }

  createEnemies() {
    // Zombies
    this.zombies = [];
    this.zombieGroup = this.physics.add.group();

    const zombieData = [
      { x: 500, y: 530, patrol: 80 },
      { x: 800, y: 530, patrol: 100 },
      { x: 1100, y: 530, patrol: 60 },
      { x: 1350, y: 530, patrol: 80 },
      { x: 1750, y: 530, patrol: 60 },
      { x: 2300, y: 530, patrol: 100 },
      { x: 2600, y: 530, patrol: 80 },
      { x: 3000, y: 530, patrol: 80 },
      { x: 3450, y: 530, patrol: 100 },
      { x: 3900, y: 530, patrol: 80 },
      { x: 4150, y: 530, patrol: 60 },
      { x: 4500, y: 530, patrol: 100 }
    ];

    for (const z of zombieData) {
      const zombie = new Zombie(this, z.x, z.y, z.patrol);
      this.zombies.push(zombie);
      this.zombieGroup.add(zombie);
    }

    this.physics.add.collider(this.zombieGroup, this.platforms);
    this.physics.add.collider(this.zombieGroup, this.bricks);

    // Ghosts
    this.ghosts = [];
    this.ghostGroup = this.physics.add.group({ allowGravity: false });

    const ghostData = [
      { x: 2000, y: 320 },
      { x: 2400, y: 280 },
      { x: 3200, y: 300 },
      { x: 3600, y: 250 },
      { x: 4100, y: 280 },
      { x: 4500, y: 300 }
    ];

    for (const g of ghostData) {
      const ghost = new Ghost(this, g.x, g.y);
      this.ghosts.push(ghost);
      this.ghostGroup.add(ghost);
    }

    // Enemy-player overlaps
    this.physics.add.overlap(this.player, this.zombieGroup, this.handleEnemyCollision, null, this);
    this.physics.add.overlap(this.player, this.ghostGroup, this.handleGhostCollision, null, this);
  }

  setupCollectibleOverlaps() {
    // Notes
    this.physics.add.overlap(this.player, this.notes, (player, note) => {
      note.destroy();
      player.addScore(COLLECTIBLES.NOTE.SCORE);
      this.collectEffect(note.x, note.y);
    });

    // White gloves
    this.physics.add.overlap(this.player, this.gloveCollectibles, (player, glove) => {
      glove.destroy();
      player.addScore(COLLECTIBLES.GLOVE.SCORE);
      this.collectEffect(glove.x, glove.y);
    });

    // Microphone (grow power-up)
    this.physics.add.overlap(this.player, this.microphoneCollectibles, (player, mic) => {
      mic.destroy();
      player.powerUpGrow();
      this.sfx.playPowerUp();
      this.collectEffect(mic.x, mic.y);
    });

    // Star glove (invincibility)
    this.physics.add.overlap(this.player, this.starGloveCollectibles, (player, sg) => {
      sg.destroy();
      player.powerUpInvincible();
      this.sfx.playPowerUp();
      this.sfx.startInvincibility();
      this.collectEffect(sg.x, sg.y);
    });
  }

  collectEffect(x, y) {
    // Sparkle burst
    const particles = this.add.particles(x, y, 'sparkle', {
      speed: { min: 50, max: 150 },
      angle: { min: 0, max: 360 },
      scale: { start: 1.5, end: 0 },
      lifespan: 400,
      quantity: 8
    });
    this.time.delayedCall(500, () => particles.destroy());

    this.sfx.playCollect();

    // Score popup text
    const popup = this.add.text(x, y - 20, '+', {
      fontSize: '16px',
      fill: '#ffd700',
      stroke: '#000',
      strokeThickness: 2
    }).setOrigin(0.5);

    this.tweens.add({
      targets: popup,
      y: y - 60,
      alpha: 0,
      duration: 800,
      onComplete: () => popup.destroy()
    });
  }

  createHatProjectile(x, y, direction) {
    if (this.activeHat) return;

    const hat = this.physics.add.sprite(x + direction * 20, y - 10, 'hat', 0);
    hat.play('hat-spin');
    hat.setDepth(5);
    hat.body.setAllowGravity(false);
    hat.setVelocityX(direction * PLAYER.HAT_THROW_SPEED);
    hat.setData('dir', direction);
    hat.setData('phase', 'outbound');
    hat.setData('timer', 0);
    hat.setData('startTime', this.time.now);
    this.activeHat = hat;

    // Enemy overlaps
    this.physics.add.overlap(hat, this.zombieGroup, (h, zombie) => {
      if (!zombie.isDead) {
        const score = zombie.kill();
        if (score) this.player.addScore(score);
        this.sfx.playStomp();
        this.collectEffect(h.x, h.y);
        this.destroyHat();
      }
    });

    this.physics.add.overlap(hat, this.ghostGroup, (h, ghost) => {
      if (!ghost.isDead) {
        const score = ghost.kill();
        if (score) this.player.addScore(score);
        this.sfx.playStomp();
        this.collectEffect(h.x, h.y);
        this.destroyHat();
      }
    });

    if (this.werewolf && this.werewolf.active) {
      this.physics.add.overlap(hat, this.werewolf, (h, ww) => {
        if (!ww.isDead) {
          const dead = ww.takeDamage();
          if (dead) this.player.addScore(ENEMIES.WEREWOLF.SCORE);
          this.sfx.playStomp();
          this.collectEffect(h.x, h.y);
          this.destroyHat();
        }
      });
    }

    // Platform/brick collision
    this.physics.add.collider(hat, this.platforms, () => this.destroyHat());
    this.physics.add.collider(hat, this.bricks, () => this.destroyHat());

    // Safety auto-destroy
    this.time.delayedCall(PLAYER.HAT_THROW_LIFETIME, () => {
      if (this.activeHat === hat) this.destroyHat();
    });
  }

  updateHat() {
    if (!this.activeHat || !this.activeHat.active) return;

    const hat = this.activeHat;
    const delta = this.game.loop.delta;
    const timer = hat.getData('timer') + delta;
    hat.setData('timer', timer);

    const phase = hat.getData('phase');
    const dir = hat.getData('dir');

    if (phase === 'outbound') {
      // Decelerate from HAT_THROW_SPEED to 0 over HAT_THROW_DECEL_TIME ms
      const progress = Math.min(timer / PLAYER.HAT_THROW_DECEL_TIME, 1);
      const speed = PLAYER.HAT_THROW_SPEED * (1 - progress);
      hat.setVelocityX(dir * speed);
      hat.setVelocityY(0);

      if (progress >= 1) {
        hat.setData('phase', 'return');
      }
    } else if (phase === 'return') {
      // Home toward player's current position
      const dx = this.player.x - hat.x;
      const dy = this.player.y - hat.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > 5) {
        hat.setVelocityX((dx / dist) * PLAYER.HAT_RETURN_SPEED);
        hat.setVelocityY((dy / dist) * PLAYER.HAT_RETURN_SPEED);
      }

      // Catch: close enough to player and min flight time elapsed
      const flightTime = this.time.now - hat.getData('startTime');
      if (dist < 30 && flightTime > PLAYER.HAT_MIN_FLIGHT) {
        this.destroyHat();
      }
    }
  }

  destroyHat() {
    if (this.activeHat) {
      this.activeHat.destroy();
      this.activeHat = null;
    }
  }

  handleEnemyCollision(player, zombie) {
    if (player.isDead || zombie.isDead) return;

    // Check if player can kill on contact (moonwalk/invincible)
    if (player.canKill()) {
      const score = zombie.kill();
      if (score) player.addScore(score);
      return;
    }

    // Stomp check: player falling and above enemy midpoint
    if (player.body.velocity.y > 0 && player.body.bottom < zombie.body.center.y) {
      const score = zombie.kill();
      if (score) player.addScore(score);
      player.stompBounce();
      this.sfx.playStomp();
      return;
    }

    // Player takes damage
    player.takeDamage();
  }

  handleGhostCollision(player, ghost) {
    if (player.isDead || ghost.isDead) return;

    // Ghosts can only be killed by moonwalk or invincibility
    if (player.canKill()) {
      const score = ghost.kill();
      if (score) player.addScore(score);
      this.sfx.playStomp();
      return;
    }

    // Player takes damage (no stomp allowed on ghosts)
    player.takeDamage();
  }

  handleWerewolfCollision(player, werewolf) {
    if (player.isDead || werewolf.isDead) return;

    // Can kill with moonwalk or invincibility
    if (player.canKill()) {
      const dead = werewolf.takeDamage();
      if (dead) player.addScore(ENEMIES.WEREWOLF.SCORE);
      return;
    }

    // Stomp
    if (player.body.velocity.y > 0 && player.body.bottom < werewolf.body.center.y) {
      const dead = werewolf.takeDamage();
      if (dead) player.addScore(ENEMIES.WEREWOLF.SCORE);
      player.stompBounce();
      this.sfx.playStomp();
      return;
    }

    player.takeDamage();
  }

  spawnBoss() {
    if (this.bossActive) return;
    this.bossActive = true;

    const spawn = this.levelBuilder.getWerewolfSpawn();
    this.werewolf = new Werewolf(this, spawn.x, spawn.y);
    this.physics.add.collider(this.werewolf, this.platforms);
    this.physics.add.overlap(this.player, this.werewolf, this.handleWerewolfCollision, null, this);

    // Hat-werewolf overlap will be set up dynamically in createHatProjectile
    this.hud.showBossBar();
    this.cameras.main.shake(500, 0.015);
    this.sfx.playBossRoar();
  }

  onBossDefeated() {
    this.hud.hideBossBar();
    this.sfx.playVictory();

    // Show victory zone indicator
    const vz = this.levelBuilder.getVictoryZone();
    const arrow = this.add.text(vz.x, vz.y - 40, 'EXIT >', {
      fontSize: '20px',
      fill: '#ffd700',
      stroke: '#000',
      strokeThickness: 3
    }).setOrigin(0.5);

    this.tweens.add({
      targets: arrow,
      alpha: 0.3,
      duration: 500,
      yoyo: true,
      repeat: -1
    });

    // Victory zone overlap
    this.physics.add.overlap(this.player, this.victoryZone, () => {
      this.sfx.stopMusic();
      this.scene.start('GameOverScene', {
        victory: true,
        score: this.player.score
      });
    });
  }

  handleBrickCollision(player, brick) {
    // Only break if player is moving upward and head is near brick bottom
    if (player.body.velocity.y < 0 && player.body.top <= brick.body.bottom + 4) {
      this.breakBrick(brick);
      player.setVelocityY(50);
    }
  }

  breakBrick(brick) {
    const bx = brick.x;
    const by = brick.y;
    const noteCount = brick.getData('notes') || 0;

    // Brick particle burst
    const particles = this.add.particles(bx, by, 'brick-particle', {
      speed: { min: 80, max: 200 },
      angle: { min: 200, max: 340 },
      gravityY: 400,
      scale: { start: 1.5, end: 0.5 },
      lifespan: 800,
      quantity: 12
    });
    this.time.delayedCall(900, () => particles.destroy());

    // Camera shake
    this.cameras.main.shake(100, 0.005);

    // Spawn falling music notes
    for (let i = 0; i < noteCount; i++) {
      this.time.delayedCall(i * 60, () => {
        const note = this.notes.create(bx, by - 10, 'note', 0);
        note.play('note-spin');
        note.body.setSize(20, 20);
        note.body.setAllowGravity(true);
        note.setVelocityY(Phaser.Math.Between(-250, -150));
        note.setVelocityX(Phaser.Math.Between(-100, 100));
        note.setBounce(0.4);
        this.physics.add.collider(note, this.platforms);
        this.physics.add.collider(note, this.bricks);

        // Auto-fade and destroy after 8 seconds
        this.time.delayedCall(7000, () => {
          if (note.active) {
            this.tweens.add({
              targets: note,
              alpha: 0,
              duration: 1000,
              onComplete: () => { if (note.active) note.destroy(); }
            });
          }
        });
      });
    }

    this.sfx.playBrickBreak();

    // Destroy the brick
    brick.destroy();
  }

  update(time, delta) {
    if (!this.player) return;

    this.player.update(time);

    // Update zombies
    for (const zombie of this.zombies) {
      if (zombie.active) zombie.update();
    }

    // Update ghosts
    for (const ghost of this.ghosts) {
      if (ghost.active) ghost.update(this.player);
    }

    // Update werewolf
    if (this.werewolf && this.werewolf.active) {
      this.werewolf.update(this.player, time, delta);
      this.hud.updateBossHP(this.werewolf.hp, ENEMIES.WEREWOLF.HP);
    }

    // Update hat projectile
    this.updateHat();

    // HUD updates
    this.hud.updateMoonwalkCooldown(this.player.moonwalkCooldown);
    this.hud.updateThrowCooldown(this.activeHat !== null);

    // Boss trigger - when player enters section 4
    if (this.player.x > 5000 && !this.bossActive) {
      this.spawnBoss();
    }

    // Clean up destroyed enemies from arrays
    this.zombies = this.zombies.filter(z => z.active);
    this.ghosts = this.ghosts.filter(g => g.active);
  }
}
