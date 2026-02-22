import { PLAYER } from '../config/constants.js';
import VirtualInput from '../systems/VirtualInput.js';

export class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'mj', 0);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setScale(PLAYER.SCALE);
    this.body.setSize(PLAYER.HITBOX_WIDTH, PLAYER.HITBOX_HEIGHT);
    this.body.setOffset(PLAYER.HITBOX_OFFSET_X, PLAYER.HITBOX_OFFSET_Y);
    this.setBounce(PLAYER.BOUNCE);
    this.setCollideWorldBounds(false);
    this.setDepth(10);

    // State
    this.lives = PLAYER.START_LIVES;
    this.score = 0;
    this.isHurt = false;
    this.isDead = false;
    this.isMoonwalking = false;
    this.moonwalkCooldown = 0;
    this.isInvincible = false;
    this.isPoweredUp = false; // microphone grow
    this.facingRight = true;

    // Controls
    this.cursors = scene.input.keyboard.createCursorKeys();
    this.jumpKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
    this.moonwalkKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);
    this.throwKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.C);

    // Hat throw state
    this.throwCooldown = 0;
    this.isThrowing = false;

    // Idle dance state
    this.idleTime = 0;

    // Sparkle emitter for moonwalk
    this.sparkleEmitter = scene.add.particles(0, 0, 'sparkle-white', {
      speed: { min: 20, max: 60 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.5, end: 0 },
      lifespan: 400,
      frequency: -1,
      quantity: 3
    });
    this.sparkleEmitter.stop();

    // Stardust trail emitter for jumping
    this.stardustEmitter = scene.add.particles(0, 0, 'stardust', {
      speed: { min: 10, max: 40 },
      angle: { min: 200, max: 340 },
      scale: { start: 0.6, end: 0 },
      alpha: { start: 0.8, end: 0 },
      lifespan: 350,
      frequency: 40,
      quantity: 1
    });
    this.stardustEmitter.stop();
  }

  update(time) {
    if (this.isDead) return;

    // Fall into pit
    if (this.y > 650) {
      this.die();
      return;
    }

    // Moonwalk cooldown
    if (this.moonwalkCooldown > 0) {
      this.moonwalkCooldown -= this.scene.game.loop.delta;
    }

    // Throw cooldown
    if (this.throwCooldown > 0) {
      this.throwCooldown -= this.scene.game.loop.delta;
    }

    if (this.isMoonwalking) {
      this.updateMoonwalk();
      return;
    }

    if (this.isHurt) return;

    // Movement
    const onGround = this.body.blocked.down || this.body.touching.down;

    if (this.cursors.left.isDown || VirtualInput.left) {
      this.setVelocityX(-PLAYER.SPEED);
      this.facingRight = false;
      this.setFlipX(true);
      if (onGround && !this.isThrowing) this.play('mj-walk', true);
      this.idleTime = 0;
    } else if (this.cursors.right.isDown || VirtualInput.right) {
      this.setVelocityX(PLAYER.SPEED);
      this.facingRight = true;
      this.setFlipX(false);
      if (onGround && !this.isThrowing) this.play('mj-walk', true);
      this.idleTime = 0;
    } else {
      this.setVelocityX(0);
      if (onGround && !this.isThrowing) {
        this.idleTime += this.scene.game.loop.delta;
        if (this.idleTime >= 3000) {
          this.play('mj-idle-dance', true);
        } else {
          this.play('mj-idle', true);
        }
      }
    }

    // Jump
    if ((this.cursors.up.isDown || this.cursors.space.isDown || this.jumpKey.isDown || VirtualInput.jump) && onGround) {
      this.setVelocityY(PLAYER.JUMP_VELOCITY);
      if (!this.isThrowing) this.play('mj-jump', true);
      if (this.scene.game.soundManager) this.scene.game.soundManager.playJump();
      this.idleTime = 0;
      this.stardustEmitter.start();
    }

    // Stardust trail while airborne
    if (!onGround) {
      this.stardustEmitter.setPosition(this.x, this.y + this.displayHeight / 2);
      if (!this.isThrowing) this.play('mj-jump', true);
    } else if (this.stardustEmitter.emitting) {
      this.stardustEmitter.stop();
    }

    // Moonwalk trigger
    const virtualMoonwalk = VirtualInput.moonwalk;
    if (virtualMoonwalk) VirtualInput.moonwalk = false;
    if ((Phaser.Input.Keyboard.JustDown(this.moonwalkKey) || virtualMoonwalk) && onGround && this.moonwalkCooldown <= 0) {
      this.idleTime = 0;
      this.startMoonwalk();
    }

    // Hat throw trigger
    const virtualThrow = VirtualInput.throwHat;
    if (virtualThrow) VirtualInput.throwHat = false;
    if ((Phaser.Input.Keyboard.JustDown(this.throwKey) || virtualThrow) && onGround && this.throwCooldown <= 0 && !this.isThrowing) {
      this.idleTime = 0;
      this.throwHat();
    }
  }

  startMoonwalk() {
    if (this.scene.game.soundManager) this.scene.game.soundManager.playMoonwalk();
    this.isMoonwalking = true;
    this.moonwalkTimer = PLAYER.MOONWALK_DURATION;
    this.moonwalkCooldown = PLAYER.MOONWALK_COOLDOWN;

    // Keep sprite facing the direction MJ was facing (slides backwards)
    this.setFlipX(!this.facingRight);
    this.play('mj-moonwalk', true);

    // Moonwalk moves BACKWARDS (opposite of facing direction)
    const dir = this.facingRight ? -1 : 1;
    this.setVelocityX(dir * PLAYER.MOONWALK_SPEED);

    this.sparkleEmitter.start();
  }

  updateMoonwalk() {
    this.moonwalkTimer -= this.scene.game.loop.delta;

    // Emit sparkles at player position
    this.sparkleEmitter.setPosition(this.x, this.y + this.displayHeight / 2);
    this.sparkleEmitter.explode(2);

    if (this.moonwalkTimer <= 0) {
      this.stopMoonwalk();
    }
  }

  throwHat() {
    // Check if hat is already active (GameScene tracks this)
    if (this.scene.activeHat) return;

    this.isThrowing = true;
    this.throwCooldown = PLAYER.HAT_THROW_COOLDOWN;

    // Throw sheet faces left natively (opposite of main sprite), so invert flipX
    this.setFlipX(this.facingRight);
    this.play('mj-throw', true);
    if (this.scene.game.soundManager) this.scene.game.soundManager.playHatThrow();

    const dir = this.facingRight ? 1 : -1;
    this.scene.events.emit('playerThrow', this.x, this.y, dir);

    // Lock movement anims until throw anim finishes (4 frames at 10fps = 400ms)
    this.scene.time.delayedCall(400, () => {
      this.isThrowing = false;
      // Restore normal flipX convention
      this.setFlipX(!this.facingRight);
    });
  }

  stopMoonwalk() {
    this.isMoonwalking = false;
    this.setVelocityX(0);
    // Restore normal flipX convention (main sprite faces right natively)
    this.setFlipX(!this.facingRight);
    this.sparkleEmitter.stop();
  }

  takeDamage() {
    if (this.isHurt || this.isDead || this.isInvincible || this.isMoonwalking) return;

    if (this.scene.game.soundManager) this.scene.game.soundManager.playDamage();

    if (this.isPoweredUp) {
      // Lose power-up instead of life
      this.isPoweredUp = false;
      this.setScale(PLAYER.SCALE);
      this.isHurt = true;
      this.setTint(0xff0000);
      this.scene.time.delayedCall(PLAYER.HURT_DURATION, () => {
        this.isHurt = false;
        this.clearTint();
      });
      return;
    }

    this.lives--;
    this.scene.events.emit('livesChanged', this.lives);

    if (this.lives <= 0) {
      this.die();
      return;
    }

    // Hurt state
    this.isHurt = true;
    this.setTint(0xff0000);
    this.setVelocityY(PLAYER.JUMP_VELOCITY * 0.6);

    // Flicker effect
    this.scene.tweens.add({
      targets: this,
      alpha: 0.3,
      duration: 100,
      yoyo: true,
      repeat: 4,
      onComplete: () => {
        this.alpha = 1;
      }
    });

    this.scene.time.delayedCall(PLAYER.HURT_DURATION, () => {
      this.isHurt = false;
      this.clearTint();
    });
  }

  die() {
    if (this.isDead) return;
    this.isDead = true;
    if (this.scene.game.soundManager) this.scene.game.soundManager.playDie();
    this.setVelocityX(0);
    this.setVelocityY(PLAYER.JUMP_VELOCITY);
    this.setTint(0xff0000);
    this.body.checkCollision.none = true;

    this.scene.time.delayedCall(1500, () => {
      if (this.lives > 0) {
        this.respawn();
      } else {
        this.scene.scene.start('GameOverScene', {
          victory: false,
          score: this.score
        });
      }
    });
  }

  respawn() {
    this.isDead = false;
    this.isHurt = false;
    this.isMoonwalking = false;
    this.clearTint();
    this.body.checkCollision.none = false;
    this.setPosition(PLAYER.RESPAWN_X, PLAYER.RESPAWN_Y);
    this.setVelocity(0, 0);
    this.alpha = 1;
    this.scene.cameras.main.startFollow(this, true, 0.1, 0.1);
  }

  stompBounce() {
    this.setVelocityY(PLAYER.STOMP_BOUNCE);
  }

  addScore(points) {
    this.score += points;
    this.scene.events.emit('scoreChanged', this.score);
  }

  powerUpGrow() {
    if (this.isPoweredUp) return;
    this.isPoweredUp = true;
    this.setScale(PLAYER.SCALE * PLAYER.GROW_SCALE);
  }

  powerUpInvincible() {
    this.isInvincible = true;

    // Rainbow tint cycle
    const colors = [0xff0000, 0xff8800, 0xffff00, 0x00ff00, 0x0088ff, 0xff00ff];
    let colorIndex = 0;
    this.invincibleTimer = this.scene.time.addEvent({
      delay: 150,
      callback: () => {
        this.setTint(colors[colorIndex % colors.length]);
        colorIndex++;
      },
      loop: true
    });

    this.scene.time.delayedCall(PLAYER.INVINCIBILITY_DURATION, () => {
      this.isInvincible = false;
      if (this.invincibleTimer) this.invincibleTimer.remove();
      this.clearTint();
      if (this.scene.game.soundManager) this.scene.game.soundManager.stopInvincibility();
    });
  }

  canKill() {
    return this.isMoonwalking || this.isInvincible;
  }
}
